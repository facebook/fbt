/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @emails i18n-tests@fb.com
 * @format
 */

jest.disableAutomock();

const InlineFbtResult = require('InlineFbtResult');
const ReactTestUtils = require('ReactTestUtils');

const React = require('react');

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

    const div = ReactTestUtils.renderIntoDocument(<div>{result}</div>);
    expect(div.textContent).toBe('hippopotamus');
  });
});
