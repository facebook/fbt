/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p fbt --local ~/www
 *
 * @flow
 * @format
 * @oncall i18n_fbt_js
 */

jest.disableAutomock();

const FbtHooks = require('FbtHooks');
const FbtResult = require('FbtResult');

const nullthrows = require('nullthrows');

let _errorListener;

describe('FbtResult', function () {
  beforeEach(() => {
    jest.resetModules();
    _errorListener = FbtHooks.getErrorListener({
      hash: 'h',
      translation: 't',
    });
  });

  it('can be flattened into array', function () {
    const errorListener = nullthrows(_errorListener);
    let obj1 = new FbtResult(['prefix'], errorListener);

    const obj2 = new FbtResult(['suffix'], errorListener);

    let obj3 = new FbtResult([obj1, 'content', obj2], errorListener);
    expect(
      // flow doesn't think FbtResult.flattenToArray exists because of
      // our egregious lies spat out in module.exports of FbtResultBase.js
      // $FlowFixMe[prop-missing] flattenToArray
      obj3.flattenToArray().join(' '),
    ).toBe('prefix content suffix');

    obj1 = new FbtResult(['prefix'], errorListener);

    // $FlowExpectedError[incompatible-type]
    const stringable: $FbtContentItem = {
      toString() {
        return 'stringable';
      },
    };

    obj3 = new FbtResult([obj1, 'content', stringable], errorListener);
    expect(
      // flow doesn't think FbtResult.flattenToArray exists because of
      // our egregious lies spat out in module.exports of FbtResultBase.js
      // $FlowFixMe[prop-missing] flattenToArray
      obj3.flattenToArray().join(' '),
    ).toBe('prefix content stringable');
  });

  it('does not invoke onStringSerializationError() when being serialized with valid-FBT contents', function () {
    const errorListener = nullthrows(_errorListener);
    const result = new FbtResult(
      ['hello', new FbtResult(['world'], errorListener)],
      errorListener,
    );
    // $FlowFixMe[cannot-write] We're mocking a read-only property (method) below
    errorListener.onStringSerializationError = jest.fn();
    result.toString();
    expect(errorListener?.onStringSerializationError).not.toHaveBeenCalled();
  });
});
