/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @format
 * @oncall i18n_fbt_js
 */

const FBLocaleToLang = require('../FBLocaleToLang');

describe('Test FBLocaleToLang', () => {
  it('should map a locale', () => {
    expect(FBLocaleToLang.get('fb_HX')).toEqual('en');
  });

  it('should strip lang from unmapped locale', () => {
    expect(FBLocaleToLang.get('ru_RU')).toEqual('ru');
  });

  it('should leave locale alone when no underscore is present', () => {
    expect(FBLocaleToLang.get('ru')).toEqual('ru');
  });
});
