/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

export type ParamVariationType = {|
  number: 0,
  gender: 1,
|};

export type ValidPronounUsagesType = {|
  object: 0,
  possessive: 1,
  reflexive: 2,
  subject: 3,
|};
