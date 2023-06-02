/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

import type {
  PatternHash,
  PatternString,
} from '../../../../runtime/shared/FbtTable';
import type {
  CollectFbtOutput,
  CollectFbtOutputPhrase,
} from '../bin/collectFbt.js';
import typeof FbtHashKey from '../fbtHashKey';
import type {TranslationResult} from '../translate/TranslationBuilder';
import type {SerializedTranslationData} from '../translate/TranslationData';

const {objMap} = require('../FbtUtil');
const {FbtSite} = require('../translate/FbtSite');
const TranslationBuilder = require('../translate/TranslationBuilder');
const TranslationConfig = require('../translate/TranslationConfig');
const TranslationData = require('../translate/TranslationData');
const fs = require('fs');
const nullthrows = require('nullthrows');

type Options = $ReadOnly<{|
  // By default, we output the translations as an associative array whose
  // indices match the phrases provided.  If instead, you'd like a mapping
  // from the associated "jenkins" hash to translation payload (for use in
  // babel-fbt-runtime plugin, for instance) you can use this.
  jenkins: boolean,
  // Similar to `jenkins`, but pass the hash-module of your choice.
  // The module should export a function with the same signature and operation
  // of fbt-hash-module.
  hashModule: false | string,
  // By default, we log missing values in the translation file to stderr. If you
  // instead would like to stop execution on missing values you can use this.
  strict: boolean,
|}>;

type LocaleToHashToTranslationResult = $ReadOnly<{|
  [fbLocale: string]: {[hash: PatternHash]: TranslationResult},
|}>;

/** Phrases translated for a specific locale */
type TranslatedGroup = $ReadOnly<{|
  'fb-locale': string,
  translatedPhrases: $ReadOnlyArray<TranslationResult>,
|}>;

type TranslatedGroups = $ReadOnlyArray<TranslatedGroup>;

/** Translations in a specific locale */
type TranslationGroup = $ReadOnly<{|
  'fb-locale': string,
  translations: Translations,
|}>;

type Translations = {[hash: PatternString]: ?SerializedTranslationData};

/** Phrases and translation data in one JSON object */
type InputJSONType = $ReadOnly<{|
  phrases: $ReadOnlyArray<CollectFbtOutputPhrase>,
  translationGroups: $ReadOnlyArray<TranslationGroup>,
|}>;

function parseJSONFile<T>(filepath: string): T {
  try {
    return JSON.parse(fs.readFileSync(filepath).toString());
  } catch (error) {
    error.message += `\nFile path: "${filepath}"`;
    throw error;
  }
}

function processFiles(
  stringFile: string,
  translationFiles: $ReadOnlyArray<string>,
  options: Options,
): LocaleToHashToTranslationResult | TranslatedGroups {
  const {phrases} = parseJSONFile<CollectFbtOutput>(stringFile);
  const fbtSites = phrases.map(createFbtSiteFromJSON);
  const translatedGroups = translationFiles.map(file => {
    const group = parseJSONFile<TranslationGroup>(file);
    return processTranslations(fbtSites, group, options);
  });
  return processGroups(phrases, translatedGroups, options);
}

function processJSON(
  json: InputJSONType,
  options: Options,
): LocaleToHashToTranslationResult | TranslatedGroups {
  const fbtSites = json.phrases.map(createFbtSiteFromJSON);
  return processGroups(
    json.phrases,
    json.translationGroups.map(group =>
      processTranslations(fbtSites, group, options),
    ),
    options,
  );
}

function processGroups(
  phrases: $ReadOnlyArray<CollectFbtOutputPhrase>,
  translatedGroups: TranslatedGroups,
  options: Options,
): LocaleToHashToTranslationResult | TranslatedGroups {
  let fbtHash: ?FbtHashKey = null;
  if (options.jenkins) {
    fbtHash = require('../fbtHashKey');
  } else if (options.hashModule !== false) {
    // $FlowExpectedError[unsupported-syntax] Requiring dynamic module
    fbtHash = require(options.hashModule);
  }

  if (!fbtHash) {
    return translatedGroups;
  }

  const localeToHashToFbt = {};
  for (const group of translatedGroups) {
    // $FlowFixMe[prop-missing]
    const hashToFbt = (localeToHashToFbt[group['fb-locale']] = {});
    phrases.forEach((phrase, idx) => {
      const translatedFbt = group.translatedPhrases[idx];
      const jsfbt = nullthrows(
        phrase.jsfbt,
        `Expect every phrase to have 'jsfbt' field. However, 'jsfbt' is missing in the phrase at index ${idx}.`,
      );
      const hash = nullthrows(fbtHash)(jsfbt.t);
      // $FlowFixMe[prop-missing]
      hashToFbt[hash] = translatedFbt;
    });
  }
  return localeToHashToFbt;
}

function checkAndFilterTranslations(
  locale: string,
  translations: Translations,
  options: Options,
): Translations {
  const filteredTranslations: Translations = {};
  for (const hash in translations) {
    if (translations[hash] == null) {
      const message = `Missing ${locale} translation for string (${hash})`;
      if (options.strict) {
        const err = new Error(message);
        err.stack;
        throw err;
      } else {
        process.stderr.write(`${message}\n`);
      }
    } else {
      filteredTranslations[hash] = translations[hash];
    }
  }
  return filteredTranslations;
}

function processTranslations(
  fbtSites: $ReadOnlyArray<FbtSite>,
  group: TranslationGroup,
  options: Options,
): TranslatedGroup {
  const config = TranslationConfig.fromFBLocale(group['fb-locale']);
  const filteredTranslations = checkAndFilterTranslations(
    group['fb-locale'],
    group.translations,
    options,
  );
  const translations = objMap(filteredTranslations, TranslationData.fromJSON);
  const translatedPhrases = fbtSites.map(fbtsite =>
    new TranslationBuilder(translations, config, fbtsite, false).build(),
  );
  return {
    'fb-locale': group['fb-locale'],
    translatedPhrases,
  };
}

function createFbtSiteFromJSON(json: CollectFbtOutputPhrase): FbtSite {
  return FbtSite.fromScan(json);
}

module.exports = {processFiles, processJSON};
