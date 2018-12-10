/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 * @format
 */

/*global process:false*/

/* eslint max-len: ["warn", 120] */

'use strict';

const {objMap} = require('../FbtUtil');
const {FbtSite} = require('../translate/FbtSite.js');
const TranslationBuilder = require('../translate/TranslationBuilder');
const TranslationConfig = require('../translate/TranslationConfig');
const TranslationData = require('../translate/TranslationData');

function processJsonSource(source /*string*/) {
  const json = JSON.parse(source);
  const fbtsites = json.phrases.map(FbtSite.fromScan);
  return json.translationGroups.map(group => {
    const config = TranslationConfig.fromFBLocale(group['fb-locale']);
    const translations = objMap(group.translations, TranslationData.fromJSON);
    const translatedPhrases = fbtsites.map(fbtsite =>
      new TranslationBuilder(translations, config, fbtsite, false).build(),
    );
    delete group.translations;
    group.translatedPhrases = translatedPhrases;
    return group;
  });
}

function writeOutput(json) {
  process.stdout.write(JSON.stringify(json));
}

let source = '';
const stream = process.stdin;
stream
  .setEncoding('utf8')
  .on('data', chunk => (source += chunk))
  .on('end', () => writeOutput(processJsonSource(source)));
