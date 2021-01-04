/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @generated SignedSource<<269ed2cf3afd49c2194910a39947ab5e>>
 *
 * @codegen-command : phps FBLocToLangScript
 *
 * @flow strict
 */

const locToLang = {
  "cx_PH": "ceb",
  "ck_US": "chr",
  "fb_AA": "en",
  "fb_AC": "en",
  "fbt_AC": "en",
  "fb_HA": "en",
  "fb_AR": "ar",
  "fb_HX": "en",
  "fb_LS": "en",
  "fb_LL": "en",
  "fb_RL": "en",
  "fb_ZH": "zh",
  "tl_PH": "fil",
  "sy_SY": "syr",
  "qc_GT": "quc",
  "tl_ST": "tlh",
  "gx_GR": "grc",
  "qz_MM": "my",
  "eh_IN": "hi",
  "cb_IQ": "ckb",
  "zz_TR": "zza",
  "tz_MA": "tzm",
  "sz_PL": "szl",
  "bp_IN": "bho",
  "ns_ZA": "nso",
  "fv_NG": "fuv",
  "em_ZM": "bem",
  "qr_GR": "rup",
  "qk_DZ": "kab",
  "qv_IT": "vec",
  "qs_DE": "dsb",
  "qb_DE": "hsb",
  "qe_US": "esu",
  "bv_DE": "bar",
  "qt_US": "tli",
  "nh_MX": "nah",
  "tq_AR": "tob",
  "fn_IT": "fur",
  "lr_IT": "lij"
};

const FBLocaleToLang = {
  get(locale /*: string */) /*: string */ {
    // If given an fb-locale ("xx_XX"), try to map it to a language.  Otherwise
    // return "xx".  If no '_' is found, return locale as-is.
    const idx = locale.indexOf('_');
    return locToLang[locale] || (idx >= 0 ? locale.substr(0, idx) : locale);
  },
};

module.exports = FBLocaleToLang;
