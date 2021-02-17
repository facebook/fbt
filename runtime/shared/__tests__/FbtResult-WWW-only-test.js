/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+internationalization
 */

jest.disableAutomock();

const React = require('React');
const ReactTestUtils = require('ReactTestUtils');
let FbtErrorListenerWWW;
let FbtResult;

describe('FbtResult: WWW-only', function () {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    FbtErrorListenerWWW = require('FbtErrorListenerWWW');
    FbtResult = require('FbtResult');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('Behaves like a React element & works w/ React rendering', function () {
    const result = new FbtResult(['hippopotamus']);
    expect(React.isValidElement(result)).toBe(true);
    expect(result.toString()).toBe('hippopotamus');

    const div = ReactTestUtils.renderIntoDocument(<div>{result}</div>);
    expect(div.textContent).toBe('hippopotamus');
  });

  describe('when being serialized with non-FBT contents', () => {
    const translation = 'une traduction';
    const hash = 'some hash';
    let FBLogger;
    let FbtFBLogger;

    beforeEach(() => {
      jest.mock(
        'FBLogger',
        () =>
          (FBLogger = jest.fn(_loggerProject => ({
            blameToPreviousDirectory: jest.fn(() => ({
              blameToPreviousDirectory: jest.fn(() => {
                return (FbtFBLogger = {
                  mustfix: jest.fn(() => {}),
                });
              }),
            })),
          }))),
      );
    });

    it('will invoke onStringSerializationError() ', function () {
      const nonFbtContent = /non_fbt_content/;
      const listener = new FbtErrorListenerWWW({
        translation,
        hash,
      });

      // spy on the original method, but preserve original behavior
      jest.spyOn(listener, 'onStringSerializationError');

      const result = new FbtResult(['kombucha', nonFbtContent], listener);
      result.toString();
      expect(listener.onStringSerializationError).toHaveBeenCalledTimes(1);
      expect(listener.onStringSerializationError).toHaveBeenCalledWith(
        nonFbtContent,
      );
      expect(FBLogger).toHaveBeenCalledWith('fbt');
      expect(FbtFBLogger.mustfix).toHaveBeenCalledWith(
        'Converting to a string will drop content data. Hash="%s" Translation="%s" Content="%s" (type=%s,%s)',
        hash,
        translation,
        '{}',
        'object',
        'RegExp',
      );
    });
  });
});
