/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict
 * @format
 * @oncall i18n_fbt_js
 */

// eslint-disable-next-line fb-www/check-dev-condition
declare var __DEV__: boolean;

// Augmented definition from: https://github.com/facebook/flow/blob/master/lib/react.js#L8-L20
declare type React$Node =
  | null
  | boolean
  | number
  | string
  | React$Element<any>
  | React$Portal
  | Iterable<?React$Node>
  | FbtElement
  | FbtString
  | FbtPureStringResult;
