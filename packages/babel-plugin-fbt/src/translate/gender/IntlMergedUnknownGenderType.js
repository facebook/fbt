/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<00f79beee8a37bdd93cf71224f3a403e>>
 *
 * Run `phps GenderGenScript` to regenerate this file.
 *
 * @flow strict-local
 * @oncall i18n_fbt_oss
 */

'use strict';

const {Gender} = require('../IntlVariations');

const IntlMergedUnknownGenderType = {
  getFallback(): typeof Gender.MALE {
    return Gender.MALE;
  },

  getGenderVariations(): $ReadOnlyArray<$Values<typeof Gender>> {
    return [Gender.MALE, Gender.FEMALE];
  },
};

module.exports = IntlMergedUnknownGenderType;
