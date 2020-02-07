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

function fbtInit({hooks = {}, translations}) {
  FbtTranslations.registerTranslations(translations);

  // Hookup default implementations
  if (hooks.getFbtResult == null) {
    hooks.getFbtResult = FbtResult.get;
  }
  if (hooks.getFbsResult == null) {
    hooks.getFbsResult = getFbsResult;
  }
  if (hooks.getTranslatedPayload == null) {
    hooks.getTranslatedPayload = FbtTranslations.getTranslatedPayload;
  }
  FbtHooks.register(hooks);
}

module.exports = fbtInit;
