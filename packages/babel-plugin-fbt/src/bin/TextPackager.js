/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+i18n_fbt_js
 * @flow
 */

/*eslint max-len: ["error", 100]*/

import type {
  PatternHash,
  PatternString,
} from '../../../../runtime/shared/FbtTable';
import type {HashToLeaf, PackagerPhrase} from './FbtCollector';

export type HashFunction = (
  text: PatternString,
  description: string,
) => PatternHash;

const {onEachLeaf} = require('../JSFbtUtil');

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
      onEachLeaf(phrase, ({text, desc}) => {
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

function _flattenTexts(texts) {
  if (typeof texts === 'string') {
    // Return all tree leaves of a jsfbt TABLE or singleton array in the case of
    // a TEXT type
    return [texts];
  }

  const aggregate = [];
  for (const k in texts) {
    aggregate.push.apply(aggregate, _flattenTexts(texts[k]));
  }
  return aggregate;
}

module.exports = TextPackager;
