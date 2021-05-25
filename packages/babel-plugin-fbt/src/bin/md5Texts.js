/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 * @flow
 */

import type {HashFunction} from './TextPackager';

const crypto = require('crypto');

/**
 * Takes an fbt text and description and returns the unique identifier as calculated by
 * the MD5 algorithm.
 */
function md5(text, description) {
  return crypto
    .createHash('md5')
    .update(text + description)
    .digest('base64'); // encoding
}

module.exports = (md5: HashFunction);
