/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

/* eslint-disable fb-www/check-unicode-format */

jest.disableAutomock();

import {dedupeStops} from 'IntlPunctuation';

const FW_Q_MARK = '\u{ff1f}';
const FW_BANG = '\u{ff01}';
const HINDI_FS = '\u{0964}';
const MYANMAR_FS = '\u{104B}';
const CJK_FS = '\u{3002}';
const ELLIP = '\u{2026}';
const THAI_ELLIP = '\u{0e2f}';
const LAOTIAN_ELLIP = '\u{0eaf}';
const MONGOLIAN_ELLIP = '\u{1801}';

describe('IntlPunctuation', function () {
  it('strips redundant stops', () => {
    const expected = {
      '?': [
        '?',
        FW_Q_MARK,
        '.',
        HINDI_FS,
        MYANMAR_FS,
        CJK_FS,
        '!',
        FW_BANG,
        ELLIP,
        THAI_ELLIP,
        LAOTIAN_ELLIP,
        MONGOLIAN_ELLIP,
      ],
      [FW_Q_MARK]: [
        '?',
        FW_Q_MARK,
        '.',
        HINDI_FS,
        MYANMAR_FS,
        CJK_FS,
        '!',
        FW_BANG,
        ELLIP,
        THAI_ELLIP,
        LAOTIAN_ELLIP,
        MONGOLIAN_ELLIP,
      ],
      '!': ['!', FW_BANG, '?', FW_Q_MARK, '.', HINDI_FS, MYANMAR_FS, CJK_FS],
      [FW_BANG]: [
        '!',
        FW_BANG,
        '?',
        FW_Q_MARK,
        '.',
        HINDI_FS,
        MYANMAR_FS,
        CJK_FS,
      ],
      '.': ['.', HINDI_FS, MYANMAR_FS, CJK_FS, '!', FW_BANG],
      [HINDI_FS]: ['.', HINDI_FS, MYANMAR_FS, CJK_FS, '!', FW_BANG],
      [MYANMAR_FS]: ['.', HINDI_FS, MYANMAR_FS, CJK_FS, '!', FW_BANG],
      [CJK_FS]: ['.', HINDI_FS, MYANMAR_FS, CJK_FS, '!', FW_BANG],
      [ELLIP]: [
        ELLIP,
        THAI_ELLIP,
        LAOTIAN_ELLIP,
        MONGOLIAN_ELLIP,
        '.',
        HINDI_FS,
        MYANMAR_FS,
        CJK_FS,
        '!',
        FW_BANG,
      ],
      [THAI_ELLIP]: [
        ELLIP,
        THAI_ELLIP,
        LAOTIAN_ELLIP,
        MONGOLIAN_ELLIP,
        '.',
        HINDI_FS,
        MYANMAR_FS,
        CJK_FS,
        '!',
        FW_BANG,
      ],
      [LAOTIAN_ELLIP]: [
        ELLIP,
        THAI_ELLIP,
        LAOTIAN_ELLIP,
        MONGOLIAN_ELLIP,
        '.',
        HINDI_FS,
        MYANMAR_FS,
        CJK_FS,
        '!',
        FW_BANG,
      ],
      [MONGOLIAN_ELLIP]: [
        ELLIP,
        THAI_ELLIP,
        LAOTIAN_ELLIP,
        MONGOLIAN_ELLIP,
        '.',
        HINDI_FS,
        MYANMAR_FS,
        CJK_FS,
        '!',
        FW_BANG,
      ],
    };
    for (const prefix in expected) {
      for (const suffix of expected[prefix]) {
        const result = dedupeStops(prefix, suffix);
        expect({prefix, suffix, result}).toEqual({prefix, suffix, result: ''});
      }
    }
  });

  it("doesn't strip stops it shouldn't", function () {
    expect(dedupeStops('.', '?')).toEqual('?');
  });
});
