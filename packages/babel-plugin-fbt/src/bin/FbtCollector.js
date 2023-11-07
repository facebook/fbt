/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow
 * @format
 * @noformat
 * @oncall i18n_fbt_js
 */

/* eslint max-len: ["warn", 120] */

'use strict';

import type {
  PatternHash,
  PatternString,
} from '../../../../runtime/shared/FbtTable';
import type {PlainFbtNode} from '../fbt-nodes/FbtNode';
import type {FbtExtraOptionConfig} from '../FbtConstants';
import type {EnumManifest} from '../FbtEnumRegistrar';
import type {BabelPluginFbt, Phrase, PluginOptions} from '../index';
import type {BabelPluginList, BabelPresetList} from '@babel/core';

const {extractEnumsAndFlattenPhrases} = require('../FbtShiftEnums');
const FbtUtil = require('../FbtUtil');
const fbt = require('../index');
const fs = require('graceful-fs');

export type ExternalTransform = (
  src: string,
  opts: TransformOptions,
  filename: ?string,
) => mixed;
export type CollectorConfig = {|
  fbtCommonPath?: string,
  plugins?: BabelPluginList,
  presets?: BabelPresetList,
  reactNativeMode?: boolean,
  transform?: ?ExternalTransform,
  generateOuterTokenName?: boolean,
|};
type ParentPhraseIndex = number;
export type ChildParentMappings = {
  [childPhraseIndex: number]: ParentPhraseIndex,
};
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
export type TransformOptions = $ReadOnly<{|
  ...PluginOptions,
  fbtModule: BabelPluginFbt,
|}>;

export interface IFbtCollector {
  constructor(
    config: CollectorConfig,
    extraOptions: FbtExtraOptionConfig,
  ): void;
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
  _childParentMappings: ChildParentMappings;
  _errors: Errors;
  _extraOptions: FbtExtraOptionConfig;
  _config: CollectorConfig;

  constructor(config: CollectorConfig, extraOptions: FbtExtraOptionConfig) {
    this._phrases = [];
    this._childParentMappings = {};
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

    if (!FbtUtil.textContainsFbtLikeModule(source)) {
      return;
    }

    const externalTransform = this._config.transform;
    if (externalTransform) {
      // $FlowFixMe[incompatible-exact]
      externalTransform(source, options, filename);
    } else {
      const transform = require('@fbtjs/default-collection-transform');
      transform(
        source,
        // $FlowFixMe[incompatible-exact]
        options,
        this._config.plugins || [],
        this._config.presets || [],
      );
    }

    let newPhrases = fbt.getExtractedStrings();
    if (this._config.reactNativeMode) {
      newPhrases = extractEnumsAndFlattenPhrases(newPhrases);
    }

    const newChildParentMappings = fbt.getChildToParentRelationships();
    const offset = this._phrases.length;
    Object.entries(newChildParentMappings).forEach(
      ([childIndex, parentIndex]) => {
        this._childParentMappings[offset + +childIndex] = offset + parentIndex;
      },
    );

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
    return this._childParentMappings;
  }

  getErrors(): Errors {
    return this._errors;
  }

  getFbtElementNodes(): Array<PlainFbtNode> {
    return fbt.getFbtElementNodes();
  }
}

module.exports = FbtCollector;
