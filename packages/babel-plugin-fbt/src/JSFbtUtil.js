/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 * @format
 */
/*eslint max-len: ["error", 100]*/

'use strict';

import type {PatternString} from '../../../runtime/shared/FbtTable';
import type {
  ObjectWithJSFBT,
  TableJSFBTTree,
  TableJSFBTTreeLeaflet,
} from './index';

const nullthrows = require('nullthrows');

function _coerceToTableJSFBTTreeLeaflet(value: mixed): ?TableJSFBTTreeLeaflet {
  return value &&
    typeof value === 'object' &&
    typeof value.desc === 'string' &&
    typeof value.text === 'string' &&
    (typeof value.tokenAliases === 'object' || value.tokenAliases == null)
    ? // $FlowExpectedError[incompatible-indexer] we've done enough sanity checks
      // $FlowExpectedError[incompatible-variance] we've done enough sanity checks
      // $FlowExpectedError[incompatible-cast] we've done enough sanity checks
      (value: TableJSFBTTreeLeaflet)
    : null;
}

function _runOnNormalizedJSFBTLeaves(
  value: $ReadOnly<TableJSFBTTree> | PatternString,
  defaultDesc: string,
  callback: (leaf: TableJSFBTTreeLeaflet) => void,
): void {
  if (typeof value === 'string') {
    return callback({
      desc: defaultDesc,
      text: value,
      tokenAliases: {},
    });
  }

  const leaflet = _coerceToTableJSFBTTreeLeaflet(value);
  if (leaflet) {
    return callback(leaflet);
  }

  for (const k in value) {
    _runOnNormalizedJSFBTLeaves(
      // $FlowExpectedError[incompatible-call] `value` should now be an intermediate tree level
      nullthrows(value[k]),
      defaultDesc,
      callback,
    );
  }
}

function onEachLeaf(
  phrase: {...ObjectWithJSFBT},
  defaultDesc: string,
  callback: (leaf: TableJSFBTTreeLeaflet) => void,
): void {
  _runOnNormalizedJSFBTLeaves(
    typeof phrase.jsfbt === 'string' ? phrase.jsfbt : phrase.jsfbt.t,
    defaultDesc,
    callback,
  );
}

module.exports = {
  onEachLeaf,
};
