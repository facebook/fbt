/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * Intended for use with the Facebook FBT framework.
 *
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

const getFbtHash = require('../getFbtHash');

describe('getFbtHash', () => {
  it('returns the hash of an fbt phrase by text and description', () => {
    expect(getFbtHash('Sponge Bob', 'Cartoon character name')).toBe(
      '90ce1bd0f3ca22cb190ab5b0b112c796',
    );
  });
});
