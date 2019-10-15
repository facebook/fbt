/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Intended for use with the Facebook FBT framework.
 *
 * @emails oncall+internationalization
 * @format
 * @flow
 */

'use strict';

const Tiger = require('./Tiger');
const tiger = new Tiger(Tiger.L128, 0, true);

/**
 * Example use:
 *   node .../bin/collectFBT.js --hash-module 'fb-tiger-hash/hashPhrases' ...
 *
 * Takes fbt callsite data where each entry in the following array
 * represents one individual fbt callsite:
 *
 * [
 *   {
 *     desc: '...sample description...',
 *     texts: ['string1', 'string2', ...]
 *   },
 *   ...
 * ]
 *
 * and returns the unique identifiers as calculated by the FB version
 * of tiger128 (old flipped-endian PHP version) of the description and
 * text:
 *
 * [
 *   ["hash1", "hash2", ...], // hashes for strings of phrase 1
 *   ...
 *   ["hash1", "hash2", ...], // hashes for strings of phrase N
 * ]
 */
function hashPhrases(phrases) {
  return phrases.map(phrase =>
    phrase.texts.map(text => tiger.hash(text + ':::' + phrase.desc + ':')),
  );
}

module.exports = hashPhrases;
