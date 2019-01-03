/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p fbt --remote localhost:~/www
 *
 * @format
 * @emails oncall+internationalization
 */

jest.disableAutomock();
console.error = jest.fn();

const FbtResult = require('FbtResult');

describe('FbtResult', function() {
  it('can be flattened into array', function() {
    var obj1 = new FbtResult(['prefix']);

    var obj2 = new FbtResult(['suffix']);

    var obj3 = new FbtResult([obj1, 'content', obj2]);
    expect(obj3.flattenToArray().join(' ')).toBe('prefix content suffix');

    obj1 = new FbtResult(['prefix']);

    obj2 = {
      a: 'random1',
      b: 'random2',
      toString: function() {
        return 'obj2';
      },
    };

    obj3 = new FbtResult([obj1, 'content', obj2]);
    expect(obj3.flattenToArray().join(' ')).toBe('prefix content obj2');
  });

  it('implements common string methods', function() {
    var result = new FbtResult(['kombucha'], false, 'kombucha', null);
    expect(result.startsWith('kom')).toBe(true);
    expect(console.error.mock.calls.length).toBe(1);
    expect(result.slice(1, 3)).toBe('om');
    expect(console.error.mock.calls.length).toBe(2);
  });

  it('does not invoke onStringSerializationError() when being serialized with valid-FBT contents', function() {
    const result = new FbtResult(['hello', new FbtResult('world')]);
    result.onStringSerializationError = jest.fn();
    result.toString();
    expect(result.onStringSerializationError).not.toHaveBeenCalled();
  });
});
