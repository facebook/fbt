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

const jenkinsHash = require('./jenkinsHash');
const invariant = require('invariant');

function fbtJenkinsHash(
  jsfbt: $ReadOnly<TableJSFBTTree>,
  noStringify: boolean = false,
): number {
  const payload = noStringify ? jsfbt : JSON.stringify(jsfbt);
  invariant(
    typeof payload === 'string',
    'JSFBT is not a string type. Please disable noStringify',
  );
  return jenkinsHash(payload);
}

module.exports = fbtJenkinsHash;
