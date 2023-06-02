/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

/* eslint no-bitwise: 0 */

'use strict';

import type {TableJSFBTTree} from './index';

const fbtJenkinsHash = require('./fbtJenkinsHash');

const BaseNSymbols =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Compute the baseN string for a given unsigned integer.
function uintToBaseN(numberArg: number, base: number) {
  let number = numberArg;
  if (base < 2 || base > 62 || number < 0) {
    return '';
  }
  let output = '';
  do {
    output = BaseNSymbols.charAt(number % base).concat(output);
    number = Math.floor(number / base);
  } while (number > 0);
  return output;
}

function fbtHashKey(jsfbt: $ReadOnly<TableJSFBTTree>): string {
  return uintToBaseN(fbtJenkinsHash(jsfbt), 62);
}

module.exports = fbtHashKey;
