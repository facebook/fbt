/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

import type {IntlFbtVariationTypeValue} from './IntlVariations';
import type TranslationConfig from './TranslationConfig';

/**
 * Corresponds to IntlJSTranslatationDataEntry in Hack
 */
type Translation = {|
  translation: string,
  id?: number,
  // Allow variation enum values to be stored in string or number type,
  // and we will parse it into IntlVariationEnumValue in config.isDefaultVariation()
  variations: {[index: string]: number | string},
|};

export type SerializedTranslationData = {|
  tokens: $ReadOnlyArray<string>,
  types: $ReadOnlyArray<IntlFbtVariationTypeValue>,
  translations: $ReadOnlyArray<Translation>,
|};

class TranslationData {
  +tokens: $ReadOnlyArray<string>;
  +types: $ReadOnlyArray<IntlFbtVariationTypeValue>;
  +translations: $ReadOnlyArray<Translation>;
  _defaultTranslation: ?string;

  constructor(
    tokens: $ReadOnlyArray<string>,
    types: $ReadOnlyArray<IntlFbtVariationTypeValue>,
    translations: $ReadOnlyArray<Translation>,
  ) {
    this.tokens = tokens;
    this.types = types;
    this.translations = translations;
  }

  static fromJSON: (json: ?SerializedTranslationData) => ?TranslationData =
    json => {
      if (json == null) {
        // Hash key is logged to stderr in `processTranslations`
        return null;
      }
      return new TranslationData(json.tokens, json.types, json.translations);
    };

  hasTranslation(): boolean {
    return this.translations.length > 0;
  }

  // Makes a best effort attempt at finding the default translation.
  getDefaultTranslation(config: TranslationConfig): ?string {
    if (this._defaultTranslation === undefined) {
      for (let i = 0; i < this.translations.length; ++i) {
        const trans = this.translations[i];
        let isDefault = true;
        for (const v in trans.variations) {
          if (!config.isDefaultVariation(trans.variations[v])) {
            isDefault = false;
            break;
          }
        }
        if (isDefault) {
          return (this._defaultTranslation = trans.translation);
        }
      }
      this._defaultTranslation = null;
    }
    return this._defaultTranslation;
  }
}
module.exports = TranslationData;
