/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

import type {FbtResolvedPayload} from 'FbtHooks';
import typeof FbtHooks from 'FbtHooks';
import typeof getFbsResult from 'getFbsResult';

jest.unmock('FbtEnv').unmock('FbtHooksImpl');
const actualGetFbsResult = jest.requireActual<getFbsResult>('getFbsResult');
const ActualFbtHooks = jest.requireActual<FbtHooks>('FbtHooks');

const MockedFbtHooks: FbtHooks = {
  ...ActualFbtHooks,

  getFbsResult: actualGetFbsResult,

  // TODO T61053573: Stop unwrapping FbtResult
  getFbtResult(input: FbtResolvedPayload): mixed {
    const contents = input.contents;
    return contents?.length === 1 && typeof contents[0] === 'string'
      ? contents[0]
      : contents;
  },
};

module.exports = MockedFbtHooks;
