/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */
/*eslint max-len: ["error", 100]*/

'use strict';

import type {FbtTableKey} from '../../../runtime/shared/FbtTable';
import type {
  ObjectWithJSFBT,
  TableJSFBTTree,
  TableJSFBTTreeLeaf,
} from './index';

const nullthrows = require('nullthrows');

/**
 * @returns an TableJSFBTTreeLeaf object if the given object matches its shape, or null
 */
function coerceToTableJSFBTTreeLeaf(
  value: Partial<TableJSFBTTreeLeaf>,
): ?TableJSFBTTreeLeaf {
  return value &&
    typeof value === 'object' &&
    typeof value.desc === 'string' &&
    typeof value.text === 'string' &&
    (typeof value.tokenAliases === 'object' || value.tokenAliases == null)
    ? // $FlowFixMe[incompatible-cast]
      (value: TableJSFBTTreeLeaf)
    : null;
}

function _runOnNormalizedJSFBTLeaves(
  value: $ReadOnly<TableJSFBTTree>,
  callback: (leaf: TableJSFBTTreeLeaf) => void,
): void {
  // $FlowFixMe[incompatible-call]
  // $FlowFixMe[incompatible-indexer]
  // $FlowFixMe[incompatible-variance]
  const leaflet = coerceToTableJSFBTTreeLeaf(value);
  if (leaflet) {
    return callback(leaflet);
  }

  for (const k in value) {
    _runOnNormalizedJSFBTLeaves(
      // $FlowExpectedError[incompatible-call] `value` should now be an intermediate tree level
      nullthrows(value[k]),
      callback,
    );
  }
}

function onEachLeaf(
  phrase: {...ObjectWithJSFBT, ...},
  callback: (leaf: TableJSFBTTreeLeaf) => void,
): void {
  _runOnNormalizedJSFBTLeaves(phrase.jsfbt.t, callback);
}

/**
 * Clone `tree` and replace each leaf in the cloned tree with the result of
 * calling `convertLeaf`.
 */
function mapLeaves<NewLeaf>(
  tree: $ReadOnly<TableJSFBTTree>,
  convertLeaf: (leaf: $ReadOnly<TableJSFBTTreeLeaf>) => NewLeaf,
):
  | NewLeaf
  | {|
      [key: FbtTableKey]: NewLeaf,
    |} {
  // $FlowFixMe[incompatible-call]
  // $FlowFixMe[incompatible-indexer]
  // $FlowFixMe[incompatible-variance]
  const leaflet = coerceToTableJSFBTTreeLeaf(tree);
  if (leaflet != null) {
    return convertLeaf(leaflet);
  }

  const newFbtTree: {[key: FbtTableKey]: NewLeaf} = {};
  for (const tableKey in tree) {
    // $FlowFixMe[incompatible-type]
    newFbtTree[tableKey] = mapLeaves(tree[tableKey], convertLeaf);
  }
  return newFbtTree;
}

module.exports = {
  coerceToTableJSFBTTreeLeaf,
  onEachLeaf,
  mapLeaves,
};
