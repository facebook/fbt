/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @generated SignedSource<<8768ba0afe8b70bfc11c06a20c6ae9cc>>
 *
 * Run `phps GenderGenScript` to regenerate this file.
 *
 * @flow
 */
const {Gender} = require('../IntlVariations');
class IntlDefaultGenderType {
  static getFallback() {
    return Gender.UNKNOWN;
  }

  static getGenderVariations() {
    return [Gender.UNKNOWN, Gender.MALE, Gender.FEMALE];
  }
}

module.exports = IntlDefaultGenderType;
