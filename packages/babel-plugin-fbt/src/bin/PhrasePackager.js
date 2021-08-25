/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+i18n_fbt_js
 * @flow
 */

/* eslint max-len: ["warn", 100] */

import type {PackagerPhrase} from './FbtCollector';

const fbtHashKey = require('../fbtHashKey');
const jenkinsHash = require('../fbtJenkinsHash');

/**
 * PhrasePackager differs from TextPackager in that it hashes the
 * entire payload for identification
 */
class PhrasePackager {
  pack(phrases: Array<PackagerPhrase>): Array<PackagerPhrase> {
    return phrases.map(phrase => {
      return {
        hash_key: fbtHashKey(phrase.jsfbt.t),
        hash_code: jenkinsHash(phrase.jsfbt.t),
        ...(phrase: PackagerPhrase),
      };
    });
  }
}
module.exports = PhrasePackager;
