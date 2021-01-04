/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 * @noflow
 */

const crypto = require('crypto');

/**
 * Takes fbt callsite data of the form:
 *
 * [{desc: '...sample decription...',
 *   texts: ['string1', 'string2', ...]},
 *  ...]
 *
 * and returns the unique identifiers as calculated by the md5 of the
 * description and text:
 *
 * [["hash1", "hash2", ...]]
 */
function md5(phrases) {
  return phrases.map(phrase =>
    phrase.texts.map(
      text =>
        crypto
          .createHash('md5')
          .update(text + phrase.desc)
          .digest('base64'), // encoding
    ),
  );
}

module.exports = md5;
