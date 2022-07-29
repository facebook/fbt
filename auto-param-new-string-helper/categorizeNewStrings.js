/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @format
 * @noflow
 * @oncall i18n_fbt_js
 */

const {
  areNewAndLegacyLeavesIdentical,
  forEachPairOfNewAndLegacyPhrase,
} = require('./newAndLegacyPhraseComparisonUtil');
const path = require('path');
const process = require('process');

const legacyPhrasesFile = path.resolve(process.argv[2]);
const newPhrasesFile = path.resolve(process.argv[3]);
const shouldReturnPhraseWithNewHashKey =
  process.argv[4] === '--return-new-hash-key';

const legacyPhrases = require(legacyPhrasesFile);
const newPhrases = require(newPhrasesFile);

const HASH_TO_LEAF = 'hashToLeaf';
const HASH_TO_TEXT = 'hashToText';
// Please keep this in sync with https://fburl.com/code/3tjesmtm
const CATEGORY = {
  SAME_HASH_BUT_ADDITIONAL_IMPLICIT_VARIATIONS:
    'SAME_HASH_BUT_ADDITIONAL_IMPLICIT_VARIATIONS',
  UPDATED_TEXT_DUE_TO_VARIATIONS_IN_INNER_STRING:
    'UPDATED_TEXT_DUE_TO_VARIATIONS_IN_INNER_STRING',
  UPDATED_TEXT_DUE_TO_REPLACING_HIDDEN_TOKEN_WITH_VARIATIONS:
    'UPDATED_TEXT_DUE_TO_REPLACING_HIDDEN_TOKEN_WITH_VARIATIONS',
  UPDATED_TEXT_DUE_TO_HIDDEN_INNER_STRING_TOKEN_NAME:
    'UPDATED_TEXT_DUE_TO_HIDDEN_INNER_STRING_TOKEN_NAME',
  UPDATED_TEXT_DUE_TO_LEADING_OR_TRIALING_SPACE:
    'UPDATED_TEXT_DUE_TO_LEADING_OR_TRIALING_SPACE',
  UPDATED_TEXT_DUE_TO_FIXING_UNPRESERVED_WHITESPACES:
    'UPDATED_TEXT_DUE_TO_FIXING_UNPRESERVED_WHITESPACES',
  UPDATED_TEXT_DUE_TO_OTHER_REASON: 'UPDATED_TEXT_DUE_TO_OTHER_REASON',
  UPDATED_DESC_DUE_TO_SPACES_IN_FRONT_OF_INNER_STRINGS:
    'UPDATED_DESC_DUE_TO_SPACES_IN_FRONT_OF_INNER_STRINGS',
  UPDATED_DESC_DUE_TO_HIDDEN_FBT_PARAM_TOKEN_NAME:
    'UPDATED_DESC_DUE_TO_HIDDEN_FBT_PARAM_TOKEN_NAME',
  UPDATED_DESC_DUE_TO_VARIATIONS: 'UPDATED_DESC_DUE_TO_VARIATIONS',
  UPDATED_DESC_DUE_TO_HIDDEN_TOKEN_AND_ADDED_VARIATIONS:
    'UPDATED_DESC_DUE_TO_HIDDEN_TOKEN_AND_ADDED_VARIATIONS',
  UPDATED_DESC_DUE_TO_OTHER_REASON: 'UPDATED_DESC_DUE_TO_OTHER_REASON',
  // A new string's `hash_key` could be different from the old one for two reasons:
  //  1. the new string has updated text or description
  //  2. the new string has the same text and descrition as the legacy string,
  //    but it now has `tokenAliases` because it contains inner strings
  //
  // Category `SAME_HASH_BUT_UPDATED_HASH_KEY` only covers the second type.
  SAME_HASH_BUT_UPDATED_HASH_KEY: 'SAME_HASH_BUT_UPDATED_HASH_KEY',
};

/**
 * Compare each pair of new phrase and legacy phrase, and categorize any new string
 * found in the legacy phrase.
 * Read https://fburl.com/gdoc/d7evsumh for detailed categorization results and
 * examples.
 */
const categoryToCnt = {};
const newStringByCategory = {};
const addedPhrases = [];
const removedPhrases = [];
Object.keys(CATEGORY).map(category => {
  categoryToCnt[category] = 0;
  newStringByCategory[category] = {};
});
forEachPairOfNewAndLegacyPhrase(
  newPhrases,
  legacyPhrases,
  (newPhrase, legacyPhrase) =>
    categorizeStringsInPhrase(newPhrase, legacyPhrase, newStringByCategory),
  (newPhrase, _) => addedPhrases.push(newPhrase),
  (_, legacyPhrase) => removedPhrases.push(legacyPhrase),
);
Object.keys(CATEGORY).map(category => {
  categoryToCnt[category] = Object.keys(newStringByCategory[category]).length;
});
console.log(
  JSON.stringify(
    {categoryToCnt, newStringByCategory, addedPhrases, removedPhrases},
    null,
    2,
  ),
);

/**
 * Compare a phrase with its legacy phrase and categorize every new string
 */
function categorizeStringsInPhrase(
  newPhrase,
  legacyPhraseMaybeInLegacyShape,
  newStringByCategory,
) /*: void */ {
  const legacyPhrase = convertLegacyPhraseToNewShape(
    legacyPhraseMaybeInLegacyShape,
  );
  const legacyLeaves = legacyPhrase[HASH_TO_LEAF];
  const newLeaves = newPhrase[HASH_TO_LEAF];
  if (areNewAndLegacyLeavesIdentical(newLeaves, legacyLeaves)) {
    const commonResult = {
      project: newPhrase.project,
      filepath: newPhrase.filepath,
      lineBeg: newPhrase.line_beg,
      lineEnd: newPhrase.line_end,
      hashKey: newPhrase.hash_key,
      legacyHashKey: legacyPhrase.hash_key,
    };
    if (
      newPhrase.hash_key !== legacyPhrase.hash_key &&
      shouldReturnPhraseWithNewHashKey
    ) {
      for (const [hash, {desc, text}] of Object.entries(newLeaves)) {
        newStringByCategory[CATEGORY.SAME_HASH_BUT_UPDATED_HASH_KEY][hash] = {
          ...commonResult,
          legacyHash: hash,
          text,
          legacyText: text,
          desc,
          legacyDesc: desc,
        };
      }
      return;
    }
    const {m: mNew} = newPhrase.jsfbt;
    const {m: mOld} = legacyPhrase.jsfbt;
    if (mNew.length > mOld.length) {
      for (const [hash, {desc, text}] of Object.entries(newLeaves)) {
        newStringByCategory[
          CATEGORY.SAME_HASH_BUT_ADDITIONAL_IMPLICIT_VARIATIONS
        ][hash] = {
          legacyHash: hash,
          text,
          legacyText: text,
          desc,
          legacyDesc: desc,
          legacyM: JSON.stringify(mOld),
          m: JSON.stringify(mNew),
          ...commonResult,
        };
      }
    }
    return;
  }
  // Categorize each leaf(which is potentially upgraded) in the new phrase
  const legacyTexts = Object.values(legacyLeaves).map(({text}) => text);
  Object.entries(newLeaves).map(newLeaf => {
    if (legacyTexts.includes(newLeaf[1].text)) {
      categorizeLeafWithUnchangedText(
        newLeaf,
        legacyLeaves,
        newStringByCategory,
        newPhrase,
        legacyPhrase,
      );
      return;
    }
    categorizeLeafWithUpdatedText(
      newLeaf,
      legacyLeaves,
      newStringByCategory,
      newPhrase,
      legacyPhrase,
    );
  });
}

/**
 * Categorize a string(`newLeaf`) whose `text` is updated
 */
function categorizeLeafWithUpdatedText(
  newLeaf,
  legacyLeaves,
  newStringByCategory,
  newPhrase,
  legacyPhrase,
) /*: void */ {
  const innerStringTokenRegex = /{=[^}]+}/g;
  const spaceRegex = /\s/g;
  const {m: mNew} = newPhrase.jsfbt;
  const {m: mOld} = legacyPhrase.jsfbt;
  const [hash, {desc, text}] = newLeaf;
  for (const [
    legacyHash,
    {desc: legacyDesc, text: legacyText},
  ] of Object.entries(legacyLeaves)) {
    const result = {
      legacyHash,
      text,
      legacyText,
      desc,
      legacyDesc,
      hashKey: newPhrase.hash_key,
      legacyHashKey: legacyPhrase.hash_key,
      project: newPhrase.project,
      filepath: newPhrase.filepath,
      lineBeg: newPhrase.line_beg,
      lineEnd: newPhrase.line_end,
    };

    // CASE 1:
    // Inner string token is mis-represented as "{=}" in legacy string.
    // Consider this fbt:
    if (
      legacyText.indexOf('{=}') !== -1 &&
      // After fixing the hidden token {=}, the legacy text and new text should be identical
      text.replace(innerStringTokenRegex, '') === legacyText.replace(/{=}/g, '')
    ) {
      if (mNew.length > mOld.length) {
        // If new phrase has new variations, they must be in an inner string
        newStringByCategory[
          CATEGORY.UPDATED_TEXT_DUE_TO_REPLACING_HIDDEN_TOKEN_WITH_VARIATIONS
        ][hash] = result;
      } else {
        newStringByCategory[
          CATEGORY.UPDATED_TEXT_DUE_TO_HIDDEN_INNER_STRING_TOKEN_NAME
        ][hash] = result;
      }
      return;
    }

    // CASE 2:
    // The new string differs from the legacy string due to updated text variation.
    // When an fbt callsite have string variation arguments nested inside of inner strings,
    // new string collection script will extract more variation strings in this scenario.
    if (
      text.replace(innerStringTokenRegex, '') ===
      // With inner string and hidden token removed, the legacy string should be the same as inner string
      legacyText.replace(innerStringTokenRegex, '').replace(/{=}/g, '')
    ) {
      newStringByCategory[
        CATEGORY.UPDATED_TEXT_DUE_TO_VARIATIONS_IN_INNER_STRING
      ][hash] = result;
      return;
    }

    // CASE 3:
    // Some legacy strings have leading and trailing space(s), whereas new strings are always
    // trimmed on both ends.
    if (text === legacyText.trim()) {
      newStringByCategory[
        CATEGORY.UPDATED_TEXT_DUE_TO_LEADING_OR_TRIALING_SPACE
      ][hash] = result;
      return;
    }

    // CASE 4:
    // White spaces (including \t and \n) were sometimes not preserved in old
    // string.
    if (text.replace(spaceRegex, '') === legacyText.replace(spaceRegex, '')) {
      newStringByCategory[
        CATEGORY.UPDATED_TEXT_DUE_TO_FIXING_UNPRESERVED_WHITESPACES
      ][hash] = result;
      return;
    }
  }
  newStringByCategory[CATEGORY.UPDATED_TEXT_DUE_TO_OTHER_REASON][hash] = {
    text,
    desc,
    legacyLeaves,
  };
}

/**
 * Categorize a string(`newLeaf`) whose `text` is identical to an existing string but
 * `desc` is potentially different
 */
function categorizeLeafWithUnchangedText(
  newLeaf,
  legacyLeaves,
  newStringByCategory,
  newPhrase,
  legacyPhrase,
) /*: void */ {
  const legacyLeavesWithSameText = Object.entries(legacyLeaves).filter(
    ([_, {text: legacyText}]) => newLeaf[1].text === legacyText,
  );
  if (legacyLeavesWithSameText.length !== 1) {
    const err = new Error(
      'A string extracted from OSS script should have at most one legacy string with the same text.',
    );
    err.stack;
    throw err;
  }

  const legacyLeaf = legacyLeavesWithSameText[0];
  const [legacyHash, {text: legacyText}] = legacyLeaf;
  let {desc: legacyDesc} = legacyLeaf[1];
  const [hash, {text}] = newLeaf;
  let {desc} = newLeaf[1];
  if (hash === legacyHash) {
    return;
  }

  const result = {
    legacyHash,
    text,
    legacyText,
    desc,
    legacyDesc,
    hashKey: newPhrase.hash_key,
    legacyHashKey: legacyPhrase.hash_key,
    project: newPhrase.project,
    filepath: newPhrase.filepath,
    lineBeg: newPhrase.line_beg,
    lineEnd: newPhrase.line_end,
  };
  // CASE 1:
  // When generating descriptions, the legacy script does not respect
  // the explicit whitespaces in front of inner strings. On the contrary, explicit
  // whitespaces are always included in the description by the new string collection script.
  if (
    (desc = desc.replace(/\s*{=/g, '{=')) ===
    (legacyDesc = legacyDesc.replace(/\s*{=/g, '{='))
  ) {
    newStringByCategory[
      CATEGORY.UPDATED_DESC_DUE_TO_SPACES_IN_FRONT_OF_INNER_STRINGS
    ][hash] = result;
    return;
  }
  // CASE 2:
  // New string is created due to added variations in description.
  const {m: mNew} = newPhrase.jsfbt;
  const {m: mOld} = legacyPhrase.jsfbt;
  const innerStringTokenRegex = /\s*{=[^}]+}\s*/g;
  if (
    mNew.length > mOld.length ||
    // This is the case where the `newPhrase` is an inner string and it contains variations
    desc.replace(innerStringTokenRegex, '') ===
      legacyDesc.replace(innerStringTokenRegex, '')
  ) {
    if (legacyDesc.indexOf('{=}') !== -1) {
      newStringByCategory[
        CATEGORY.UPDATED_DESC_DUE_TO_HIDDEN_TOKEN_AND_ADDED_VARIATIONS
      ][hash] = result;
    } else {
      newStringByCategory[CATEGORY.UPDATED_DESC_DUE_TO_VARIATIONS][hash] =
        result;
    }
    return;
  }
  // CASE 3:
  // Fbt:param construct are mis-represented as "{=}" in the string description
  // by the legacy script. In the latest version, "{=}" is replaced with the
  // actual param name, which causes new descriptions to be generated.
  if (legacyDesc.indexOf('{=}') !== -1) {
    newStringByCategory[
      CATEGORY.UPDATED_DESC_DUE_TO_HIDDEN_FBT_PARAM_TOKEN_NAME
    ][hash] = result;
    return;
  }
  // CASE 4:
  // Other small un-categorizable changes
  newStringByCategory[CATEGORY.UPDATED_DESC_DUE_TO_OTHER_REASON][hash] = {
    ...result,
    legacyJsfbt: legacyPhrase.jsfbt,
  };
}

/**
 * If the phrase is in legacy format, this function converts it to the new
 * phrase format:
 *  1. Replace `hashToText` with `hashToLeaf`
 *  2. Replace plain text `jsfbt` with `{t: {text: ..., desc: ....}, m: []}`
 *  3. Remove `desc` and `type`
 */
function convertLegacyPhraseToNewShape(legacyPhrase) {
  const {desc} = legacyPhrase;
  const hashToText = legacyPhrase[HASH_TO_TEXT];
  if (desc == null && hashToText == null) {
    return legacyPhrase;
  }

  const hashToLeaf = {};
  for (const hash in hashToText) {
    hashToLeaf[hash] = {
      text: hashToText[hash],
      desc,
    };
  }
  legacyPhrase[HASH_TO_LEAF] = hashToLeaf;

  if (typeof legacyPhrase.jsfbt === 'string') {
    legacyPhrase.jsfbt = {
      t: {
        text: legacyPhrase.jsfbt,
        desc,
      },
      m: [],
    };
  }

  delete legacyPhrase.desc;
  delete legacyPhrase.type;
  return legacyPhrase;
}
