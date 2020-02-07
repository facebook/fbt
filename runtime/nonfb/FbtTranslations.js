/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Dummy class on www. Fetches translations from language packs on RN/CS.
 *
 * @emails oncall+internationalization
 * @flow strict
 * @format
 */

'use strict';

type CustomTranslationPayloadGetter = typeof FbtTranslations.getTranslatedPayload;
import type {FbtRuntimeCallInput, FbtTranslatedInput} from 'FbtHooks';

const IntlViewerContext = require('IntlViewerContext');

let translatedFbts = null;

type TranslationStr = string;

// {locale: {hash: translation}}
type TranslationDict = {[locale: string]: {[hashKey: string]: TranslationStr}};

const DEFAULT_SRC_LOCALE = 'en_US';

const FbtTranslations = {
  getTranslatedPayload(input: FbtRuntimeCallInput): ?FbtTranslatedInput {
    const {args, options} = input;
    const hashKey = options?.hk;
    const table =
      translatedFbts != null && translatedFbts[IntlViewerContext.locale];
    if (__DEV__) {
      if (!table && IntlViewerContext.locale !== DEFAULT_SRC_LOCALE) {
        console.warn('Translations have not been provided');
      }
    }

    if (!table || hashKey == null || table[hashKey] == null) {
      return null;
    }
    return {
      table: table[hashKey],
      args: args,
    };
  },

  registerTranslations(translations: TranslationDict): void {
    translatedFbts = translations;
  },
};

module.exports = FbtTranslations;
