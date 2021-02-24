/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict
 * @emails oncall+internationalization
 */

// flowlint ambiguous-object-type:error

const IntlVariations = require('IntlVariations');

// Keep this in sync with IntlViewerContext.js.flow
// It's almost the same except that the `locale` field is optional on www
// and required in the OSS version
const IntlViewerContext = {
  GENDER: IntlVariations.GENDER_UNKNOWN,
  locale: 'en_US',
};

module.exports = IntlViewerContext;
