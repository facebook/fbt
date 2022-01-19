/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @format
 * @flow strict-local
 * @emails oncall+i18n_fbt_js
 */

const FbtResult = require('FbtResult');
const FbtTranslations = require('FbtTranslations');
const GenderConst = require('GenderConst');
const IntlVariations = require('IntlVariations');

const fbt = require('fbt');
const init = require('fbtInit');

/**
 * fbt's public-facing module.  Intended use:
 * const {fbt, IntlVariations} = require('fbt');
 */
const FbtPublic = {
  __esModule: true,
  default: fbt,
  fbt,
  FbtResult,
  FbtTranslations,
  GenderConst,
  init,
  IntlVariations,
};
module.exports = FbtPublic;
