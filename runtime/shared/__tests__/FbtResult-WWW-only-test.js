/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+internationalization
 */

jest.disableAutomock();
console.error = jest.fn();

const FbtResult = require('FbtResult');
const React = require('React');
const ReactTestUtils = require('ReactTestUtils');

describe('FbtResult: WWW-only', function() {
  it('Behaves like a React element & works w/ React rendering', function() {
    const result = new FbtResult(['hippopotamus']);
    expect(React.isValidElement(result)).toBe(true);
    expect(result.toString()).toBe('hippopotamus');

    const div = ReactTestUtils.renderIntoDocument(<div>{result}</div>);
    expect(div.textContent).toBe('hippopotamus');
  });

  it('invokes onStringSerializationError() when being serialized with non-FBT contents', function() {
    const nonFbtContent = /non_fbt_content/;
    const result = new FbtResult(['kombucha', nonFbtContent]);
    result.onStringSerializationError = jest.fn(function() {
      // spy on the original method, but preserve original behavior
      return FbtResult.prototype.onStringSerializationError.apply(
        this,
        arguments,
      );
    });
    result.toString();
    expect(result.onStringSerializationError).toHaveBeenCalledTimes(1);
    expect(result.onStringSerializationError).toHaveBeenCalledWith(
      nonFbtContent,
    );
  });
});
