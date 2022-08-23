/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
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
        // We have to ignore the linter error caused by Flow Fix me since fbtCommonPath is variable depending on different apps.
        // eslint-disable-next-line fb-www/no-flowfixme-in-flow-strict
        // $FlowFixMe - dynamic require
        fbtCommonData = require(path.resolve(opts.fbtCommonPath));
      } catch (error) {
        // $FlowFixMe[incompatible-type]
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
