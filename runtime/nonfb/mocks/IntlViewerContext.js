/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict
 * @format
 * @oncall i18n_fbt_js
 */

// flowlint ambiguous-object-type:error

const IntlVariations = require('IntlVariations');

// Keep this in sync with IntlViewerContext.js.flow
// It's almost the same except that the `locale` field is optional on www
// and required in the OSS version
const IntlViewerContext = {
  GENDER: IntlVariations.GENDER_UNKNOWN,
  regionalLocale: 'en_US',
  locale: 'en_US',
};

module.exports = IntlViewerContext;
