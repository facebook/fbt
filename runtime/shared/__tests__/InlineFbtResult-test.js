/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails i18n-tests@fb.com
 */

jest.disableAutomock();

var InlineFbtResult = require('InlineFbtResult');
var React = require('React');
var ReactTestUtils = require('ReactTestUtils');

describe('InlineFbtResult', function() {
  it('behaves like a string and a React element', function() {
    const result = new InlineFbtResult(
      ['hippopotamus'],
      false,
      'hippopotamus',
      null,
    );
    expect(React.isValidElement(result)).toBe(true);
    expect(result.toString()).toBe('hippopotamus');

    var div = ReactTestUtils.renderIntoDocument(<div>{result}</div>);
    expect(div.textContent).toBe('hippopotamus');
  });
});
