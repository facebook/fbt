/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 */
/* eslint no-bitwise: 0 */

'use strict';

const fbtJenkinsHash = require('./fbt-jenkins-hash');

const BaseNSymbols =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Compute the baseN string for a given unsigned integer.
function uintToBaseN(number, base) {
  if (base < 2 || base > 62 || number < 0) {
    return '';
  }
  var output = '';
  do {
    output = BaseNSymbols.charAt(number % base).concat(output);
    number = Math.floor(number / base);
  } while (number > 0);
  return output;
}

function fbtHashKey(jsfbt, desc, nostringify) {
  return uintToBaseN(fbtJenkinsHash(jsfbt, desc, nostringify), 62);
}

module.exports = fbtHashKey;
