/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @generated SignedSource<<82164e5c689dd9874f55ccb2f7c4979f>>
 *
 * @codegen-command : phps FBLocToLangScript
 *
 * @emails oncall+i18n_fbt_js
 * @flow strict
 */

const locToLang = {
  "bp_IN": "bho",
  "bv_DE": "bar",
  "cb_IQ": "ckb",
  "ck_US": "chr",
  "cx_PH": "ceb",
  "eh_IN": "hi",
  "em_ZM": "bem",
  "fb_AA": "en",
  "fb_AC": "en",
  "fb_AR": "ar",
  "fb_HA": "en",
  "fb_HX": "en",
  "fb_LL": "en",
  "fb_LS": "en",
  "fb_RL": "en",
  "fb_ZH": "zh",
  "fbt_AC": "en",
  "fn_IT": "fur",
  "fv_NG": "fuv",
  "gx_GR": "grc",
  "lr_IT": "lij",
  "nh_MX": "nah",
  "ns_ZA": "nso",
  "qb_DE": "hsb",
  "qc_GT": "quc",
  "qe_US": "esu",
  "qk_DZ": "kab",
  "qr_GR": "rup",
  "qs_DE": "dsb",
  "qt_US": "tli",
  "qv_IT": "vec",
  "qz_MM": "my",
  "sy_SY": "syr",
  "sz_PL": "szl",
  "tl_PH": "fil",
  "tl_ST": "tlh",
  "tq_AR": "tob",
  "tz_MA": "tzm",
  "zz_TR": "zza"
};

const FBLocaleToLang = {
  /**
   * If given an fb-locale ("xx_XX"), try to map it to a language. Otherwise return "xx".
   * If no '_' is found, return locale as-is.
   */
  get(locale: string): string {
    if (locToLang[locale]) {
      return locToLang[locale];
    }
    const idx = locale.indexOf('_');
    return idx >= 0 ? locale.substr(0, idx) : locale;
  },
};

module.exports = FBLocaleToLang;
