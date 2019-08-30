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

const {extractEnumsAndFlattenPhrases} = require('../FbtShiftEnums');
const fbt = require('../index');
const babel = require('@babel/core');
const {SyntaxPlugins} = require('fb-babel-plugin-utils');
const fs = require('graceful-fs');

/*::
type CollectorConfig = {|
  auxiliaryTexts: boolean,
  plugins?: Array<string>,
  reactNativeMode?: boolean,
|};
export type ChildParentMappings = {[prop: number]: number}
export type Errors = {[file: string]: Error};
export type ExtraOptions = {[prop: string]: boolean};
export type FbtEnumManifest = {};
export type Phrase = {[prop: string]: mixed};
export type TransformOptions = {|
  collectFbt?: boolean,
  soureType?: string,
  filename?: string,
  extraOptions?: mixed,
  fbtEnumManifest?: FbtEnumManifest,
  auxiliaryTexts?: boolean,
  reactNativeMode?: boolean,
|}
*/

function transform(
  code /*: string*/,
  options /*: TransformOptions*/,
  plugins /*: Array<string>*/,
)/*: void*/ {
  const opts = {
    ast: false,
    code: false,
    filename: options.filename,
    plugins: SyntaxPlugins.list.concat(plugins, [[fbt, options]]),
    sourceType: 'unambiguous',
  };
  babel.transformSync(code, opts);
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
    filename /*: ?string*/,
    fbtEnumManifest /*::?: FbtEnumManifest*/,
  ) /*: void*/ {
    const options /*: TransformOptions*/ = {
      collectFbt: true,
      extraOptions: this._extraOptions,
      fbtEnumManifest,
      auxiliaryTexts: this._config.auxiliaryTexts,
      reactNativeMode: this._config.reactNativeMode,
    };
    if (filename != null) {
      options.filename = filename;
    }

    if (!/<[Ff]bt|fbt(\.c)?\s*\(/.test(source)) {
      return;
    }

    transform(source, options, this._config.plugins || []);

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
