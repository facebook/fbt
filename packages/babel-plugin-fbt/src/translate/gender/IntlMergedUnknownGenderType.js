/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @generated SignedSource<<16d321a0f7e888a15d9ac6a9d5f0b893>>
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
