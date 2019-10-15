/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @generated SignedSource<<b9d6cb52168efda581e7ad3e3c931fe9>>
 *
 * Run `phps GenderGenScript` to regenerate this file.
 *
 * @flow
 */
const {Gender} = require('../IntlVariations');
class IntlMergedUnknownGenderType {
  static getFallback() {
    return Gender.MALE;
  }

  static getGenderVariations() {
    return [Gender.MALE, Gender.FEMALE];
  }
}

module.exports = IntlMergedUnknownGenderType;
