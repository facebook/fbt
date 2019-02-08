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
 * Reads the JSON payload of the source strings of the following form:
 *
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
 * }
 *
 * and JSON payloads (either in an arbitrary number of files when
 * using --translations) or grouped in a monolithic JSON file when
 * using --stdin array under `translationGroups`
 *
 *  {
 *    "fb-locale": "fb_HX",
 *    "translations": {
 *      "JBhJwfCe2TutVvTr9c9HLw==": {
 *        "tokens": {},
 *        "types": {},
 *        "translations": [{
 *          "translation": "Y0ur FBT D3m0",
 *          "variations": []
 *        }]
 *      }
 *    }
 *  }
 *
 * and by default, returns the translated phrases in the following format:
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
 *  (A) Rely on the jenkins hash default and pass the --jenkins option OR
 *  (B) Pass in a custom hash module as --fbt-hash-module.
 *    You MUST ensure this is the same hash module as used in the
 *    babel-fbt-runtime.  Otherwise, you'll have a BAD time
 *
 * When using the runtime dictionary options, output will be of the form:
 *
 *  {
 *    <locale>: {
 *      <hash>: <payload>,
 *      ...
 *    },
 *    ...
 *   }
 *
 */
'use strict';

const {objMap} = require('../FbtUtil');
const {FbtSite} = require('../translate/FbtSite.js');
const TranslationBuilder = require('../translate/TranslationBuilder');
const TranslationConfig = require('../translate/TranslationConfig');
const TranslationData = require('../translate/TranslationData');
const fs = require('fs');
const yargs = require('yargs');

const args = {
  HASH: 'fbt-hash-module',
  HELP: 'h',
  JENKINS: 'jenkins',
  PRETTY: 'pretty',
  SRC: 'source-strings',
  STDIN: 'stdin',
  TRANSLATIONS: 'translations',
};

const argv = yargs
  .usage('Translate fbt phrases with provided translations:\n$0 [options]')
  .boolean(args.JENKINS)
  .default(args.JENKINS, false)
  .describe(
    args.JENKINS,
    'By default, we output the translations as an associative array whose ' +
      "indices match the phrases provided.  If instead, you'd like a mapping " +
      'from the associated "jenkins" hash to translation payload (for use in ' +
      'babel-fbt-runtime plugin, for instance) you can use this',
  )
  .string(args.HASH)
  .default(args.HASH, false)
  .describe(
    args.HASH,
    `Similar to --${
      args.JENKINS
    }, but pass the hash-module of your choice.  The ` +
      'module should export a function with the same signature and operation ' +
      'of fbt-hash-module',
  )
  .boolean(args.STDIN)
  .default(args.STDIN, false)
  .describe(
    args.STDIN,
    'Instead of reading translation files and source file separately, read ' +
      'from STDIN as a monolothic JSON payload',
  )
  .string(args.SRC)
  .default(args.SRC, '.source_strings.json')
  .describe(
    args.SRC,
    'The file containing source strings, as collected by collectFbt.js',
  )
  .array(args.TRANSLATIONS)
  .default(args.TRANSLATIONS, null)
  .describe(
    args.TRANSLATIONS,
    'The translation files containing translations corresponding to source-strings',
  )
  .boolean(args.PRETTY)
  .default(args.PRETTY, false)
  .describe(args.PRETTY, 'pretty print the translation output')
  .describe(args.HELP, 'Display usage message')
  .alias(args.HELP, 'help').argv;

function processFiles(
  stringFile /*: string */,
  translationFiles /*: Array<string> */,
) {
  const phrases = JSON.parse(fs.readFileSync(stringFile)).phrases;
  const fbtSites = phrases.map(FbtSite.fromScan);
  const translatedGroups = translationFiles.map(file => {
    const group = JSON.parse(fs.readFileSync(file));
    return processTranslations(fbtSites, group);
  });
  return processGroups(phrases, translatedGroups);
}

function processJSON(json) {
  const fbtSites = json.phrases.map(FbtSite.fromScan);
  return processGroups(
    json.phrases,
    json.translationGroups.map(group => processTranslations(fbtSites, group)),
  );
}

function processTranslations(fbtSites, group) {
  const config = TranslationConfig.fromFBLocale(group['fb-locale']);
  const translations = objMap(group.translations, TranslationData.fromJSON);
  const translatedPhrases = fbtSites.map(fbtsite =>
    new TranslationBuilder(translations, config, fbtsite, false).build(),
  );
  return {
    'fb-locale': group['fb-locale'],
    translatedPhrases,
  };
}

function processGroups(phrases, translatedGroups) {
  let fbtHash = null;
  if (yargs.argv[args.JENKINS]) {
    fbtHash = require('../fbtHashKey');
  } else if (yargs.argv[args.HASH]) {
    fbtHash = require(yargs.argv[args.HASH]);
  }

  if (!fbtHash) {
    return translatedGroups;
  }

  const localeToHashToFbt = {};
  for (const group of translatedGroups) {
    const hashToFbt = (localeToHashToFbt[group['fb-locale']] = {});
    phrases.forEach((phrase, idx) => {
      const translatedFbt = group.translatedPhrases[idx];
      const payload = phrase.type === 'text' ? phrase.jsfbt : phrase.jsfbt.t;
      const hash = fbtHash(payload, phrase.desc);
      hashToFbt[hash] = translatedFbt;
    });
  }
  return localeToHashToFbt;
}

if (argv[args.HELP]) {
  yargs.showHelp();
  process.exit(0);
}

const output = argv[args.STDIN]
  ? processJSON(JSON.parse(fs.readFileSync('/dev/stdin', 'utf8')))
  : processFiles(argv[args.SRC], argv[args.TRANSLATIONS]);
const json = JSON.stringify(output, ...(argv[args.PRETTY] ? [null, ' '] : []));
process.stdout.write(json);
