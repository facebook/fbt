/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict-local
 * @emails oncall+internationalization
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
