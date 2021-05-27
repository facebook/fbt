/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 * @flow
 */

'strict';

import type {
  LangToNumberTypeValues,
  LocaleToNumberTypeValues,
} from './CLDR/IntlNumberType';
import type {IntlGenderTypeImpl} from './gender/IntlGenderType';
import type {
  IntlVariationMaskValue,
  IntlVariationsEnum,
} from './IntlVariations';

const IntlNumberType = require('./CLDR/IntlNumberType');
const IntlGenderType = require('./gender/IntlGenderType');
const {EXACTLY_ONE, FbtVariationType} = require('./IntlVariations');

/**
 * Represents a given locale's variation (number/gender) configuration.
 * i.e. which variations we should default to when unknown
 */
class TranslationConfig {
  +numberType: LangToNumberTypeValues | LocaleToNumberTypeValues;
  +genderType: IntlGenderTypeImpl;

  constructor(
    numberType: LangToNumberTypeValues | LocaleToNumberTypeValues,
    genderType: IntlGenderTypeImpl,
  ) {
    this.numberType = numberType;
    this.genderType = genderType;
  }

  getTypesFromMask(
    mask: IntlVariationMaskValue,
  ): $ReadOnlyArray<IntlVariationsEnum | typeof EXACTLY_ONE> {
    if (mask === FbtVariationType.NUMBER) {
      return [EXACTLY_ONE].concat(this.numberType.getNumberVariations());
    }
    return this.genderType.getGenderVariations();
  }

  isDefaultVariation(variation: mixed): boolean {
    // variation could be "*", or it could be number variation or
    // gender variation value in either string or number type.
    // $FlowFixMe[incompatible-call] Allow `variation` to be any type so that existing translations still work
    const value = Number.parseInt(variation, 10);
    if (Number.isNaN(value)) {
      return false;
    }
    return (
      value === this.numberType.getFallback() ||
      value === this.genderType.getFallback()
    );
  }

  static fromFBLocale(locale: string): TranslationConfig {
    return new TranslationConfig(
      IntlNumberType.forLocale(locale),
      IntlGenderType.forLocale(locale),
    );
  }
}

module.exports = TranslationConfig;
