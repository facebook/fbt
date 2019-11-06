/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @generated SignedSource<<e36148f4ba776f56126f288ecfe57cf3>>
 *
 * Run `phps GenderGenScript` to regenerate this file.
 *
 * @flow strict-local
 */

'use strict';

const {Gender} = require('../IntlVariations');

const IntlMergedUnknownGenderType = {
  getFallback() /*: typeof Gender.MALE */ {
    return Gender.MALE;
  },

  getGenderVariations() /*: $ReadOnlyArray<$Values<typeof Gender>> */ {
    return [Gender.MALE, Gender.FEMALE];
  },
};

module.exports = IntlMergedUnknownGenderType;
