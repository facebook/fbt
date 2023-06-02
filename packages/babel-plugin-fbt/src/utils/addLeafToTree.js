/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict
 * @format
 * @oncall i18n_fbt_js
 */
/*eslint max-len: ["error", 100]*/

'use strict';

const invariant = require('invariant');

/**
 * Adds a leaf value to a given tree-like object, using the given list of keys (i.e. path).
 * If the path doesn't exist yet, we'll create the intermediate objects as needed.
 *
 * @throws Trying to overwrite an existing tree leaf will throw an error
 *
 * @example
 *
 * // empty starting tree
 * addLeafToTree(
 *   {},
 *   ['a', 'b', 'c'],
 *   {
 *     val: 111
 *   }
 * )
 *
 * Returns:
 *   {
 *     a: {
 *       b: {
 *         c: {
 *           val: 111
 *         }
 *       }
 *     }
 *   }
 *
 * // With an existing tree
 * addLeafToTree(
 *   {
 *     a: {
 *       b: {
 *         c: {
 *           val: 111
 *         }
 *       }
 *     }
 *   }
 *   ['a', 'b', 'd'],
 *   {
 *     val: 222
 *   }
 * )
 *
 * Returns:
 *   {
 *     a: {
 *       b: {
 *         c: {
 *           val: 111
 *         },
 *         d: {
 *           val: 222
 *         },
 *       }
 *     }
 *   }
 *
 */
function addLeafToTree<V, T: {...}>(
  tree: T,
  keys: $ReadOnlyArray<string | number>,
  leaf: V,
): void {
  let branch = tree;

  keys.forEach((key, index) => {
    const isLast = index === keys.length - 1;
    invariant(
      !isLast || branch[key] == null,
      'Overwriting an existing tree leaf is not allowed. keys=`%s`',
      JSON.stringify(keys),
    );
    if (branch[key] == null) {
      // $FlowFixMe[prop-missing]
      branch[key] = isLast ? leaf : {};
    }
    branch = branch[key];
  });
}

module.exports = addLeafToTree;
