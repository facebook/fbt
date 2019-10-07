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

type CustomTranslationPayloadGetter = typeof FbtTranslations.getTranslatedPayload;

const IntlViewerContext = require('IntlViewerContext');

let translatedFbts = null;

const DEFAULT_SRC_LOCALE = 'en_US';
let customTranslationPayloadGetter: ?CustomTranslationPayloadGetter = null;

const FbtTranslations = {
  getTranslatedPayload(
    hashKey: ?string,
    enumHashKey: $FlowFixMe,
    args: Array<$FlowFixMe>,
    _table: string | Object,
  ): ?{table: $FlowFixMe, args: Array<$FlowFixMe>} {
    if (customTranslationPayloadGetter != null) {
      return customTranslationPayloadGetter(hashKey, enumHashKey, args, _table);
    }

    const table =
      translatedFbts != null && translatedFbts[IntlViewerContext.locale];
    if (__DEV__) {
      if (!table && IntlViewerContext.locale !== DEFAULT_SRC_LOCALE) {
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

  /**
   * WARNING: this is an experimental feature to help get translation payloads
   * within a React Native environment.
   *
   * We could imagine that the overall web app has a way to load translations
   * on the fly (through its own logic) and it'll be responsible for exposing
   * translations to the FBT OSS library with an API like this.
   * This is more flexible than just relying on basic hashmap like `translatedFbts`.
   *
   * This method overrides the translation payload getter implementation from
   * (#getTranslatedPayload). You can give it a `null` argument to restore
   * the default payload getter behavior.
   */
  setCustomTranslationPayloadGetter__EXPERIMENTAL(
    getter: CustomTranslationPayloadGetter,
  ): this {
    customTranslationPayloadGetter = getter;
    return this;
  },

  registerTranslations(translations): this {
    translatedFbts = translations;
    return this;
  },

  isComponentScript(): boolean {
    return false;
  },
};

module.exports = FbtTranslations;
