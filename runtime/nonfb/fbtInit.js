/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */
const FbtHooks = require('FbtHooks');
const FbtResult = require('FbtResult');
const FbtTranslations = require('FbtTranslations');

const getFbsResult = require('getFbsResult');

function fbtInit({
  customTranslationPayloadGetter__EXPERIMENTAL,
  hooks = {},
  translations,
}) {
  FbtTranslations.registerTranslations(translations);

  if (customTranslationPayloadGetter__EXPERIMENTAL != null) {
    FbtTranslations.setCustomTranslationPayloadGetter__EXPERIMENTAL(
      customTranslationPayloadGetter__EXPERIMENTAL,
    );
  }
  // If getFbtResult isn't defined, provide a default one out of the box.
  if (hooks.getFbtResult === undefined) {
    hooks.getFbtResult = FbtResult.get;
  }
  if (hooks.getFbsResult === undefined) {
    hooks.getFbsResult = getFbsResult;
  }
  FbtHooks.register(hooks);
}

module.exports = fbtInit;
