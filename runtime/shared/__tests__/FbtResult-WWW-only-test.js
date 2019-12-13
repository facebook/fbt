/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+internationalization
 */

jest.disableAutomock();
console.error = jest.fn();

const FbtErrorListenerWWW = require('FbtErrorListenerWWW');
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
    const listener = new FbtErrorListenerWWW({translation: 'f4k3', hash: null});
    // spy on the original method, but preserve original behavior
    listener.onStringSerializationError = jest.fn(function() {
      return FbtErrorListenerWWW.prototype.onStringSerializationError.apply(
        this,
        arguments,
      );
    });
    const result = new FbtResult(['kombucha', nonFbtContent], listener);
    result.toString();
    expect(listener.onStringSerializationError).toHaveBeenCalledTimes(1);
    expect(listener.onStringSerializationError).toHaveBeenCalledWith(
      nonFbtContent,
    );
  });
});
