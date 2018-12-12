/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 * @format
 * @flow strict-local
 */
const IntlNumberType = require('IntlNumberType');
const IntlVariations = require('IntlVariations');
const IntlViewerContext = require('IntlViewerContext');

const invariant = require('invariant');

const EXACTLY_ONE = '_1';

const IntlVariationResolverImpl = {
  EXACTLY_ONE: EXACTLY_ONE,

  /**
   * Wrapper around FbtNumberType.getVariation that special cases our EXACTLY_ONE
   * value to accommodate the singular form of fbt:plural
   */
  getNumberVariations(
    number: number,
  ): Array<$FlowFixMe | $TEMPORARY$string<'*'> | $TEMPORARY$string<'_1'>> {
    /* eslint-disable no-bitwise */
    const numType = IntlNumberType.get(IntlViewerContext.locale).getVariation(
      number,
    );
    invariant(
      numType & IntlVariations.BITMASK_NUMBER,
      'Invalid number provided',
    );
    return number === 1 ? [EXACTLY_ONE, numType, '*'] : [numType, '*'];
  },

  /**
   * Wrapper to validate gender.
   */
  getGenderVariations(gender: number): Array<$TEMPORARY$string<'*'> | number> {
    /* eslint-disable no-bitwise */
    invariant(
      gender & IntlVariations.BITMASK_GENDER,
      'Invalid gender provided',
    );
    return [gender, '*'];
  },
};

module.exports = IntlVariationResolverImpl;
