/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 */

const FbtTranslations = require('FbtTranslations');
const GenderConst = require('GenderConst');
const IntlVariations = require('IntlVariations');
const IntlViewerContext = require('IntlViewerContext');

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
  FbtTranslations,
  GenderConst,
  init,
  IntlVariations,
  IntlViewerContext,
};
module.exports = FbtPublic;
