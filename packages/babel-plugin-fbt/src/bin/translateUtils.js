/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @noflow
 * @format
 * @emails oncall+i18n_fbt_js
 */

const {objMap} = require('../FbtUtil');
const {FbtSite} = require('../translate/FbtSite');
const TranslationBuilder = require('../translate/TranslationBuilder');
const TranslationConfig = require('../translate/TranslationConfig');
const TranslationData = require('../translate/TranslationData');
const fs = require('fs');

type Options = {|
  // By default, we output the translations as an associative array whose
  // indices match the phrases provided.  If instead, you'd like a mapping
  // from the associated "jenkins" hash to translation payload (for use in
  // babel-fbt-runtime plugin, for instance) you can use this.
  jenkins: boolean,
  // Similar to `jenkins`, but pass the hash-module of your choice.
  // The module should export a function with the same signature and operation
  // of fbt-hash-module.
  hashModule: false | string,
|};

function parseJSONFile(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath));
  } catch (error) {
    error.message += `\nFile path: "${filepath}"`;
    throw error;
  }
}

function processFiles(
  stringFile: string,
  translationFiles: Array<string>,
  options: Options,
) {
  const phrases = parseJSONFile(stringFile).phrases;
  const fbtSites = phrases.map(FbtSite.fromScan);
  const translatedGroups = translationFiles.map(file => {
    const group = parseJSONFile(file);
    return processTranslations(fbtSites, group);
  });
  return processGroups(phrases, translatedGroups, options);
}

function processJSON(json, options: Options) {
  const fbtSites = json.phrases.map(FbtSite.fromScan);
  return processGroups(
    json.phrases,
    json.translationGroups.map(group => processTranslations(fbtSites, group)),
    options,
  );
}

function processGroups(phrases, translatedGroups, options: Options) {
  let fbtHash = null;
  if (options.jenkins) {
    fbtHash = require('../fbtHashKey');
  } else if (options.hashModule) {
    fbtHash = require(options.hashModule);
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
      const hash = fbtHash(payload, phrase.type === 'text');
      hashToFbt[hash] = translatedFbt;
    });
  }
  return localeToHashToFbt;
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

module.exports = {processFiles, processJSON};
