/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 * @flow strict-local
 */

'strict';

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
