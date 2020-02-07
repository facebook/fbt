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
 * @flow
 * @typechecks
 * @format
 * @emails oncall+internationalization
 */

/* eslint max-len: ["warn", 120] */
/* eslint "fb-www/avoid-this-outside-classes": "off" */
/* eslint "fb-www/order-requires": "off" */
/* eslint "fb-www/require-flow-strict-local": "off" */
require('FbtEnv').setup();

const {overrides} = require('FbtQTOverrides');
const FbtHooks = require('FbtHooks');
const FbtResultBase = require('FbtResultBase');
const FbtTableAccessor = require('FbtTableAccessor');
const FbtResult = require('FbtResult');
const GenderConst = require('GenderConst');
const IntlViewerContext = require('IntlViewerContext');

const intlNumUtils = require('intlNumUtils');
const invariant = require('invariant');
const substituteTokens = require('substituteTokens');
const {
  getNumberVariations,
  getGenderVariations,
} = require('IntlVariationResolver');

import type {FbtInputOpts, FbtRuntimeInput, FbtTableArgs} from 'FbtHooks';

let jsonExportMode = false; // Used only in React Native

/**
 * fbt.XXX calls return arguments in the form of
 * [<INDEX>, <SUBSTITUTION>] to be processed by fbt._
 */
const ARG = {
  INDEX: 0,
  SUBSTITUTION: 1,
};

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

const fbt = function() {};

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
fbt._ = function(
  inputTable: FbtRuntimeInput,
  inputArgs: ?FbtTableArgs,
  options: ?FbtInputOpts,
): Fbt {
  // TODO T61652022: Remove this when no longer used in fbsource
  if ((options?.hk || options?.ehk) && jsonExportMode) {
    // $FlowFixMe: breaking typing because this should never happen
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
  // OSS: The table is the English payload, and we lookup the translated payload
  //      via FbtTranslations
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

  if (pattern.__vcg) {
    args = args || [];
    const {GENDER} = IntlViewerContext;
    const variation = getGenderVariations(GENDER);
    args.unshift(FbtTableAccessor.getGenderResult(variation, null, GENDER));
  }

  if (args) {
    if (typeof pattern !== 'string') {
      // On mobile, table can be accessed at the native layer when fetching
      // translations. If pattern is not a string here, table has not been accessed
      pattern = _accessTable(pattern, args, 0);
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
    // $FlowFixMe pattern is the tuple [string, string]
    const stringID = '1_' + patternHash;
    patternString = overrides[stringID] || patternString;
    if (overrides[stringID]) {
      FbtHooks.onTranslationOverride(patternHash);
    }
    FbtHooks.logImpression(patternHash);
  } else if (typeof pattern === 'string') {
    patternString = pattern;
  } else {
    const msg = pattern === undefined ? 'undefined' : JSON.stringify(pattern);
    throw new Error('Table access did not result in string: ' + msg);
  }

  const cachedFbt = _cachedFbtResults[patternString];
  const hasSubstitutions = this._hasKeys(allSubstitutions);
  if (cachedFbt && !hasSubstitutions) {
    return cachedFbt;
  } else {
    const fbtContent = substituteTokens(patternString, allSubstitutions);
    const result = this._wrapContent(fbtContent, patternString, patternHash);
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
 * fbt._hasKeys takes an object and returns whether it has 0
 * keys. It purposefully avoids creating the temporary arrays
 * incurred by calling Object.keys(o)
 * @param {Object} o - Example: "allSubstitutions"
 */

fbt._hasKeys = function(o) {
  for (const k in o) {
    return true;
  }
  return false;
};

/**
 * Performs a depth-first search on our table, attempting to access
 * each table entry.  The first entry found is the one we want, as we
 * set defaults after preferred indices.  For example:
 *
 * @param @table - {
 *   // viewer gender
 *   '*': {
 *     // {num} plural
 *     '*': {
 *       // user-defined enum
 *       LIKE: '{num} people liked your update',
 *       COMMENT: '{num} people commented on your update',
 *       POST: '{num} people posted on a wall',
 *     },
 *     SINGULAR: {
 *       LIKE: '{num} person liked your update',
 *       // ...
 *     },
 *     DUAL: { ... }
 *   },
 *   FEMALE: {
 *     // {num} plural
 *     '*': { ... },
 *     SINGULAR: { ... },
 *     DUAL: { ... }
 *   },
 *   MALE: { ... }
 * }
 *
 * Notice that LIKE and COMMENT here both have 'your' in them, whereas
 * POST doesn't.  The fallback ('*') translation for POST will be the same
 * in both the male and female version, so that entry won't exist under
 *   table[FEMALE]['*'] or table[MALE]['*'].
 *
 * Similarly, PLURAL is a number variation that never appears in the table as it
 * is the default/fallback.
 *
 * For example, if we have a female viewer, and a PLURAL number and a POST enum
 * value, in the above example, we'll first attempt to get:
 * table[FEMALE][PLURAL][POST].  undefined. Back Up, attempting to get
 * table[FEMALE]['*'][POST].  undefined also. since it's the same as the '*'
 * table['*'][PLURAL][POST].  ALSO undefined. Deduped to '*'
 * table['*']['*'][POST].  There it is.
 *
 * @param args      - fbt runtime arguments
 * @param argsIndex - argument index we're currently visiting
 */
function _accessTable(
  table: ?FbtRuntimeInput,
  args: FbtTableArgs,
  argsIndex: number,
): ?string | [string, string] {
  if (argsIndex >= args.length) {
    // We've reached the end of our arguments at a valid entry, in which case
    // table is now a string (leaf)
    // $FlowFixMe string is incompatible FbtInputTable type
    return table;
  } else if (table == null) {
    // We've accessed a key that didn't exist in the table
    return null;
  }
  const arg = args[argsIndex];
  const tableIndices = arg[ARG.INDEX];

  if (tableIndices == null) {
    return _accessTable(table, args, argsIndex + 1);
  }
  invariant(
    typeof table !== 'string',
    'If tableIndex is non-null, we should have a table, but we got: %s',
    table,
  );
  // Is there a variation? Attempt table access in order of variation preference
  for (let k = 0; k < tableIndices.length; ++k) {
    const key = tableIndices[k];
    // table isn't a tuple here, but flow thinks it could be
    // $FlowFixMe string is not an array index
    const subTable = table[key];
    const pattern = _accessTable(subTable, args, argsIndex + 1);
    if (pattern != null) {
      return pattern;
    }
  }
  return null;
}

/**
 * fbt._enum() takes an enum value and returns a tuple in the format:
 * [value, null]
 * @param {string|number} value - Example: "id1"
 * @param {object} range - Example: {"id1": "groups", "id2": "videos", ...}
 */
fbt._enum = function(value, range) {
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
fbt._subject = function(value) {
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
fbt._param = function(label, value, variations) {
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
fbt._plural = function(count, label, value) {
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
fbt._pronoun = function(usage, gender, options) {
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

    case GenderConst.MIXED_SINGULAR: // And MIXED_PLURAL; they have the same integer values.
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
fbt._name = function(label, value, gender) {
  const variation = getGenderVariations(gender);
  const substitution = {};
  substitution[label] = value;
  return FbtTableAccessor.getGenderResult(variation, substitution, gender);
};

fbt._wrapContent = (fbtContent, patternString, patternHash) => {
  const contents = typeof fbtContent === 'string' ? [fbtContent] : fbtContent;
  const errorListener = FbtHooks.getErrorListener({
    translation: patternString,
    hash: patternHash,
  });
  return FbtHooks.getFbtResult({
    contents,
    errorListener,
    patternString,
    patternHash,
  });
};

fbt.enableJsonExportMode = function() {
  jsonExportMode = true;
};

fbt.disableJsonExportMode = function() {
  jsonExportMode = false;
};

fbt.isFbtInstance = function(value: mixed): boolean {
  return value instanceof FbtResultBase;
};

module.exports = ((fbt: $FlowFixMe): $FbtFunctionAPI);
