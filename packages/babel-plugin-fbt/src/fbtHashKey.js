/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict-local
 * @emails oncall+internationalization
 */

/* eslint no-bitwise: 0 */

'use strict';

import type {TableJSFBTTree} from './index';

const fbtJenkinsHash = require('./fbtJenkinsHash');

const BaseNSymbols =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Compute the baseN string for a given unsigned integer.
function uintToBaseN(numberArg, base) {
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

function fbtHashKey(
  jsfbt: $ReadOnly<TableJSFBTTree>,
  noStringify: boolean = false,
): string {
  return uintToBaseN(fbtJenkinsHash(jsfbt, noStringify), 62);
}

module.exports = fbtHashKey;
