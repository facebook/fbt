/**
 * Copyright 2004-present Facebook. All Rights Reserved.
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
 * @typechecks
 * @format
 * @emails oncall+internationalization
 */

/* eslint max-len: ["warn", 120] */
require('FbtEnv').setupOnce();

import type {FbtInputOpts, FbtRuntimeInput, FbtTableArgs} from 'FbtHooks';

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

let jsonExportMode = false; // Used only in React Native

const {ARG} = FbtTable;

const VARIATIONS = {
  NUMBER: 0,
  GENDER: 1,
};

// Must match ValidPronounUsages in FbtConstants.js
const PRONOUN_USAGE = {
  OBJECT: 0,
  POSSESSIVE: 1,
  REFLEXIVE: 2,
  SUBJECT: 3,
};

const _cachedFbtResults = {};

const fbt = function () {};

/**
 * fbt._() iterates through all indices provided in `args` and accesses
 * the relevant entry in the `table` resulting in the appropriate
 * pattern string.  It then substitutes all relevant substitutions.
 *
 * @param {string|object|array} table - Example: {
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
 * @param {?array<array>} args - arguments from which to pull substitutions
 *    Example: [["singular", null], [null, {title: "felines!"}]]
 *
 * @param {?object} options - options for runtime
 * translation dictionary access. hk stands for hash key which is used to look
 * up translated payload in React Native. ehk stands for enum hash key which
 * contains a structured enums to hash keys map which will later be traversed
 * to look up enum-less translated payload.
 */
fbt._ = function (
  inputTable: FbtRuntimeInput,
  inputArgs: ?FbtTableArgs,
  options: ?FbtInputOpts,
): Fbt {
  // TODO T61652022: Remove this when no longer used in fbsource
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
  // WWW: The payload is ready, as-is, and is pre-translated UNLESS we detect
  //      the magic BINAST string which needs to be stripped if it exists.
  //
  // RN: we look up our translated table via the hash key (options.hk) and
  //     flattened enum hash key (options.ehk), which partially resolves the
  //     translation for the enums (should they exist).
  //
  // OSS: The table is the English payload, and, by default, we lookup the
  //      translated payload via FbtTranslations
  let {table: pattern, args} = FbtHooks.getTranslatedInput({
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
  let allSubstitutions = {};

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
      pattern = FbtTable.access(pattern, args, 0);
    }
    allSubstitutions = Object.assign(
      {},
      ...args.map(arg => arg[ARG.SUBSTITUTION] || {}),
    );
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

  const cachedFbt = _cachedFbtResults[patternString];
  const hasSubstitutions = _hasKeys(allSubstitutions);
  if (cachedFbt && !hasSubstitutions) {
    return cachedFbt;
  } else {
    const fbtContent = substituteTokens(patternString, allSubstitutions);
    const result = _wrapContent(fbtContent, patternString, patternHash);
    if (!hasSubstitutions) {
      _cachedFbtResults[patternString] = result;
    }
    return result;
  }
};

if (__DEV__) {
  fbt._getCachedFbt = s => _cachedFbtResults[s];
}

/**
 * _hasKeys takes an object and returns whether it has any keys. It purposefully
 * avoids creating the temporary arrays incurred by calling Object.keys(o)
 * @param {Object} o - Example: "allSubstitutions"
 */
function _hasKeys(o) {
  for (const k in o) {
    return true;
  }
  return false;
}

/**
 * fbt._enum() takes an enum value and returns a tuple in the format:
 * [value, null]
 * @param {string|number} value - Example: "id1"
 * @param {object} range - Example: {"id1": "groups", "id2": "videos", ...}
 */
fbt._enum = function (value, range) {
  if (__DEV__) {
    invariant(value in range, 'invalid value: %s', value);
  }
  return FbtTableAccessor.getEnumResult(value);
};

/**
 * fbt._subject() takes a gender value and returns a tuple in the format:
 * [variation, null]
 * @param {number} value - Example: "16777216"
 */
fbt._subject = function (value) {
  return FbtTableAccessor.getGenderResult(
    getGenderVariations(value),
    null,
    value,
  );
};

/**
 * fbt._param() takes a `label` and `value` returns a tuple in the format:
 * [?variation, {label: "replaces {label} in pattern string"}]
 * @param {string} label - Example: "label"
 * @param {?string|number|object|array|DOMElement} value
 *   - E.g. 'replaces {label} in pattern'
 * @param {?array} variations
 *   - E.g. [0], [0,count], or [0,foo.someNumber() + 1]
 */
fbt._param = function (label, value, variations) {
  const substitution = {[label]: value};
  if (variations) {
    if (variations[0] === VARIATIONS.NUMBER) {
      const number = variations.length > 1 ? variations[1] : value;
      invariant(typeof number === 'number', 'fbt.param expected number');

      const variation = getNumberVariations(number);
      if (typeof value === 'number') {
        substitution[label] = intlNumUtils.formatNumberWithThousandDelimiters(
          value,
        );
      }
      return FbtTableAccessor.getNumberResult(variation, substitution, number);
    } else if (variations[0] === VARIATIONS.GENDER) {
      invariant(variations.length > 1, 'expected gender value');
      const gender = variations[1];
      const variation = getGenderVariations(gender);
      return FbtTableAccessor.getGenderResult(variation, substitution, gender);
    } else {
      invariant(false, 'Unknown invariant mask');
    }
  } else {
    return FbtTableAccessor.getSubstitution(substitution);
  }
};

/**
 * fbt._plural() takes a `count` and 2 optional params: `label` and `value`.
 * It returns a tuple in the format:
 * [?variation, {label: "replaces {label} in pattern string"}]
 * @param {number} count - Example: 2
 * @param {?string} label
 *   - E.g. 'replaces {number} in pattern'
 * @param {?string} value
 *   - The value to use (instead of count) for replacing {label}
 */
fbt._plural = function (count, label, value) {
  const variation = getNumberVariations(count);
  const substitution = {};
  if (label) {
    if (typeof value === 'number') {
      substitution[label] = intlNumUtils.formatNumberWithThousandDelimiters(
        value,
      );
    } else {
      substitution[label] =
        value || intlNumUtils.formatNumberWithThousandDelimiters(count);
    }
  }
  return FbtTableAccessor.getNumberResult(variation, substitution, count);
};

/**
 * fbt._pronoun() takes a 'usage' string and a GenderConst value and returns a tuple in the format:
 * [variations, null]
 * @param {number} usage - Example: PRONOUN_USAGE.object.
 * @param {number} gender - Example: GenderConst.MALE_SINGULAR
 * @param {?object} options - Example: { human: 1 }
 */
fbt._pronoun = function (usage, gender, options) {
  invariant(
    gender !== GenderConst.NOT_A_PERSON || !options || !options.human,
    'Gender cannot be GenderConst.NOT_A_PERSON if you set "human" to true',
  );

  const genderKey = getPronounGenderKey(usage, gender);
  return FbtTableAccessor.getPronounResult(genderKey);
};

// See JSFbtTable::getPronounGenderKey().
function getPronounGenderKey(usage, gender) {
  switch (gender) {
    case GenderConst.NOT_A_PERSON:
      return usage === PRONOUN_USAGE.OBJECT || usage === PRONOUN_USAGE.REFLEXIVE
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
      return usage === PRONOUN_USAGE.REFLEXIVE
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
 * @param {string} label - Example: "label"
 * @param {?string|number|object|array|DOMElement} value
 *   - E.g. 'replaces {label} in pattern'
 * @param {number} gender - Example: "IntlVariations.GENDER_FEMALE"
 */
fbt._name = function (label, value, gender) {
  const variation = getGenderVariations(gender);
  const substitution = {};
  substitution[label] = value;
  return FbtTableAccessor.getGenderResult(variation, substitution, gender);
};

function _wrapContent(fbtContent, patternString, patternHash): Fbt {
  const contents = typeof fbtContent === 'string' ? [fbtContent] : fbtContent;
  const errorListener = FbtHooks.getErrorListener({
    translation: patternString,
    hash: patternHash,
  });
  const result = FbtHooks.getFbtResult({
    contents,
    errorListener,
    patternString,
    patternHash,
  });
  // $FlowFixMe[incompatible-return] FbtHooks.getFbtResult returns mixed.
  return result;
}

fbt.enableJsonExportMode = function () {
  jsonExportMode = true;
};

fbt.disableJsonExportMode = function () {
  jsonExportMode = false;
};

// Must define this as a standalone function
// because Flow doesn't support %check on as a class static method
function isFbtInstance(value: mixed): boolean %checks {
  return value instanceof FbtResultBase;
}

fbt.isFbtInstance = isFbtInstance;

module.exports = ((fbt: $FlowFixMe): $FbtFunctionAPI);
