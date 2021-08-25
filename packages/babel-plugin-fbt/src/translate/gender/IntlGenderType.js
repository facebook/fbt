/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @generated SignedSource<<2015a449248f6952509505be6717d1d1>>
 *
 * Run `phps GenderGenScript` to regenerate this file.
 *
 * @flow strict-local
 */

'use strict';

const FBLocaleToLang = require('../FBLocaleToLang');
const IntlDefaultGenderType = require('./IntlDefaultGenderType');
const IntlMergedUnknownGenderType = require('./IntlMergedUnknownGenderType');

export type IntlGenderTypeImpl = typeof IntlMergedUnknownGenderType | typeof IntlDefaultGenderType;

const _mergedLocales = {
    "ar_AR": 1,
    "ht_HT": 1,
    "ks_IN": 1,
    "lv_LV": 1,
    "qk_DZ": 1,
    "qs_DE": 1,
    "qv_IT": 1
};

const _mergedLangs = {
    "ar": 1,
    "ht": 1,
    "ks": 1,
    "lv": 1,
    "kab": 1,
    "dsb": 1,
    "vec": 1
};

const IntlGenderType = {
  forLanguage(lang: string): IntlGenderTypeImpl {
    if (_mergedLangs[lang]) {
      return IntlMergedUnknownGenderType;
    }
    return IntlDefaultGenderType;
  },

  forLocale(locale: string): IntlGenderTypeImpl {
    if (_mergedLocales[locale]) {
      return IntlMergedUnknownGenderType;
    }
    return IntlGenderType.forLanguage(FBLocaleToLang.get(locale));
  },
};

module.exports = IntlGenderType;
