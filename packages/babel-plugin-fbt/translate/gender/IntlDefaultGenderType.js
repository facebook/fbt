/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @generated SignedSource<<ff0f230855f60d787915b04a48ba204d>>
 *
 * Run `phps GenderGenScript` to regenerate this file.
 *
 * @flow strict-local
 */

'use strict';

const {Gender} = require('../IntlVariations');

const IntlDefaultGenderType = {
  getFallback() /*: typeof Gender.UNKNOWN */ {
    return Gender.UNKNOWN;
  },

  getGenderVariations() /*: $ReadOnlyArray<$Values<typeof Gender>> */ {
    return [Gender.UNKNOWN, Gender.MALE, Gender.FEMALE];
  },
};

module.exports = IntlDefaultGenderType;
