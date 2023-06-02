/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

import type {HashFunction} from './TextPackager';

const crypto = require('crypto');

/**
 * Takes an fbt text and description and returns the unique identifier as calculated by
 * the MD5 algorithm.
 */
function md5(text: string, description: string): string {
  return crypto
    .createHash('md5')
    .update(text + description)
    .digest('base64'); // encoding
}

module.exports = (md5: HashFunction);
