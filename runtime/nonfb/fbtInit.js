/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

const FbtHooks = require('FbtHooks');
const FbtTranslations = require('FbtTranslations');

function fbtInit({
  customTranslationPayloadGetter__EXPERIMENTAL,
  hooks,
  translations,
}) {
  FbtTranslations.registerTranslations(translations);

  if (customTranslationPayloadGetter__EXPERIMENTAL != null) {
    FbtTranslations.setCustomTranslationPayloadGetter__EXPERIMENTAL(
      customTranslationPayloadGetter__EXPERIMENTAL,
    );
  }
  if (hooks != null) {
    FbtHooks.register(hooks);
  }
}

module.exports = fbtInit;
