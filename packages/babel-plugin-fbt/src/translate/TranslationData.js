/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 * @noflow
 */

class TranslationData {
  constructor(
    tokens,
    types,
    translations, // [{translation: "...", variations:[...], ?id: "..."}]
  ) {
    this.tokens = tokens;
    this.types = types;
    this.translations = translations;
  }

  static fromJSON(json /*Object*/) {
    return new TranslationData(json.tokens, json.types, json.translations);
  }

  static deserialize(jsonStr /*string*/) {
    TranslationData.fromJSON(JSON.parse(jsonStr));
  }

  hasTranslation() {
    return this.translations.length > 0;
  }

  // Makes a best effort attempt at finding the default translation.
  getDefaultTranslation(config) {
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
