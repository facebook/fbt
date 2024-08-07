/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @format
 * @oncall i18n_fbt_js
 */

jest.disableAutomock();

import {cleanup, render, screen} from '@testing-library/react';

const InlineFbtResult = require('InlineFbtResult');

const React = require('react');

afterEach(cleanup);

describe('InlineFbtResult', function () {
  it('behaves like a string and a React element', function () {
    const result = new InlineFbtResult(
      ['hippopotamus'],
      false,
      'hippopotamus',
      null,
    );
    expect(React.isValidElement(result)).toBe(true);
    expect(result.toString()).toBe('hippopotamus');

    render(<div data-testid="test-result">{result}</div>);
    expect(screen.getByTestId('test-result')).toHaveTextContent('hippopotamus');
  });
});
