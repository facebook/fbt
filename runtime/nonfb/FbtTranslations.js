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

const FbtI18nAssets = require("./FbtI18nNativeAssets");

let _translatedFbts: {[hashKey: string]: string} = {};

const FbtTranslations = {
  getTranslatedPayload(
    hashKey: ?string,
    enumHashKey: ?Object,
    args: Array<any>,
    _table: string | Object,
  ): ?Object {
    if (FbtI18nAssets === null) {
      return null;
    }

    if (hashKey !== null) {
      let translatedPayload;
      if (args == null || args.length === 0) {
        // Only caches translations for simple strings with no variations
        if (_translatedFbts.hasOwnProperty(hashKey)) {
          translatedPayload = _translatedFbts[hashKey];
        } else {
          translatedPayload = FbtI18nAssets.getString(hashKey);
          _translatedFbts[hashKey] = translatedPayload;
        }
      } else {
        translatedPayload = FbtI18nAssets.getString(hashKey);
        if (translatedPayload) {
          translatedPayload = JSON.parse(translatedPayload);
        }
      }

      return translatedPayload != null && translatedPayload !== ''
        ? {table: translatedPayload, args}
        : null;
    }

    return null;
  },

  isComponentScript(): boolean {
    return false;
  },

  registerTranslations(translations: {[hashKey: string]: string}) {
    _translatedFbts = translations;
  },
};

module.exports = FbtTranslations;
