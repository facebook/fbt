/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

const escapeRegex = require('escapeRegex');

describe('escapeRegex', () => {
  it('escapes individual special characters', () => {
    expect(escapeRegex('.')).toBe('\\.');
    expect(escapeRegex('\\')).toBe('\\\\');
    expect(escapeRegex('[')).toBe('\\[');
    expect(escapeRegex(']')).toBe('\\]');
    expect(escapeRegex('(')).toBe('\\(');
    expect(escapeRegex(')')).toBe('\\)');
    expect(escapeRegex('{')).toBe('\\{');
    expect(escapeRegex('}')).toBe('\\}');
    expect(escapeRegex('^')).toBe('\\^');
    expect(escapeRegex('$')).toBe('\\$');
    expect(escapeRegex('-')).toBe('\\-');
    expect(escapeRegex('|')).toBe('\\|');
    expect(escapeRegex('?')).toBe('\\?');
    expect(escapeRegex('*')).toBe('\\*');
    expect(escapeRegex('+')).toBe('\\+');
  });

  it("doesn't change characters that have escape sequences", () => {
    expect(escapeRegex('\n')).toBe('\n');
    expect(escapeRegex('\t')).toBe('\t');
    expect(escapeRegex('\b')).toBe('\b');
    expect(escapeRegex('\f')).toBe('\f');
    expect(escapeRegex('\v')).toBe('\v');
    expect(escapeRegex('\r')).toBe('\r');
    expect(escapeRegex('\0')).toBe('\0');
  });

  it('escapes multiple special characters', () => {
    expect(escapeRegex('hello? good-bye...')).toBe(
      'hello\\? good\\-bye\\.\\.\\.',
    );
    expect(escapeRegex('1 + 1 * 3 - 2 = 2')).toBe('1 \\+ 1 \\* 3 \\- 2 = 2');
    expect(escapeRegex('[]{}()')).toBe('\\[\\]\\{\\}\\(\\)');
  });

  it("doesn't change non-special characters", () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    expect(escapeRegex(alphabet)).toBe(alphabet);

    const digits = '0123456789';
    expect(escapeRegex(digits)).toBe(digits);

    const punctuation = '~`!@#%&_=:;"\'<>,/';
    expect(escapeRegex(punctuation)).toBe(punctuation);
  });
});
