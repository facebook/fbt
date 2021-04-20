/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Converts the old JSON output of fbt-collect to the new format
 * hashToText -> hashToLeaf
 *
 * @format
 * @noflow
 * @emails oncall+internationalization
 */

const path = require('path');
const process = require('process');

const inputFile = path.resolve(process.argv[2]);
const phrases = require(inputFile);

// {
//     "col_beg": 6,
//     "col_end": 59,
//     "desc": "",
//     "filepath": "html/ads/manage/js/AdsManageAccount.js",
//     "hashToText": {
//       "cfa18142c71a63cab9f818d3966899f4": "There was an error processing your action."
//     },
//     "line_beg": 28,
//     "line_end": 28,
//     "project": ""
//   },

const HASH_TO_TEXT = 'hashToText';
const HASH_TO_LEAF = 'hashToLeaf';

const newPhrases = phrases.map(phrase => {
  if (!phrase[HASH_TO_TEXT]) {
    return phrase;
  }

  const sharedDescription = phrase.desc;
  const newPhrase = Object.entries(phrase).reduce((newPhrase, [key, value]) => {
    if (key === HASH_TO_TEXT) {
      const hashToLeaf = {};
      Object.entries(value).forEach(([hash, text]) => {
        hashToLeaf[hash] = {
          desc: sharedDescription,
          text,
        };
      });
      newPhrase[HASH_TO_LEAF] = hashToLeaf;
    } else {
      newPhrase[key] = value;
    }
    return newPhrase;
  }, {});

  delete newPhrase.desc;
  return newPhrase;
});

console.log(JSON.stringify(newPhrases, null, 2));
