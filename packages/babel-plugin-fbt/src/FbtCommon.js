/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @emails oncall+i18n_fbt_js
 * @flow
 * @format
 */

'use strict';

// flowlint ambiguous-object-type:error

import type {JSModuleNameType} from './FbtConstants';

const path = require('path');

export type FbtCommonMap = {[text: string]: string, ...};
const textToDesc: FbtCommonMap = {};

const FbtCommon = {
  init(
    opts: {fbtCommon?: FbtCommonMap, fbtCommonPath?: ?string, ...} = {},
  ): void {
    if (opts.fbtCommon) {
      Object.assign(textToDesc, opts.fbtCommon);
    }
    if (opts.fbtCommonPath != null) {
      let fbtCommonData;
      try {
        // $FlowFixMe - dynamic require
        fbtCommonData = require(path.resolve(opts.fbtCommonPath));
      } catch (error) {
        error.message += `\nopts.fbtCommonPath: ${opts.fbtCommonPath}`;
        error.message += `\nCurrent path: ${process.cwd()}`;
        throw error;
      }
      Object.assign(textToDesc, fbtCommonData);
    }
  },

  getDesc(text: string): ?string {
    return textToDesc[text];
  },

  getUnknownCommonStringErrorMessage(
    moduleName: JSModuleNameType,
    text: string,
  ): string {
    return `Unknown string "${text}" for <${moduleName} common={true}>`;
  },
};

module.exports = FbtCommon;
