/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p babel_plugin_fbt --remote localhost:~/www
 *
 * @emails oncall+internationalization
 * @format
 */

'use strict';

const {FbtType} = require('./FbtConstants.js');
const invariant = require('fbjs/lib/invariant');

/**
 * Used by collectFBT to output multiple phrases in a flat array.
 * See fbt-shift-enums-test for example input and output.
 */
function extractEnumsAndFlattenPhrases(phrases) {
  return _flatMap(phrases, phrase => {
    if (phrase.type === FbtType.TEXT) {
      return phrase;
    }

    const jsfbt = phrase.jsfbt;
    const {enums, metadata} = _extractEnumsFromMetadata(jsfbt.m);
    const strippedJsfbts = _buildTablesWithoutEnums(jsfbt.t, enums, []).map(
      table => {
        invariant(
          (metadata.length === 0) === (typeof table === 'string'),
          "Plain text 'table' has no metadata.",
        );
        return typeof table === 'string'
          ? table
          : {
              t: table,
              m: metadata,
            };
      },
    );
    return strippedJsfbts.map(strippedJsfbt =>
      Object.assign({}, phrase, {
        jsfbt: strippedJsfbt,
        type: typeof strippedJsfbt === 'string' ? FbtType.TEXT : FbtType.TABLE,
      }),
    );
  });
}

/**
 * Used by fbt-runtime babel plugin to build a table of enums to hashes of leaf
 * tables. See fbt-shift-enums-test for example input and output.
 */
function shiftEnumsToTop(jsfbt) {
  if (typeof jsfbt === 'string') {
    return {shiftedJsfbt: jsfbt, enumCount: 0};
  } else {
    const {enums} = _extractEnumsFromMetadata(jsfbt.m);
    return {
      shiftedJsfbt: _shiftEnumsToTop(enums, [], jsfbt.t),
      enumCount: enums.length,
    };
  }
}

function _extractEnumsFromMetadata(metadata) {
  const enums = [];
  const metadataWithoutEnums = [];
  metadata.forEach(entry => {
    if (entry && entry.range) {
      enums.push(entry.range);
    } else {
      metadataWithoutEnums.push(entry);
    }
  });
  return {enums, metadata: metadataWithoutEnums};
}

function _buildTablesWithoutEnums(table, enums, currentEnumKeys) {
  if (enums.length === 0) {
    return [table];
  }

  const index = currentEnumKeys.length;
  if (index === enums.length) {
    return [_buildTableWithoutEnums(table, currentEnumKeys, 0)];
  }

  return _flatMap(enums[index], enumKey =>
    _buildTablesWithoutEnums(table, enums, currentEnumKeys.concat([enumKey])),
  );
}

function _shiftEnumsToTop(allEnums, currentEnumKeys, table) {
  if (allEnums.length === 0) {
    return table;
  }

  const index = currentEnumKeys.length;
  if (index === allEnums.length) {
    // The top enum levels are done, not build the sub-table for current enum
    // branch
    return _buildTableWithoutEnums(table, currentEnumKeys, 0);
  }
  const newTable = {};
  for (const enumKey of allEnums[index]) {
    newTable[enumKey] = _shiftEnumsToTop(
      allEnums,
      currentEnumKeys.concat([enumKey]),
      table,
    );
  }
  return newTable;
}

function _buildTableWithoutEnums(curLevel, enums, index) {
  if (typeof curLevel === 'string') {
    return curLevel;
  }
  if (index < enums.length && curLevel.hasOwnProperty(enums[index])) {
    return _buildTableWithoutEnums(curLevel[enums[index]], enums, index + 1);
  }
  const result = {};
  for (const key in curLevel) {
    result[key] = _buildTableWithoutEnums(curLevel[key], enums, index);
  }
  return result;
}

/**
 * Maps each element using a mapping function, then flattens the result into a
 * new array. It is identical to a map followed by flattening to a depth of 1.
 */
const _flatMap = (arr, f) =>
  arr.map(f).reduce((arr1, arr2) => arr1.concat(arr2), []);

module.exports = {
  extractEnumsAndFlattenPhrases,
  shiftEnumsToTop,
};
