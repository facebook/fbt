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
 * @flow
 *
 * DO NOT AUTO-FORMAT TO PRESERVE FLOW TYPES
 */

/* eslint max-len: ["warn", 120] */

'use strict';

const {extractEnumsAndFlattenPhrases} = require('../fbt-shift-enums');
const fbt = require('../index');
const babel = require('@babel/core');
const {SyntaxPlugins} = require('fb-babel-plugin-utils');
const fs = require('graceful-fs');

/*::
type CollectorConfig = {|
  auxiliaryTexts: boolean,
  reactNativeMode?: boolean,
|};
export type ChildParentMappings = {[prop: number]: number}
export type Errors = {[file: string]: Error};
export type ExtraOptions = {[prop: string]: boolean};
export type FbtEnumManifest = {};
export type Phrase = {[prop: string]: mixed};
export type TransformOptions = {[prop: string]: mixed};
*/

function transform(code /*: string*/, options /*: TransformOptions*/)/*: void*/ {
  babel.transformSync(code, {
    ast: false,
    code: false,
    plugins: SyntaxPlugins.list.concat([[fbt, options]]),
    sourceType: 'unambiguous',
  });
}

class FbtCollector {
/*::
  _phrases: Array<Phrase>;
  _errors: Errors;
  _extraOptions: ExtraOptions;
  _config: CollectorConfig;
*/
  constructor(config /*: CollectorConfig*/, extraOptions /*: ExtraOptions*/) {
    this._phrases = [];
    this._errors = {};
    this._extraOptions = extraOptions;
    this._config = config;
  }

  collectFromOneFile(
    source /*: string*/,
    filepath /*: ?string*/,
    fbtEnumManifest /*::?: FbtEnumManifest*/,
  ) /*: void*/ {
    const options = {
      collectFbt: true,
      sourceType: 'nonStrictModule',
      filepath,
      extraOptions: this._extraOptions,
      fbtEnumManifest,
      auxiliaryTexts: this._config.auxiliaryTexts,
      reactNativeMode: this._config.reactNativeMode,
    };

    if (!/<[Ff]bt|fbt(\.c)?\s*\(/.test(source)) {
      return;
    }

    transform(source, options);

    let newPhrases = fbt.getExtractedStrings();
    if (this._config.reactNativeMode) {
      newPhrases = extractEnumsAndFlattenPhrases(newPhrases);
    }

    this._phrases.push.apply(
      this._phrases,
      newPhrases,
    );
  }

  collectFromFiles(
    files /*: Array<string>*/,
    fbtEnumManifest /*:: ?: FbtEnumManifest */,
  ) /*: boolean*/ {
    let hasFailure = false;
    files.forEach(file => {
      const source = fs.readFileSync(file, 'utf8');
      try {
        this.collectFromOneFile(source, file, fbtEnumManifest);
      } catch (e) {
        this._errors[file] = e;
        hasFailure = true;
      }
    });

    return !hasFailure;
  }

  getPhrases() /*: Array<Phrase>*/ {
    return this._phrases;
  }

  getChildParentMappings() /*: ChildParentMappings*/ {
    return fbt.getChildToParentRelationships();
  }

  getErrors() /*: Errors*/ {
    return this._errors;
  }
}

module.exports = FbtCollector;
