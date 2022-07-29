/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

/*eslint max-len: ["error", 100]*/

import type {
  PatternHash,
  PatternString,
} from '../../../../runtime/shared/FbtTable';
import type {HashToLeaf, PackagerPhrase} from './FbtCollector';

const {onEachLeaf} = require('../JSFbtUtil');

export type HashFunction = (
  text: PatternString,
  description: string,
) => PatternHash;

/**
 * TextPackager massages the data to handle multiple texts in fbt payloads (like
 * enum branches) and hashes each individual text.  It stores this mapping in a
 * stripped down phrase
 */
class TextPackager {
  _hash: HashFunction;
  constructor(hash: HashFunction) {
    this._hash = hash;
  }

  pack(phrases: Array<PackagerPhrase>): Array<PackagerPhrase> {
    return phrases.map(phrase => {
      const hashToLeaf: HashToLeaf = {};
      onEachLeaf(phrase, ({desc, text}) => {
        hashToLeaf[this._hash(text, desc)] = {
          text,
          desc,
        };
      });

      return {
        hashToLeaf,
        ...(phrase: PackagerPhrase),
      };
    });
  }
}

module.exports = TextPackager;
