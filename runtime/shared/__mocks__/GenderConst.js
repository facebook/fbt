/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This is a wrapper of the JS static module: GenderConstJSModule.php
 * It's voluntarily not using the JSStaticModule mock generator by default
 * because we need to add custom Flow types.
 *
 * Instead, its contents are copied from scripts/intl/js/oss-fbt/nonfb-runtime/GenderConst.js
 *
 * @flow strict
 * @format
 */

export type GenderConstEnum = $GenderConstEnum;

const GenderConst = Object.freeze({
  /* eslint-disable fb-www/no-flowfixme-in-flow-strict */
  NOT_A_PERSON: ((0: $FlowFixMe): GenderConstEnum),
  FEMALE_SINGULAR: ((1: $FlowFixMe): GenderConstEnum),
  MALE_SINGULAR: ((2: $FlowFixMe): GenderConstEnum),
  FEMALE_SINGULAR_GUESS: ((3: $FlowFixMe): GenderConstEnum),
  MALE_SINGULAR_GUESS: ((4: $FlowFixMe): GenderConstEnum),
  MIXED_SINGULAR: ((5: $FlowFixMe): GenderConstEnum),
  MIXED_PLURAL: ((5: $FlowFixMe): GenderConstEnum),
  NEUTER_SINGULAR: ((6: $FlowFixMe): GenderConstEnum),
  UNKNOWN_SINGULAR: ((7: $FlowFixMe): GenderConstEnum),
  FEMALE_PLURAL: ((8: $FlowFixMe): GenderConstEnum),
  MALE_PLURAL: ((9: $FlowFixMe): GenderConstEnum),
  NEUTER_PLURAL: ((10: $FlowFixMe): GenderConstEnum),
  UNKNOWN_PLURAL: ((11: $FlowFixMe): GenderConstEnum),
  /* eslint-enable fb-www/no-flowfixme-in-flow-strict */
});

module.exports = GenderConst;
