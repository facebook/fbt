/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<776145c65e2a0c63e34a37ddd949281d>>
 *
 * Run `phps GenderGenScript` to regenerate this file.
 *
 * @flow strict-local
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
