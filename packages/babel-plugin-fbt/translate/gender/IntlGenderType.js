/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @generated SignedSource<<0a3046130901f3c192589cd071b5c379>>
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
    "ks_IN": 1
};

const _mergedLangs = {
    "ht": 1,
    "lv": 1,
    "ar": 1,
    "ks": 1
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
