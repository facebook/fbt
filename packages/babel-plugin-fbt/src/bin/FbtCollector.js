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
// eslint-disable-next-line fb-www/no-module-aliasing
const fbt = require('../index');
const fs = require('graceful-fs');
const path = require('path');

export type ExternalTransform = (src: string, opts: TransformOptions, filename: ?string) => mixed;

/*::
import type {BabelPluginList, BabelPresetList} from '@babel/core';
import type {BabelPluginFbt, Phrase} from '../index';
export type CollectorConfig = {|
  auxiliaryTexts: boolean,
  fbtCommonPath?: string,
  plugins?: BabelPluginList,
  presets?: BabelPresetList,
  reactNativeMode?: boolean,
  transform?: ?ExternalTransform,
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
  fbtModule?: BabelPluginFbt,
  filename?: string,
  extraOptions?: mixed,
  fbtEnumManifest?: FbtEnumManifest,
  fbtCommonPath?: string,
  auxiliaryTexts?: boolean,
  reactNativeMode?: boolean,
|}
*/

export interface IFbtCollector {
  constructor(config : CollectorConfig, extraOptions : ExtraOptions): void;
  collectFromOneFile(
    source: string,
    filename: ?string,
    fbtEnumManifest?: FbtEnumManifest,
  ): void;
  collectFromFiles(
    files : Array<string>,
    fbtEnumManifest?: FbtEnumManifest,
  ): boolean;
  getPhrases(): Array<PackagerPhrase>;
  getChildParentMappings(): ChildParentMappings;
  getErrors(): Errors;
}

class FbtCollector implements IFbtCollector {
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
      fbtModule: fbt,
    };
    if (filename != null) {
      options.filename = filename;
    }

    if (!/<[Ff]bt|fbt(\.c)?\s*\(/.test(source)) {
      return;
    }

    const externalTransform = this._config.transform;
    if (externalTransform) {
      externalTransform(source, options, filename);
    } else {
      const transform = require('@fbtjs/default-collection-transform');
      transform(source, options, this._config.plugins || [], this._config.presets || []);
    }

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
