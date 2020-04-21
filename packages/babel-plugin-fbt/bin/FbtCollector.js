/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * DO NOT AUTO-FORMAT TO PRESERVE FLOW TYPES
 * @noformat
 * @flow
 */

/* eslint max-len: ["warn", 120] */

'use strict';

const {extractEnumsAndFlattenPhrases} = require('../FbtShiftEnums');
const fbt = require('../index');
const babel = require('@babel/core');
const {SyntaxPlugins} = require('fb-babel-plugin-utils');
const fs = require('graceful-fs');

/*::
import type {PatternString} from '../../../runtime/shared/FbtTable';
import type {FbtRuntimeInput} from '../../../runtime/shared/FbtHooks';
import type {BabelPluginList} from '@babel/core';
type CollectorConfig = {|
  auxiliaryTexts: boolean,
  fbtCommonPath?: string,
  plugins?: BabelPluginList,
  reactNativeMode?: boolean,
|};
export type ChildParentMappings = {[prop: number]: number}
export type Errors = {[file: string]: Error};
export type ExtraOptions = {[prop: string]: boolean};
export type FbtEnumManifest = {};
type PhraseBase = {|
  col_beg: number,
  col_end: number,
  desc: string,
  hash_code: number,
  hash_key: string,
  hashToText: {[hash: string]: string},
  line_beg: number,
  line_end: number,
  project: string,
|};
export type Phrase = {|
  ...PhraseBase,
  type: 'text',
  jsfbt: PatternString,
|} | {|
  ...PhraseBase,
  type: 'table',
  jsfbt: {
    t: FbtRuntimeInput,
    m: {}
  },
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
      fbtCommonPath: this._config.fbtCommonPath,
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
