/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9230761c2c3128c634a24c3f4c34d036>>
 *
 * Run `phps GenderGenScript` to regenerate this file.
 *
 * @flow strict-local
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
