/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 * @noflow
 */

const IntlNumberType = require('./CLDR/IntlNumberType');
const IntlGenderType = require('./gender/IntlGenderType');
const {EXACTLY_ONE, Gender, IntlVariationType} = require('./IntlVariations');

/**
 * Represents a given locale's variation (number/gender) configuration.
 * i.e. which variations we should default to when unknown
 */
class TranslationConfig {
  constructor(numberType, genderType) {
    this.numberType = numberType;
    this.genderType = genderType;
  }

  getTypesFromMask(
    mask, // IntlVariationType
  ) {
    if (mask === IntlVariationType.NUMBER) {
      const types = this.numberType.getNumberVariations();
      return [EXACTLY_ONE].concat(types);
    }
    return this.genderType.getGenderVariations();
  }

  isDefaultVariation(
    variation, // mixed
  ) {
    const value = Number.parseInt(variation, 10);
    if (Number.isNaN(value)) {
      return false;
    }
    return (
      value === this.numberType.getFallback() ||
      value === this.genderType.getFallback()
    );
  }

  static fromFBLocale(locale) {
    return new TranslationConfig(
      IntlNumberType.forLocale(locale),
      IntlGenderType.forLocale(locale),
    );
  }
}

module.exports = TranslationConfig;
