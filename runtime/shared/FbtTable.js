/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Provides types related to fbt table access and the algorithm for
 * recursively accessing the table entries and returning the leaves
 *
 * @emails oncall+i18n_fbt_js
 * @flow strict-local
 * @format
 */

'use strict';

import type {FbtRuntimeInput, FbtTableArgs} from 'FbtHooks';

const invariant = require('invariant');

export type PatternString = string; // A leaf string in our FbtInputTable
export type PatternHash = string; // An optional pattern hash bundled in leaf
export type FbtSubstitution = {[token: string]: mixed, ...};
export type FbtTableKey = string | number;

const FbtTable = {
  /**
   * fbt.XXX calls return arguments in the form of
   * [<INDEX>, <SUBSTITUTION>] to be processed by fbt._
   */
  ARG: {
    INDEX: 0,
    SUBSTITUTION: 1,
  },

  /**
   * Performs a depth-first search on our table, attempting to access
   * each table entry.  The first entry found is the one we want, as we
   * set defaults after preferred indices.  For example:
   *
   * @param @table - {
   *   // viewer gender
   *   '*': {
   *     // {num} plural
   *     '*': {
   *       // user-defined enum
   *       LIKE: '{num} people liked your update',
   *       COMMENT: '{num} people commented on your update',
   *       POST: '{num} people posted on a wall',
   *     },
   *     SINGULAR: {
   *       LIKE: '{num} person liked your update',
   *       // ...
   *     },
   *     DUAL: { ... }
   *   },
   *   FEMALE: {
   *     // {num} plural
   *     '*': { ... },
   *     SINGULAR: { ... },
   *     DUAL: { ... }
   *   },
   *   MALE: { ... }
   * }
   *
   * Notice that LIKE and COMMENT here both have 'your' in them, whereas
   * POST doesn't.  The fallback ('*') translation for POST will be the same
   * in both the male and female version, so that entry won't exist under
   *   table[FEMALE]['*'] or table[MALE]['*'].
   *
   * Similarly, PLURAL is a number variation that never appears in the table as it
   * is the default/fallback.
   *
   * For example, if we have a female viewer, and a PLURAL number and a POST enum
   * value, in the above example, we'll first attempt to get:
   * table[FEMALE][PLURAL][POST].  undefined. Back Up, attempting to get
   * table[FEMALE]['*'][POST].  undefined also. since it's the same as the '*'
   * table['*'][PLURAL][POST].  ALSO undefined. Deduped to '*'
   * table['*']['*'][POST].  There it is.
   *
   * @param args      - fbt runtime arguments
   * @param argsIndex - argument index we're currently visiting
   */
  access(
    table: FbtRuntimeInput,
    args: FbtTableArgs,
    argsIndex: number,
  ): ?PatternString | [PatternString, PatternHash] {
    if (argsIndex >= args.length) {
      // We've reached the end of our arguments at a valid entry, in which case
      // table is now a string (leaf) or undefined (key doesn't exist)
      invariant(
        typeof table === 'string' || Array.isArray(table),
        'Expected leaf, but got: %s',
        JSON.stringify(table),
      );
      return table;
    }
    const arg = args[argsIndex];
    const tableIndices = arg[FbtTable.ARG.INDEX];

    if (tableIndices == null) {
      return FbtTable.access(table, args, argsIndex + 1);
    }
    invariant(
      typeof table !== 'string' && !Array.isArray(table),
      'If tableIndex is non-null, we should have a table, but we got: %s',
      typeof table,
    );
    // Is there a variation? Attempt table access in order of variation preference
    for (let k = 0; k < tableIndices.length; ++k) {
      const subTable = table[tableIndices[k]];
      if (subTable == null) {
        continue;
      }
      const pattern = FbtTable.access(subTable, args, argsIndex + 1);
      if (pattern != null) {
        return pattern;
      }
    }
    return null;
  },
};

module.exports = FbtTable;
