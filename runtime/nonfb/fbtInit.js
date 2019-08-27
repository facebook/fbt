/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow strict-local
 * @format
 */

const FbtTranslations = require('FbtTranslations');

function fbtInit({translations, customTranslationPayloadGetter__EXPERIMENTAL}) {
  FbtTranslations.registerTranslations(translations);

  if (customTranslationPayloadGetter__EXPERIMENTAL != null) {
    FbtTranslations.setCustomTranslationPayloadGetter__EXPERIMENTAL(
      customTranslationPayloadGetter__EXPERIMENTAL,
    );
  }
}

module.exports = fbtInit;
