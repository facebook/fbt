/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4a8ead7e50387e121c39c1a21ded1f51>>
 *
 * Run `phps GenderGenScript` to regenerate this file.
 *
 * @flow strict-local
 * @oncall i18n_fbt_oss
 */

'use strict';

const FBLocaleToLang = require('../FBLocaleToLang');
const IntlDefaultGenderType = require('./IntlDefaultGenderType');
const IntlMergedUnknownGenderType = require('./IntlMergedUnknownGenderType');

export type IntlGenderTypeImpl = typeof IntlMergedUnknownGenderType | typeof IntlDefaultGenderType;

const _mergedLocales = {
    "ar_AR": 1,
    "ks_IN": 1,
    "lv_LV": 1,
    "ps_AF": 1,
    "qk_DZ": 1,
    "qs_DE": 1,
    "qv_IT": 1,
    "sq_AL": 1,
    "ti_ET": 1
};

const _mergedLangs = {
    "ar": 1,
    "ks": 1,
    "lv": 1,
    "ps": 1,
    "kab": 1,
    "dsb": 1,
    "vec": 1,
    "sq": 1,
    "ti": 1
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
