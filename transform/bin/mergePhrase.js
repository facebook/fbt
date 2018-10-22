/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 */

function mergePhrase(
  hashKeys, // key/value pairs to copy over
  phrase, // Phrase to copy into new object
  full, // Full copy.  If false (i.e. terse), strip jsfbt (table & metadata)
) {
  const collectedPhrase = Object.assign(hashKeys, phrase);
  if (!full) {
    // We don't need the underlying tables or metadata for collecting
    // strings, so don't send them (to avoid I/O cost)
    delete collectedPhrase.jsfbt;
  }
  return collectedPhrase;
}
module.exports = mergePhrase;
