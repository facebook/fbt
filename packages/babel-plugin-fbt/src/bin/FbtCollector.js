/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @noformat
 * @flow
 * @emails oncall+i18n_fbt_js
 */

/* eslint max-len: ["warn", 120] */

'use strict';

const {extractEnumsAndFlattenPhrases} = require('../FbtShiftEnums');
const fbt = require('../index');
const fs = require('graceful-fs');

export type ExternalTransform = (
  src: string,
  opts: TransformOptions,
  filename: ?string,
) => mixed;

import type {BabelPluginList, BabelPresetList} from '@babel/core';
import type {PlainFbtNode} from '../fbt-nodes/FbtNode';
import type {EnumManifest} from '../FbtEnumRegistrar';
import type {
  PatternHash,
  PatternString,
} from '../../../../runtime/shared/FbtTable';
import type {
  BabelPluginFbt,
  Phrase,
  ExtraOptions,
  PluginOptions,
} from '../index';
export type CollectorConfig = {|
  fbtCommonPath?: string,
  plugins?: BabelPluginList,
  presets?: BabelPresetList,
  reactNativeMode?: boolean,
  transform?: ?ExternalTransform,
  generateOuterTokenName?: boolean,
|};
export type ChildParentMappings = {[prop: number]: number};
export type Errors = {[file: string]: Error};
export type HashToLeaf = {
  [hash: PatternHash]: {|
    desc: string,
    text: PatternString,
  |},
};
export type PackagerPhrase = {|
  ...Phrase,
  hash_code?: number,
  hash_key?: string,
  hashToLeaf?: HashToLeaf,
|};
export type TransformOptions = {|
  ...PluginOptions,
  fbtModule: BabelPluginFbt,
|};

export interface IFbtCollector {
  constructor(config: CollectorConfig, extraOptions: ExtraOptions): void;
  collectFromOneFile(
    source: string,
    filename: ?string,
    fbtEnumManifest?: EnumManifest,
  ): void;
  collectFromFiles(
    files: Array<string>,
    fbtEnumManifest?: EnumManifest,
  ): boolean;
  getChildParentMappings(): ChildParentMappings;
  getErrors(): Errors;
  getFbtElementNodes(): Array<PlainFbtNode>;
  getPhrases(): Array<PackagerPhrase>;
}

class FbtCollector implements IFbtCollector {
  _phrases: Array<PackagerPhrase>;
  _errors: Errors;
  _extraOptions: ExtraOptions;
  _config: CollectorConfig;

  constructor(config: CollectorConfig, extraOptions: ExtraOptions) {
    this._phrases = [];
    this._errors = {};
    this._extraOptions = extraOptions;
    this._config = config;
  }

  collectFromOneFile(
    source: string,
    filename: ?string,
    fbtEnumManifest?: EnumManifest,
  ): void {
    const options = {
      collectFbt: true,
      extraOptions: this._extraOptions,
      fbtCommonPath: this._config.fbtCommonPath,
      fbtEnumManifest,
      fbtModule: fbt,
      filename,
      generateOuterTokenName: this._config.generateOuterTokenName,
      reactNativeMode: this._config.reactNativeMode,
    };

    if (!/<[Ff]bt|fbt(\.c)?\s*\(/.test(source)) {
      return;
    }

    const externalTransform = this._config.transform;
    if (externalTransform) {
      externalTransform(source, options, filename);
    } else {
      const transform = require('@fbtjs/default-collection-transform');
      transform(
        source,
        options,
        this._config.plugins || [],
        this._config.presets || [],
      );
    }

    let newPhrases = fbt.getExtractedStrings();
    if (this._config.reactNativeMode) {
      newPhrases = extractEnumsAndFlattenPhrases(newPhrases);
    }

    // PackagerPhrase is an extended type of Phrase
    // $FlowExpectedError[prop-missing] ignore missing hashToLeaf issue
    this._phrases.push(...(newPhrases: Array<PackagerPhrase>));
  }

  collectFromFiles(
    files: Array<string>,
    fbtEnumManifest?: EnumManifest,
  ): boolean {
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

  getPhrases(): Array<PackagerPhrase> {
    return this._phrases;
  }

  getChildParentMappings(): ChildParentMappings {
    return fbt.getChildToParentRelationships();
  }

  getErrors(): Errors {
    return this._errors;
  }

  getFbtElementNodes(): Array<PlainFbtNode> {
    return fbt.getFbtElementNodes();
  }
}

module.exports = FbtCollector;
