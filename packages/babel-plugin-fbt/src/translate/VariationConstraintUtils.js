/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

import type {TokenConstraintPairs} from './TranslationBuilder';

/**
 * Concatenation of `TokenConstraintPairs` through `buildConstraintKey` method
 * e.g. 'user%2:count%24' is the `ConstraintKey` for [['user', 2], ['count', 24]]
 */
export opaque type ConstraintKey: string = string;

/**
 * Build the aggregate key with which we access the constraint map.  The
 * constraint map maps the given constraints to the appropriate translation
 */
function buildConstraintKey(
  constraintKeys: TokenConstraintPairs,
): ConstraintKey {
  return constraintKeys.map(kv => kv[0] + '%' + kv[1]).join(':');
}

module.exports = {
  buildConstraintKey,
};
