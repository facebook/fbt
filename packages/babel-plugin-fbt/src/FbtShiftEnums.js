/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

import type {JSFBTMetaEntry, Phrase, TableJSFBT, TableJSFBTTree} from './index';

const {coerceToTableJSFBTTreeLeaf} = require('./JSFbtUtil');
const invariant = require('invariant');

/**
 * Used by collectFbt to output multiple phrases in a flat array.
 * See FbtShiftEnumsTest for example input and output.
 */
function extractEnumsAndFlattenPhrases(
  phrases: $ReadOnlyArray<Phrase>,
): Array<Phrase> {
  return _flatMap<Phrase, Phrase>(phrases, phrase => {
    const {jsfbt} = phrase;
    const {enums, metadata} = _extractEnumsFromMetadata(jsfbt.m);
    return _buildTablesWithoutEnums(jsfbt.t, enums, []).map(table => {
      // $FlowFixMe[incompatible-indexer]
      // $FlowFixMe[incompatible-variance]
      // $FlowFixMe[incompatible-call]
      const leaf = coerceToTableJSFBTTreeLeaf(table);
      invariant(
        (metadata.length === 0) === (leaf != null),
        'If the JSFBT table depth is 1, then the metadata array should be empty; ' +
          'otherwise, when the depth is greater than 1, the metadata array should not be empty. Metadata length: %s, ',
        metadata.length,
      );
      return {
        ...phrase,
        jsfbt: {
          t: table,
          m: metadata,
        },
      };
    });
  });
}

/**
 * Used by fbt-runtime babel plugin to build a table of enums to hashes of leaf
 * tables. See FbtShiftEnumsTest for example input and output.
 */
function shiftEnumsToTop(jsfbt: TableJSFBT): {|
  shiftedJsfbt: $ReadOnly<TableJSFBTTree>,
  enumCount: number,
|} {
  if (typeof jsfbt === 'string') {
    return {shiftedJsfbt: jsfbt, enumCount: 0};
  } else {
    const {enums} = _extractEnumsFromMetadata(jsfbt.m);
    return {
      // $FlowFixMe[incompatible-call]
      shiftedJsfbt: _shiftEnumsToTop(enums, [], jsfbt.t),
      enumCount: enums.length,
    };
  }
}

function _extractEnumsFromMetadata(metadata: $ReadOnlyArray<?JSFBTMetaEntry>) {
  const enums: Array<$ReadOnlyArray<string>> = [];
  const metadataWithoutEnums = [];
  metadata.forEach(entry => {
    if (entry?.range) {
      enums.push(entry.range);
    } else {
      metadataWithoutEnums.push(entry);
    }
  });
  return {enums, metadata: metadataWithoutEnums};
}

function _buildTablesWithoutEnums(
  table: $ReadOnly<TableJSFBTTree>,
  enums: Array<$ReadOnlyArray<string>>,
  currentEnumKeys: $ReadOnlyArray<string>,
): Array<$ReadOnly<TableJSFBTTree>> {
  if (enums.length === 0) {
    return [table];
  }

  const index = currentEnumKeys.length;
  if (index === enums.length) {
    return [_buildTableWithoutEnums(table, currentEnumKeys, 0)];
  }

  return _flatMap<string, $ReadOnly<TableJSFBTTree>>(enums[index], enumKey =>
    _buildTablesWithoutEnums(table, enums, currentEnumKeys.concat([enumKey])),
  );
}

function _shiftEnumsToTop(
  allEnums: Array<$ReadOnlyArray<string>>,
  currentEnumKeys: $ReadOnlyArray<string>,
  table: TableJSFBTTree,
): $ReadOnly<TableJSFBTTree> {
  if (allEnums.length === 0) {
    return table;
  }

  const index = currentEnumKeys.length;
  if (index === allEnums.length) {
    // The top enum levels are done, now build the sub-table for current enum branch
    return _buildTableWithoutEnums(table, currentEnumKeys, 0);
  }
  const newTable = {};
  for (const enumKey of allEnums[index]) {
    // $FlowFixMe[prop-missing]
    newTable[enumKey] = _shiftEnumsToTop(
      allEnums,
      currentEnumKeys.concat([enumKey]),
      table,
    );
  }
  return newTable;
}

function _buildTableWithoutEnums(
  curLevel: $ReadOnly<TableJSFBTTree>,
  enums: $ReadOnlyArray<string>,
  index: number,
): TableJSFBTTree {
  // $FlowFixMe[incompatible-indexer]
  // $FlowFixMe[incompatible-variance]
  // $FlowFixMe[incompatible-call]
  const jsfbtTree = coerceToTableJSFBTTreeLeaf(curLevel);
  if (jsfbtTree) {
    return jsfbtTree;
  }
  if (index < enums.length && curLevel.hasOwnProperty(enums[index])) {
    return _buildTableWithoutEnums(curLevel[enums[index]], enums, index + 1);
  }
  const result: TableJSFBTTree = {};
  for (const key in curLevel) {
    // $FlowFixMe[prop-missing]
    result[key] = _buildTableWithoutEnums(curLevel[key], enums, index);
  }
  return result;
}

/**
 * Maps each element using a mapping function, then flattens the result into a
 * new array. It is identical to a map followed by flattening to a depth of 1.
 */
function _flatMap<V, O>(
  arr: $ReadOnlyArray<V>,
  f: V => O | Array<O>,
): Array<O> {
  return arr.map(f).reduce((arr1, arr2) => arr1.concat(arr2), []);
}

module.exports = {
  extractEnumsAndFlattenPhrases,
  shiftEnumsToTop,
};
