/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This is a wrapper of the JS static module: IntlVariationsJSModule.php
 * It's voluntarily not using the JSStaticModule mock generator by default
 * because we need to add custom Flow types.
 *
 * Instead, its contents are copied from scripts/intl/js/oss-fbt/nonfb-runtime/IntlVariations.js
 *
 * @flow strict
 * @format
 */

export type IntlVariationsEnum = $IntlVariationsEnum;

const IntlVariations = Object.freeze({
  /* eslint-disable fb-www/no-flowfixme-in-flow-strict */
  BITMASK_NUMBER: ((28: $FlowFixMe): IntlVariationsEnum),
  BITMASK_GENDER: ((3: $FlowFixMe): IntlVariationsEnum),
  NUMBER_ZERO: ((16: $FlowFixMe): IntlVariationsEnum),
  NUMBER_ONE: ((4: $FlowFixMe): IntlVariationsEnum),
  NUMBER_TWO: ((8: $FlowFixMe): IntlVariationsEnum),
  NUMBER_FEW: ((20: $FlowFixMe): IntlVariationsEnum),
  NUMBER_MANY: ((12: $FlowFixMe): IntlVariationsEnum),
  NUMBER_OTHER: ((24: $FlowFixMe): IntlVariationsEnum),
  GENDER_MALE: ((1: $FlowFixMe): IntlVariationsEnum),
  GENDER_FEMALE: ((2: $FlowFixMe): IntlVariationsEnum),
  GENDER_UNKNOWN: ((3: $FlowFixMe): IntlVariationsEnum),
  /* eslint-enable fb-www/no-flowfixme-in-flow-strict */
});

module.exports = IntlVariations;
