/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @flow strict-local
 * @emails oncall+internationalization
 */
/* eslint no-bitwise: 0 */

'use strict';

/*::
import type {FbtRuntimeInput} from '../../../runtime/shared/FbtHooks';
import type {PatternString} from '../../../runtime/shared/FbtTable';
*/

const jenkinsHash = require('./jenkinsHash');
const invariant = require('invariant');

function fbtJenkinsHash(
  jsfbt /*: PatternString | FbtRuntimeInput */,
  desc /*: string */,
  noStringify /*: boolean */ = false,
) /*: number */ {
  const payload = noStringify ? jsfbt : JSON.stringify(jsfbt);
  invariant(
    typeof payload === 'string',
    'JSFBT is not a string type. Please disable noStringify',
  );
  const key = payload + '|' + desc;
  return jenkinsHash(key);
}

module.exports = fbtJenkinsHash;
