/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @flow strict-local
 * @format
 * @emails oncall+internationalization
 */
import type {FbtResolvedPayload} from 'FbtHooks';
import typeof FbtHooks from 'FbtHooks';

const actualGetFbsResult = jest.requireActual('getFbsResult');
const ActualFbtHooks = (jest.requireActual('FbtHooks'): FbtHooks);

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
