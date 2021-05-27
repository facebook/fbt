/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict-local
 * @emails oncall+i18n_fbt_js
 */

/* eslint no-bitwise: 0 */

'use strict';

import type {TableJSFBTTree} from './index';

const jenkinsHash = require('./jenkinsHash');

function fbtJenkinsHash(jsfbt: $ReadOnly<TableJSFBTTree>): number {
  return jenkinsHash(JSON.stringify(jsfbt));
}

module.exports = fbtJenkinsHash;
