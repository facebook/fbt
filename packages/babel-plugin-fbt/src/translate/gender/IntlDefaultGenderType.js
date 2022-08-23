/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d65f305daab7dc2fee32b7f612cbf701>>
 *
 * Run `phps GenderGenScript` to regenerate this file.
 *
 * @flow strict-local
 * @oncall i18n_fbt_oss
 */

'use strict';

const {Gender} = require('../IntlVariations');

const IntlDefaultGenderType = {
  getFallback(): typeof Gender.UNKNOWN {
    return Gender.UNKNOWN;
  },

  getGenderVariations(): $ReadOnlyArray<$Values<typeof Gender>> {
    return [Gender.UNKNOWN, Gender.MALE, Gender.FEMALE];
  },
};

module.exports = IntlDefaultGenderType;
