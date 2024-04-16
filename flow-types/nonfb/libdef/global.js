/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict
 * @format
 * @oncall i18n_fbt_js
 */

// eslint-disable-next-line fb-www/check-dev-condition
declare var __DEV__: boolean;

// Augmented definition from: https://github.com/facebook/flow/blob/main/lib/react.js#L15-L23
declare type React$Node =
  | void
  | null
  | boolean
  | number
  | string
  | React$Element<any>
  | React$Portal
  | FbtElement
  | FbtString
  | FbtPureStringResult
  | Iterable<React$Node>;
