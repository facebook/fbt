/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Provides return values for fbt constructs calls. Here lives the platform
 * specific implementation.
 *
 * @emails oncall+i18n_fbt_js
 * @flow strict-local
 * @format
 */

'use strict';

import type {FbtSubstitution, FbtTableKey} from 'FbtTable';

export type FbtTableArg = [?Array<FbtTableKey>, ?FbtSubstitution];

const FbtTableAccessor = {
  getEnumResult(value: FbtTableKey): FbtTableArg {
    return [[value], null];
  },

  getGenderResult(
    variation: Array<FbtTableKey>,
    substitution: ?FbtSubstitution,
    _gender: number,
  ): FbtTableArg {
    // value is ignored here which will be used in alternative implementation
    // for different platform
    return [variation, substitution];
  },

  getNumberResult(
    variation: Array<FbtTableKey>,
    substitution: ?FbtSubstitution,
    _numberValue: number,
  ): FbtTableArg {
    // value is ignored here which will be used in alternative implementation
    // for different platformf
    return [variation, substitution];
  },

  // For an fbt.param where no gender or plural/number variation exists
  getSubstitution(substitution: FbtSubstitution): FbtTableArg {
    return [null, substitution];
  },

  getPronounResult(genderKey: number): FbtTableArg {
    return [[genderKey, '*'], null];
  },
};

module.exports = FbtTableAccessor;
