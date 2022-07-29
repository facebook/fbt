/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

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
const invariant = require('invariant');

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
    let value;
    if (typeof variation === 'number') {
      value = variation;
    } else {
      invariant(
        typeof variation === 'string',
        'Expect keys in translated payload to be either string or number type ' +
          'but got a key of type `%s`',
        variation,
      );
      value = Number.parseInt(variation, 10);
    }
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
