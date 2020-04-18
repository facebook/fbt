/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 */
const {FbtType} = require('../FbtConstants');

/**
 * TextPackager massages the data to handle multiple texts in fbt payloads (like
 * enum branches) and hashes each individual text.  It stores this mapping in a
 * stripped down phrase
 */
class TextPackager {
  // The hash function signature should look like:
  // [{desc: '...', texts: ['t1',...,'tN']},...]) =>
  //   [[hash1,...,hashN],...]
  constructor(hash) {
    this._hash = hash;
  }

  pack(phrases) {
    const flatTexts = phrases.map(phrase => ({
      desc: phrase.desc,
      texts: _flattenTexts(
        phrase.type === FbtType.TEXT ? phrase.jsfbt : phrase.jsfbt.t,
      ),
    }));
    const hashes = this._hash(flatTexts);
    return flatTexts.map((flatText, phraseIdx) => {
      const hashToText = {};
      flatText.texts.forEach((text, textIdx) => {
        const hash = hashes[phraseIdx][textIdx];
        if (hash == null) {
          throw new Error('Missing hash for text: ' + text);
        }
        hashToText[hash] = text;
      });
      return {hashToText, ...phrases[phraseIdx]};
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
