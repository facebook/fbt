/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @generated SignedSource<<9a60853945bd01208c5d94f350df08f2>>
 *
 * Run `phps GenderGenScript` to regenerate this file.
 *
 * @flow strict-local
 */

'use strict';

const FBLocaleToLang = require('../FBLocaleToLang');
const IntlDefaultGenderType = require('./IntlDefaultGenderType');
const IntlMergedUnknownGenderType = require('./IntlMergedUnknownGenderType');

/*::
type OutputType = typeof IntlMergedUnknownGenderType | typeof IntlDefaultGenderType;
*/

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
  forLanguage(lang /*: string */) /*: OutputType */ {
    if (_mergedLangs[lang]) {
      return IntlMergedUnknownGenderType;
    }
    return IntlDefaultGenderType;
  },

  forLocale(locale /*: string */) /*: OutputType */ {
    if (_mergedLocales[locale]) {
      return IntlMergedUnknownGenderType;
    }
    return IntlGenderType.forLanguage(FBLocaleToLang.get(locale));
  },
};

module.exports = IntlGenderType;
