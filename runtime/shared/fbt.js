/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * Flow doesn't know about the transformations of fbt() calls into tables, so
 * all it sees is that callers are adding strings and arrays, which isn't
 * allowed so flow for this file is ignored in .flowconfig.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p fbt --local ~/www
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 * @typechecks
 */

/* eslint-disable fb-www/order-requires */
import type {
  ExtraOptionValues,
  FbtInputOpts,
  FbtRuntimeInput,
  FbtTableArgs,
} from 'FbtHooks';
import type {ParamVariationType, ValidPronounUsagesType} from 'FbtRuntimeTypes';
import type {FbtTableKey, PatternHash, PatternString} from 'FbtTable';
import type {FbtTableArg} from 'FbtTableAccessor';
import type {GenderConstEnum} from 'GenderConst';

const FbtEnv = require('FbtEnv');
FbtEnv.setupOnce();

const FbtHooks = require('FbtHooks');
const {overrides} = require('FbtQTOverrides');
const FbtResultBase = require('FbtResultBase');
const FbtTable = require('FbtTable');
const FbtTableAccessor = require('FbtTableAccessor');
const GenderConst = require('GenderConst');
const {
  getGenderVariations,
  getNumberVariations,
} = require('IntlVariationResolver');

const intlNumUtils = require('intlNumUtils');
const invariant = require('invariant');
const substituteTokens = require('substituteTokens');

/*
 * $FlowFixMe[method-unbinding] Use original method in case the token names contain
 * a 'hasOwnProperty' key too; or if userland code redefined that method.
 */
const {hasOwnProperty} = Object.prototype;

let jsonExportMode = false; // Used only in React Native

const {ARG} = FbtTable;

const ParamVariation: ParamVariationType = {
  number: 0,
  gender: 1,
};

const ValidPronounUsages: ValidPronounUsagesType = {
  object: 0,
  possessive: 1,
  reflexive: 2,
  subject: 3,
};

const cachedFbtResults: {[patternStr: PatternString]: Fbt} = {};

/**
 * fbt._() iterates through all indices provided in `args` and accesses
 * the relevant entry in the `table` resulting in the appropriate
 * pattern string.  It then substitutes all relevant substitutions.
 *
 * @param inputTable - Example: {
 *   "singular": "You have a cat in a photo album named {title}",
 *   "plural": "You have cats in a photo album named {title}"
 * }
 * -or-
 * {
 *   "singular": ["You have a cat in a photo album named {title}", <hash>],
 *   "plural": ["You have cats in a photo album named {title}", <hash>]
 * }
 *
 * or table can simply be a pattern string:
 *   "You have a cat in a photo album named {title}"
 * -or-
 *    ["You have a cat in a photo album named {title}", <hash>]
 *
 * @param inputArgs - arguments from which to pull substitutions
 *    Example: [["singular", null], [null, {title: "felines!"}]]
 *
 * @param options - options for runtime
 * translation dictionary access. hk stands for hash key which is used to look
 * up translated payload in React Native. ehk stands for enum hash key which
 * contains a structured enums to hash keys map which will later be traversed
 * to look up enum-less translated payload.
 */
/* $FlowFixMe[missing-this-annot] The 'this' type annotation(s) required by
 * Flow's LTI update could not be added via codemod */
function fbtCallsite(
  inputTable: FbtRuntimeInput,
  inputArgs: ?FbtTableArgs,
  options: ?FbtInputOpts,
): Fbt {
  // TODO T61652022: Remove this when no longer used in fbsource
  // $FlowFixMe[sketchy-null-string]
  if ((options?.hk || options?.ehk) && jsonExportMode) {
    /* $FlowFixMe[incompatible-return] : breaking typing because this should
     * never happen */
    return {
      text: inputTable,
      fbt: true,
      hashKey: options.hk,
    };
  }

  // Adapt the input payload to the translated table and arguments we expect
  //
  // WWW: The payload is ready, as-is, and is pre-translated.
  //
  // RN: we look up our translated table via the hash key (options.hk) and
  //     flattened enum hash key (options.ehk), which partially resolves the
  //     translation for the enums (should they exist).
  //
  // OSS: The table is the English payload, and, by default, we lookup the
  //      translated payload via FbtTranslations
  let {args, table: pattern} = FbtHooks.getTranslatedInput({
    table: inputTable,
    args: inputArgs,
    options,
  });

  // [fbt_impressions]
  // If this is a string literal (no tokens to substitute) then 'args' is empty
  // and the logic will skip the table traversal.

  // [table traversal]
  // At this point we assume that table is a hash (possibly nested) that we
  // need to traverse in order to pick the correct string, based on the
  // args that follow.
  let allSubstitutions: {[string]: mixed} = {};

  if (pattern.__vcg != null) {
    args = args || [];
    const {GENDER} = FbtHooks.getViewerContext();
    const variation = getGenderVariations(GENDER);
    args.unshift(FbtTableAccessor.getGenderResult(variation, null, GENDER));
  }

  if (args) {
    if (typeof pattern !== 'string') {
      // On mobile, table can be accessed at the native layer when fetching
      // translations. If pattern is not a string here, table has not been accessed
      // $FlowFixMe[incompatible-type]
      pattern = FbtTable.access(pattern, args, 0);
    }

    allSubstitutions = getAllSubstitutions(args);
    invariant(pattern !== null, 'Table access failed');
  }

  let patternString, patternHash;
  if (Array.isArray(pattern)) {
    // [fbt_impressions]
    // When logging of string impressions is enabled, the string and its hash
    // are packaged in an array. We want to log the hash
    patternString = pattern[0];
    patternHash = pattern[1];
    // Append '1_' for appid's prepended to our i18n hash
    // (see intl_get_application_id)
    const stringID = '1_' + patternHash;
    if (overrides[stringID] != null && overrides[stringID] !== '') {
      patternString = overrides[stringID];
      FbtHooks.onTranslationOverride(patternHash);
    }
    FbtHooks.logImpression(patternHash);
  } else if (typeof pattern === 'string') {
    patternString = pattern;
  } else {
    throw new Error(
      'Table access did not result in string: ' +
        (pattern === undefined ? 'undefined' : JSON.stringify(pattern)) +
        ', Type: ' +
        typeof pattern,
    );
  }

  const cachedFbt = cachedFbtResults[patternString];
  const hasSubstitutions = _hasKeys(allSubstitutions);

  if (cachedFbt && !hasSubstitutions) {
    return cachedFbt;
  } else {
    const fbtContent = substituteTokens(patternString, allSubstitutions);
    // Use this._wrapContent voluntarily so that it can be overwritten in fbs.js
    const result = this._wrapContent(
      fbtContent,
      patternString,
      patternHash,
      options?.eo,
    );
    if (!hasSubstitutions) {
      cachedFbtResults[patternString] = result;
    }
    return result;
  }
}

function getAllSubstitutions(args: FbtTableArgs | Array<FbtTableArg>) {
  const allSubstitutions: {[string]: mixed} = {};
  args.forEach(arg => {
    const substitution = arg[ARG.SUBSTITUTION];
    if (!substitution) {
      return;
    }
    for (const tokenName in substitution) {
      if (hasOwnProperty.call(substitution, tokenName)) {
        invariant(
          allSubstitutions[tokenName] == null,
          'Cannot register a substitution with token=`%s` more than once',
          tokenName,
        );
        allSubstitutions[tokenName] = substitution[tokenName];
      }
    }
  });
  return allSubstitutions;
}

/**
 * _hasKeys takes an object and returns whether it has any keys. It purposefully
 * avoids creating the temporary arrays incurred by calling Object.keys(o)
 * @param {Object} o - Example: "allSubstitutions"
 */
function _hasKeys(o: {[string]: mixed}) {
  for (const k in o) {
    return true;
  }
  return false;
}

/**
 * fbt._enum() takes an enum value and returns a tuple in the format:
 * [value, null]
 * @param value - Example: "id1"
 * @param range - Example: {"id1": "groups", "id2": "videos", ...}
 */
function fbtEnum(
  value: FbtTableKey,
  range: {[enumKey: string]: string},
): FbtTableArg {
  if (__DEV__) {
    invariant(value in range, 'invalid value: %s', value);
  }
  return FbtTableAccessor.getEnumResult(value);
}

/**
 * fbt._subject() takes a gender value and returns a tuple in the format:
 * [variation, null]
 * @param value - Example: "16777216"
 */
function fbtSubject(value: GenderConstEnum): FbtTableArg {
  return FbtTableAccessor.getGenderResult(
    getGenderVariations(value),
    null,
    value,
  );
}

/**
 * fbt._param() takes a `label` and `value` returns a tuple in the format:
 * [?variation, {label: "replaces {label} in pattern string"}]
 * @param label - Example: "label"
 * @param value
 *   - E.g. 'replaces {label} in pattern'
 * @param variations Variation type and variation value (if explicitly provided)
 *   E.g.
 *   number: `[0]`, `[0, count]`, or `[0, foo.someNumber() + 1]`
 *   gender: `[1, someGender]`
 */
function fbtParam(
  label: string,
  value: mixed,
  variations?:
    | [$PropertyType<ParamVariationType, 'number'>, ?number]
    | [$PropertyType<ParamVariationType, 'gender'>, GenderConstEnum],
): FbtTableArg {
  const substitution: {[string]: mixed} = {[label]: value};
  if (variations) {
    if (variations[0] === ParamVariation.number) {
      const number = variations.length > 1 ? variations[1] : value;
      invariant(typeof number === 'number', 'fbt.param expected number');

      const variation = getNumberVariations(number); // this will throw if `number` is invalid
      if (typeof value === 'number') {
        substitution[label] =
          intlNumUtils.formatNumberWithThousandDelimiters(value);
      }
      return FbtTableAccessor.getNumberResult(variation, substitution, number);
    } else if (variations[0] === ParamVariation.gender) {
      const gender = variations[1];
      invariant(gender != null, 'expected gender value');
      return FbtTableAccessor.getGenderResult(
        getGenderVariations(gender),
        substitution,
        gender,
      );
    } else {
      invariant(false, 'Unknown invariant mask');
    }
  } else {
    return FbtTableAccessor.getSubstitution(substitution);
  }
}

/**
 * fbt._implicitParam() behaves like fbt._param()
 */
/* $FlowFixMe[missing-this-annot] The 'this' type annotation(s) required by
 * Flow's LTI update could not be added via codemod */
function fbtImplicitParam(
  label: string,
  value: mixed,
  variations?:
    | [$PropertyType<ParamVariationType, 'number'>, ?number]
    | [$PropertyType<ParamVariationType, 'gender'>, GenderConstEnum],
): FbtTableArg {
  return this._param(label, value, variations);
}

/**
 * fbt._plural() takes a `count` and 2 optional params: `label` and `value`.
 * It returns a tuple in the format:
 * [?variation, {label: "replaces {label} in pattern string"}]
 * @param count - Example: 2
 * @param label
 *   - E.g. 'replaces {number} in pattern'
 * @param value
 *   - The value to use (instead of count) for replacing {label}
 */
function fbtPlural(count: number, label: ?string, value?: mixed): FbtTableArg {
  const variation = getNumberVariations(count);
  const substitution: {[string]: mixed} = {};
  // $FlowFixMe[sketchy-null-string]
  if (label) {
    if (typeof value === 'number') {
      substitution[label] =
        intlNumUtils.formatNumberWithThousandDelimiters(value);
    } else {
      substitution[label] =
        // $FlowFixMe[sketchy-null-mixed]
        value || intlNumUtils.formatNumberWithThousandDelimiters(count);
    }
  }
  return FbtTableAccessor.getNumberResult(variation, substitution, count);
}

/**
 * fbt._pronoun() takes a 'usage' string and a GenderConst value and returns a tuple in the format:
 * [variations, null]
 * @param usage - Example: PronounUsage.object.
 * @param gender - Example: GenderConst.MALE_SINGULAR
 * @param options - Example: { human: 1 }
 */
function fbtPronoun(
  usage: $Values<typeof ValidPronounUsages>,
  gender: GenderConstEnum,
  options: ?{human?: 1},
): FbtTableArg {
  invariant(
    gender !== GenderConst.NOT_A_PERSON || !options || !options.human,
    'Gender cannot be GenderConst.NOT_A_PERSON if you set "human" to true',
  );

  const genderKey = getPronounGenderKey(usage, gender);
  return FbtTableAccessor.getPronounResult(genderKey);
}

/**
 * Must match implementation from babel-plugin-fbt/src/fbt-nodes/FbtPronounNode.js
 */
function getPronounGenderKey(usage: 0 | 1 | 2 | 3, gender: GenderConstEnum) {
  switch (gender) {
    case GenderConst.NOT_A_PERSON:
      return usage === ValidPronounUsages.object ||
        usage === ValidPronounUsages.reflexive
        ? GenderConst.NOT_A_PERSON
        : GenderConst.UNKNOWN_PLURAL;

    case GenderConst.FEMALE_SINGULAR:
    case GenderConst.FEMALE_SINGULAR_GUESS:
      return GenderConst.FEMALE_SINGULAR;

    case GenderConst.MALE_SINGULAR:
    case GenderConst.MALE_SINGULAR_GUESS:
      return GenderConst.MALE_SINGULAR;

    case GenderConst.MIXED_UNKNOWN:
    case GenderConst.FEMALE_PLURAL:
    case GenderConst.MALE_PLURAL:
    case GenderConst.NEUTER_PLURAL:
    case GenderConst.UNKNOWN_PLURAL:
      return GenderConst.UNKNOWN_PLURAL;

    case GenderConst.NEUTER_SINGULAR:
    case GenderConst.UNKNOWN_SINGULAR:
      return usage === ValidPronounUsages.reflexive
        ? GenderConst.NOT_A_PERSON
        : GenderConst.UNKNOWN_PLURAL;
  }

  // Mirrors the behavior of :fbt:pronoun when an unknown gender value is given.
  return GenderConst.NOT_A_PERSON;
}

/**
 * fbt.name() takes a `label`, `value`, and `gender` and
 * returns a tuple in the format:
 * [gender, {label: "replaces {label} in pattern string"}]
 * @param label - Example: "label"
 * @param value
 *   - E.g. 'replaces {label} in pattern'
 * @param gender - Example: "IntlVariations.GENDER_FEMALE"
 */
function fbtName(
  label: string,
  value: mixed,
  gender: GenderConstEnum,
): FbtTableArg {
  const variation = getGenderVariations(gender);
  const substitution: {[string]: mixed} = {};
  substitution[label] = value;
  return FbtTableAccessor.getGenderResult(variation, substitution, gender);
}

function wrapContent(
  fbtContent: $NestedFbtContentItems | string,
  translation: PatternString,
  hash: ?PatternHash,
  extraOptions: ?ExtraOptionValues,
): Fbt {
  const contents = typeof fbtContent === 'string' ? [fbtContent] : fbtContent;
  const errorListener = FbtHooks.getErrorListener({
    translation,
    hash,
  });
  const result = FbtHooks.getFbtResult({
    contents,
    errorListener,
    extraOptions,
    patternHash: hash,
    patternString: translation,
  });
  // $FlowFixMe[incompatible-return] FbtHooks.getFbtResult returns mixed.
  return result;
}

function enableJsonExportMode(): void {
  jsonExportMode = true;
}

function disableJsonExportMode(): void {
  jsonExportMode = false;
}

// Must define this as a standalone function
// because Flow doesn't support %check on as a class static method
function isFbtInstance(value: mixed): boolean %checks {
  return value instanceof FbtResultBase;
}

const fbt = function () {};
fbt._ = fbtCallsite;
fbt._enum = fbtEnum;
fbt._implicitParam = fbtImplicitParam;
fbt._name = fbtName;
fbt._param = fbtParam;
fbt._plural = fbtPlural;
fbt._pronoun = fbtPronoun;
fbt._subject = fbtSubject;
fbt._wrapContent = wrapContent;
fbt.disableJsonExportMode = disableJsonExportMode;
fbt.enableJsonExportMode = enableJsonExportMode;
fbt.isFbtInstance = isFbtInstance;

fbt._getCachedFbt = __DEV__
  ? (s: string): Fbt => cachedFbtResults[s]
  : undefined;

// $FlowFixMe[incompatible-type]
// $FlowFixMe[prop-missing]
const out: $FbtFunctionAPI = fbt;
module.exports = out;
