/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p intl
 *
 * @emails oncall+i18n_fbt_js
 * @format
 * @typechecks
 */

'use strict';

jest.disableAutomock();

const fbt = require('fbt');
const intlList = require('intlList');

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
    const items = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const result = intlList(items);
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
  it('should handle bullet delimiters', () => {
    expect(
      intlList(
        ['first', 'second', 'third'],
        intlList.CONJUNCTIONS.NONE,
        intlList.DELIMITERS.BULLET,
      ),
    ).toBe('first \u2022 second \u2022 third');
  });
});
