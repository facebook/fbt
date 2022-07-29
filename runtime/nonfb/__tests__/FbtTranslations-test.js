/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow
 * @oncall i18n_fbt_js
 */

import FbtTranslations from '../FbtTranslations';

describe('FbtTranslations', () => {
  it('can register and get back translations', () => {
    FbtTranslations.registerTranslations({en_US: {c1: 'aaa'}});
    expect(FbtTranslations.getRegisteredTranslations()).toMatchInlineSnapshot(`
    Object {
      "en_US": Object {
        "c1": "aaa",
      },
    }
  `);
  });

  it('merges translations with the same locale as expected', () => {
    FbtTranslations.registerTranslations({en_US: {c1: 'aaa'}});
    FbtTranslations.mergeTranslations({en_US: {c2: 'bbb'}});
    expect(FbtTranslations.getRegisteredTranslations()).toMatchInlineSnapshot(`
    Object {
      "en_US": Object {
        "c1": "aaa",
        "c2": "bbb",
      },
    }
  `);
  });

  it('merges translations with different locales as expected', () => {
    FbtTranslations.registerTranslations({en_US: {c1: 'aaa'}});
    FbtTranslations.mergeTranslations({
      es_MX: {c1: 'bbb'},
      cs_CZ: {c1: 'ccc'},
    });
    expect(FbtTranslations.getRegisteredTranslations()).toMatchInlineSnapshot(`
    Object {
      "cs_CZ": Object {
        "c1": "ccc",
      },
      "en_US": Object {
        "c1": "aaa",
      },
      "es_MX": Object {
        "c1": "bbb",
      },
    }
  `);
  });

  it('merges translations with the same hash as expected', () => {
    FbtTranslations.registerTranslations({en_US: {c1: 'aaa', c2: 'bbb'}});
    FbtTranslations.mergeTranslations({en_US: {c1: 'ccc'}});
    expect(FbtTranslations.getRegisteredTranslations()).toMatchInlineSnapshot(`
    Object {
      "en_US": Object {
        "c1": "ccc",
        "c2": "bbb",
      },
    }
  `);
  });
});
