/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Dummy class on www. Fetches translations from language packs on RN/CS.
 *
 * @emails oncall+internationalization
 * @flow
 * @format
 */

'use strict';

const IntlViewerContext = require('IntlViewerContext');

let _translatedFbts = null;

const FbtTranslations = {
  getTranslatedPayload(
    hashKey: ?string,
    enumHashKey: $FlowFixMe,
    args: Array<$FlowFixMe>,
  ): $FlowFixMe {
    const table = _translatedFbts && _translatedFbts[IntlViewerContext.locale];
    if (__DEV__) {
      if (!table) {
        console.warn('Translations have not been provided');
      }
    }

    if (!table || !table[hashKey]) {
      return null;
    }
    return {
      table: table[hashKey],
      args: args,
    };
  },

  isComponentScript() {
    return false;
  },

  registerTranslations(translations) {
    _translatedFbts = translations;
  },
};

module.exports = FbtTranslations;
