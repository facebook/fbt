/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @generated SignedSource<<8db5c2144dc57157d5982d77af2adfb6>>
 *
 * Run `phps GenderGenScript` to regenerate this file.
 *
 * @flow
 */
const FBLocaleToLang = require('../FBLocaleToLang');
const IntlDefaultGenderType = require('./IntlDefaultGenderType');
const IntlMergedUnknownGenderType = require('./IntlMergedUnknownGenderType');

const _mergedLocales = {
    "ht_HT": 1,
    "lv_LV": 1,
    "ar_AR": 1,
    "ks_IN": 1,
    "qk_DZ": 1,
    "qv_IT": 1,
    "qs_DE": 1
};

const _mergedLangs = {
    "ht": 1,
    "lv": 1,
    "ar": 1,
    "ks": 1,
    "kab": 1,
    "vec": 1,
    "dsb": 1
};

const IntlGenderType = {
  forLanguage: function(lang) {
    if (_mergedLangs[lang]) {
      return IntlMergedUnknownGenderType;
    }
    return IntlDefaultGenderType;
  },

  forLocale: function(locale) {
    if (_mergedLocales[locale]) {
      return IntlMergedUnknownGenderType;
    }
    return IntlGenderType.forLanguage(FBLocaleToLang.get(locale));
  },
};

module.exports = IntlGenderType;
