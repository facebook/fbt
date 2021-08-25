/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow
 * @emails oncall+i18n_fbt_js
 */

'use strict';

// flowlint ambiguous-object-type:error

import type {JSModuleNameType} from './FbtConstants';
export type FbtCommonMap = {[text: string]: string, ...};

const path = require('path');
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
