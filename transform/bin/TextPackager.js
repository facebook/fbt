/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p babel_plugin_fbt --remote localhost:~/www
 *
 * @emails oncall+internationalization
 * @format
 */
const {FbtType} = require('../FbtConstants');
const mergePhrase = require('./mergePhrase');

/**
 * TextPackager massages the data to handle multiple texts in fbt payloads (like
 * enum branches) and hashes each individual text.  It stores this mapping in a
 * stripped down phrase (it drops extraneous data like the jsfbt payload itself
 * to limit JSON parsing down the pipe via mergePhrase).
 */
class TextPackager {
  // The hash function signature should look like:
  // [{desc: '...', texts: ['t1',...,'tN']},...]) =>
  //   [[hash1,...,hashN],...]
  constructor(hash, terse) {
    this._hash = hash;
    this._terse = terse;
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
      return mergePhrase(
        {hashToText: hashToText},
        phrases[phraseIdx],
        !this._terse,
      );
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
