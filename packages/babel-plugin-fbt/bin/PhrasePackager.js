/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/* eslint max-len: ["warn", 100] */

/*::
import type {PackagerPhrase} from './FbtCollector';
*/

const {FbtType} = require('../FbtConstants');
const fbtHashKey = require('../fbtHashKey');
const jenkinsHash = require('../fbtJenkinsHash');

/**
 * PhrasePackager differs from TextPackager in that it hashes the
 * entire payload for identification
 */
class PhrasePackager {
  pack/*:: */(phrases /*: Array<PackagerPhrase> */) /*: Array<PackagerPhrase> */ {
    return phrases.map(phrase => {
      const payload =
        phrase.type === FbtType.TABLE ? phrase.jsfbt.t : phrase.jsfbt;
      return {
        hash_key: fbtHashKey(payload, phrase.desc),
        hash_code: jenkinsHash(payload, phrase.desc),
        ...(phrase /*: PackagerPhrase */),
      };
    });
  }
}
module.exports = PhrasePackager;
