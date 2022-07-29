/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @format
 * @noflow
 * @oncall i18n_fbt_js
 */

/**
 * Compare phrases based on (filepath, line_beg, col_beg) in this order
 */
function comparePhrases(newPhrase, legacyPhrase) /*: number */ {
  if (newPhrase.filepath !== legacyPhrase.filepath) {
    return newPhrase.filepath < legacyPhrase.filepath ? -1 : 1;
  }
  if (newPhrase.line_beg !== legacyPhrase.line_beg) {
    return newPhrase.line_beg < legacyPhrase.line_beg ? -1 : 1;
  }
  if (newPhrase.col_beg !== legacyPhrase.col_beg) {
    return newPhrase.col_beg < legacyPhrase.col_beg ? -1 : 1;
  }
  return 0;
}

/**
 * Match new and legacy phrase and run `callback` on each pair of matched phrases
 */
function forEachPairOfNewAndLegacyPhrase(
  newPhrases,
  legacyPhrases,
  matchedPhraseCallback /*: (newPhrase, legacyPhrase) => void */,
  addedPhraseCallback /*: (newPhrase, legacyPhrase) => void */,
  removedPhraseCallback /*: (newPhrase, legacyPhrase) => void */,
) /*: void */ {
  const sortedNewPhrases = newPhrases.sort(comparePhrases);
  const sortedLegacyPhrases = legacyPhrases.sort(comparePhrases);
  for (
    let legacyPointer = 0, newPointer = 0;
    legacyPointer < sortedLegacyPhrases.length &&
    newPointer < sortedNewPhrases.length;

  ) {
    const legacyPhrase = sortedLegacyPhrases[legacyPointer];
    const newPhrase = sortedNewPhrases[newPointer];
    const comparison = comparePhrases(newPhrase, legacyPhrase);
    if (comparison === 0) {
      matchedPhraseCallback(newPhrase, legacyPhrase);
      legacyPointer++;
      newPointer++;
    } else if (comparison < 0) {
      addedPhraseCallback(newPhrase, legacyPhrase);
      newPointer++;
    } else {
      removedPhraseCallback(newPhrase, legacyPhrase);
      legacyPointer++;
    }
  }
}

function areNewAndLegacyLeavesIdentical(
  newLeaves,
  legacyLeaves,
) /*: boolean */ {
  const legacyLeavesSet = new Set(Object.keys(legacyLeaves));
  const newLeavesSet = new Set(Object.keys(newLeaves));
  const containsAll = (set1, set2) =>
    Array.from(set1).every(item => set2.has(item));
  return (
    legacyLeavesSet.size === newLeavesSet.size &&
    containsAll(newLeavesSet, legacyLeavesSet) &&
    containsAll(legacyLeavesSet, newLeavesSet)
  );
}

module.exports = {
  forEachPairOfNewAndLegacyPhrase,
  areNewAndLegacyLeavesIdentical,
};
