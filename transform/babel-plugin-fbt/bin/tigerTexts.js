/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 */

const {execFileSync} = require('child_process');

/**
 * An example of calling out to another process for uniquely
 * identifying text/desc pairs.
 *
 * Example use:
 *   node collectFBT.js --hash-module /path/to/tigerTexts < /some/sample/file.js
 *
 * Takes fbt callsite data of the form:
 *
 * [{desc: '...sample description...',
 *   texts: ['string1', 'string2', ...]},
 *  ...]
 *
 * and returns the unique identifiers as calculated by the FB version
 * of tiger128 (old buggy PHP version) of the description and text:
 *
 * [["hash1", "hash2", ...]]
 */
function tigerTexts(phrases) {
  return JSON.parse(
    execFileSync(__dirname + '/tiger128.php', {
      input: JSON.stringify(phrases),
    }),
  );
}

module.exports = tigerTexts;
