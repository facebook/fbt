/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Provides return values for fbt constructs calls. Here lives the platform
 * specific implementation.
 *
 * @emails oncall+internationalization
 * @flow strict-local
 * @format
 */

'use strict';

type Substitution = {};
type TableKey = string | number;

const FbtTableAccessor = {
  getEnumResult(value: string | number): [TableKey, ?Substitution] {
    return [value, null];
  },
  getGenderResult(
    variation: Array<string | number>,
    substitution: ?Substitution,
    value: number,
  ): [Array<TableKey>, ?Substitution] {
    // value is ignored here which will be used in alternative implementation
    // for different platform
    return [variation, substitution];
  },
  getNumberResult(
    variation: Array<string | number>,
    substitution: ?Substitution,
    value: number,
  ): [Array<TableKey>, ?Substitution] {
    // value is ignored here which will be used in alternative implementation
    // for different platformf
    return [variation, substitution];
  },
  getPronounResult(genderKey: number): [Array<TableKey>, ?Substitution] {
    return [[genderKey, '*'], null];
  },
};

module.exports = FbtTableAccessor;
