/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @generated SignedSource<<4ef5f70eebf1aa497eb4db81c915b97b>>
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
