/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 */

const {FbtType} = require('../FbtConstants');
const fbtHashKey = require('../fbtHashKey');
const jenkinsHash = require('../fbtJenkinsHash');

/**
 * PhrasePackager differs from TextPackager in that it hashes the
 * entire payload for identfication
 */
class PhrasePackager {
  pack(phrases) {
    return phrases.map(phrase => {
      const payload =
        phrase.type === FbtType.TABLE ? phrase.jsfbt.t : phrase.jsfbt;
      // Append hash keys to phrases for translation dictionary generation
      return {
        hash_key: fbtHashKey(payload, phrase.desc),
        hash_code: jenkinsHash(payload, phrase.desc),
        ...phrase,
      };
    });
  }
}
module.exports = PhrasePackager;
