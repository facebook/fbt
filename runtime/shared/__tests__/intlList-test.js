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
 * @typechecks
 * @emails oncall+internationalization
 */

'use strict';

jest.disableAutomock();

var fbt = require('fbt');
var intlList = require('intlList');

describe('intlList', () => {
  // Settings for fbt mock
  fbt.replaceParams = true;
  fbt.jsonEncode = false;

  it('should handle an empty list', () => {
    expect(intlList([])).toBe('');
  });
  it('should handle a single item', () => {
    expect(intlList(['first'])).toBe('first');
  });
  it('should handle two items', () => {
    expect(intlList(['first', 'second'])).toBe('first and second');
  });
  it('should handle three items', () => {
    expect(intlList(['first', 'second', 'third'])).toBe(
      'first, second and third',
    );
  });
  it('should handle a bunch of items', () => {
    var items = ['1', '2', '3', '4', '5', '6', '7', '8'];
    var result = intlList(items);
    expect(result).toBe('1, 2, 3, 4, 5, 6, 7 and 8');
  });
  it('should handle no conjunction', () => {
    expect(
      intlList(['first', 'second', 'third'], intlList.CONJUNCTIONS.NONE),
    ).toBe('first, second, third');
  });
  it('should handle optional delimiter', () => {
    expect(
      intlList(
        ['first', 'second', 'third'],
        intlList.CONJUNCTIONS.NONE,
        intlList.DELIMITERS.SEMICOLON,
      ),
    ).toBe('first; second; third');
  });
});
