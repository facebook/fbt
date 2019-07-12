/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @generated SignedSource<<8e7b9bae5986659c4d693dc013c51fa9>>
 *
 * Generated by LanguageCLDRGenScript
 *
 * @flow
 */
const IntlVariations = require('IntlVariations');
const IntlCLDRNumberType37 = {
  getVariation(n: number): number {
    if (n === 1) {
      return IntlVariations.NUMBER_ONE;
    } else {
      return IntlVariations.NUMBER_OTHER;
    }
  }
};

module.exports = IntlCLDRNumberType37;
