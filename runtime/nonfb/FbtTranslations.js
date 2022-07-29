/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * Dummy class on www. Fetches translations from language packs on RN/CS.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

import type {FbtRuntimeCallInput, FbtTranslatedInput} from 'FbtHooks';

const FbtHooks = require('FbtHooks');

let translatedFbts: TranslationDict = {};

type TranslationStr = string;

// {locale: {hash: translation}}
export type TranslationDict = {
  [locale: string]: {[hashKey: string]: TranslationStr},
};

const DEFAULT_SRC_LOCALE = 'en_US';

const FbtTranslations = {
  getTranslatedInput(input: FbtRuntimeCallInput): ?FbtTranslatedInput {
    const {args, options} = input;
    const hashKey = options?.hk;
    const {locale} = FbtHooks.getViewerContext();
    const table = translatedFbts[locale];
    if (__DEV__) {
      if (!table && locale !== DEFAULT_SRC_LOCALE) {
        console.warn('Translations have not been provided');
      }
    }

    if (hashKey == null || table?.[hashKey] == null) {
      return null;
    }
    return {
      table: table[hashKey],
      args,
    };
  },

  registerTranslations(translations: TranslationDict): void {
    translatedFbts = translations;
  },

  getRegisteredTranslations(): TranslationDict {
    return translatedFbts;
  },

  mergeTranslations(newTranslations: TranslationDict): void {
    Object.keys(newTranslations).forEach(locale => {
      translatedFbts[locale] = Object.assign(
        translatedFbts[locale] ?? {},
        newTranslations[locale],
      );
    });
  },
};

module.exports = FbtTranslations;
