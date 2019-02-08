/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 */
/* eslint no-bitwise: 0 */

'use strict';

const jenkinsHash = require('./jenkinsHash');

function fbtJenkinsHash(jsfbt, desc, nostringify) {
  const payload = nostringify ? jsfbt : JSON.stringify(jsfbt);
  const key = payload + '|' + desc;
  return jenkinsHash(key);
}

module.exports = fbtJenkinsHash;
