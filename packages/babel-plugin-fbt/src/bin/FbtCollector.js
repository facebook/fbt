/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * DO NOT AUTO-FORMAT TO PRESERVE FLOW TYPES
 * @noformat
 * @flow
 * @emails oncall+internationalization
 */

/* eslint max-len: ["warn", 120] */

'use strict';

const {extractEnumsAndFlattenPhrases} = require('../FbtShiftEnums');
const fbt = require('../index');
const babel = require('@babel/core');
const {SyntaxPlugins} = require('fb-babel-plugin-utils');
const fs = require('graceful-fs');

/*::
import type {BabelPluginList, BabelPresetList} from '@babel/core';
import type {Phrase} from '../index';
type CollectorConfig = {|
  auxiliaryTexts: boolean,
  fbtCommonPath?: string,
  plugins?: BabelPluginList,
  presets?: BabelPresetList,
  reactNativeMode?: boolean,
|};
export type ChildParentMappings = {[prop: number]: number}
export type Errors = {[file: string]: Error};
export type ExtraOptions = {[prop: string]: boolean};
export type FbtEnumManifest = {};
export type PackagerPhrase = {|
  ...Phrase,
  hash_code?: number,
  hash_key?: string,
  hashToText?: {[hash: string]: string},
|};
export type TransformOptions = {|
  collectFbt?: boolean,
  soureType?: string,
  filename?: string,
  extraOptions?: mixed,
  fbtEnumManifest?: FbtEnumManifest,
  fbtCommonPath?: string,
  auxiliaryTexts?: boolean,
  reactNativeMode?: boolean,
|}
*/

function transform(
  code /*: string*/,
  options /*: TransformOptions*/,
  plugins /*: BabelPluginList */,
  presets  /*: BabelPresetList */
)/*: void*/ {
  const opts = {
    ast: false,
    code: false,
    filename: options.filename,
    plugins: SyntaxPlugins.list.concat(plugins, [[fbt, options]]),
    presets,
    sourceType: 'unambiguous',
  };
  babel.transformSync(code, opts);
}

class FbtCollector {
/*::
  _phrases: Array<PackagerPhrase>;
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
      fbtCommonPath: this._config.fbtCommonPath,
    };
    if (filename != null) {
      options.filename = filename;
    }

    if (!/<[Ff]bt|fbt(\.c)?\s*\(/.test(source)) {
      return;
    }

    transform(source, options, this._config.plugins || [], this._config.presets || []);

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
      try {
        const source = fs.readFileSync(file, 'utf8');
        this.collectFromOneFile(source, file, fbtEnumManifest);
      } catch (e) {
        this._errors[file] = e;
        hasFailure = true;
      }
    });

    return !hasFailure;
  }

  getPhrases() /*: Array<PackagerPhrase>*/ {
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
