/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 * @format
 */

/*global process:false*/

/* eslint max-len: ["warn", 120] */
/**
 * Reads a JSON paylaod of the following form
 * {
 *  "phrases": [
 *    {
 *      "hashToText": {
 *        "40bd5bc10bd59fe020569068cfd7d814": "Your FBT Demo"
 *      },
 *      ...,
 *      "jsfbt": "Your FBT Demo"
 *    },
 *    ...
 *  ],
 *  "translationGroups": [{
 *    "fb-locale": "en_US",
 *    "translations": {
 *      "40bd5bc10bd59fe020569068cfd7d814": {
 *        "tokens": {},
 *        "types": {},
 *        "translations": [{
 *          "translation": "Y0ur FBT D3m0",
 *          "variations": []
 *        }]
 *      }
 *    }
 *  }]
 *
 * and returns the translated phrases in the following format:
 *
 * [
 *   {
 *     "fb-locale":"fb_HX",
 *     "translatedPhrases":[
 *       "Y0ur FBT D3m0",
 *        ...,
 *     ]
 *   }
 *   ...,
 * ]
 *
 * If intended for use as a runtime dictionary (accessed within the
 * runtime `fbt._` via `FbtTranslations` when using the
 * babel-fbt-runtime plugin), You can:
 *
 *  (A) Rely on the jenkins hash default and use --jenkins OR
 *  (B) Pass in a hash module as --fbt-hash-module.
 *    You must ensure this is the same hash module as used in the
 *    babel-fbt-runtime.  Otherwise, you'll have a bad time
 */
'use strict';

const {objMap} = require('../FbtUtil');
const {FbtSite} = require('../translate/FbtSite.js');
const TranslationBuilder = require('../translate/TranslationBuilder');
const TranslationConfig = require('../translate/TranslationConfig');
const TranslationData = require('../translate/TranslationData');
const optimist = require('optimist');

const argv = optimist
  .usage('Translate fbt phrases with provided translations:\n$0 [options]')
  .boolean('jenkins')
  .default('jenkins', false)
  .describe(
    'jenkins',
    'By default, we output the translations as an associative array whose ' +
      "indices match the phrases provided.  If instead, you'd like a mapping " +
      'from the associated "jenkins" hash (for use in babel-fbt-runtime ' +
      'plugin, for instance) to translation payload you can use this',
  )
  .string('fbt-hash-module')
  .default('fbt-hash-module', false)
  .describe(
    'fbt-hash-module',
    'Similar to --jenkins, but pass the hash-module of your choice.  The ' +
      'module should export a function with the same signature and operation ' +
      'of fbt-hash-module',
  )
  .describe('h', 'Display usage message')
  .alias('h', 'help').argv;

function processJsonSource(source /*string*/) {
  const json = JSON.parse(source);
  const fbtsites = json.phrases.map(FbtSite.fromScan);
  const translatedGroups = json.translationGroups.map(group => {
    const config = TranslationConfig.fromFBLocale(group['fb-locale']);
    const translations = objMap(group.translations, TranslationData.fromJSON);
    const translatedPhrases = fbtsites.map(fbtsite =>
      new TranslationBuilder(translations, config, fbtsite, false).build(),
    );
    delete group.translations;
    group.translatedPhrases = translatedPhrases;
    return group;
  });

  let fbtHash = null;
  if (optimist.argv.jenkins) {
    fbtHash = require('../fbt-hash-key');
  } else if (optimist.argv['fbt-hash-module']) {
    fbtHash = require(optimist.argv['fbt-hash-module']);
  }

  if (!fbtHash) {
    return translatedGroups;
  }

  const localeToHashToFbt = {};
  for (const group of translatedGroups) {
    const hashToFbt = (localeToHashToFbt[group['fb-locale']] = {});
    json.phrases.forEach((phrase, idx) => {
      const translatedFbt = group.translatedPhrases[idx];
      const payload = phrase.type === 'text' ? phrase.jsfbt : phrase.jsfbt.t;
      const hash = fbtHash(payload, phrase.desc);
      hashToFbt[hash] = translatedFbt;
    });
  }
  return localeToHashToFbt;
}

function writeOutput(json) {
  process.stdout.write(JSON.stringify(json));
}

if (argv.help) {
  optimist.showHelp();
  process.exit(0);
}

let source = '';
const stream = process.stdin;
stream
  .setEncoding('utf8')
  .on('data', chunk => (source += chunk))
  .on('end', () => writeOutput(processJsonSource(source)));
