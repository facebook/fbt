/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @flow strict-local
 * @format
 */

const FbtTranslations = require('FbtTranslations');
function fbtInit(opts) {
  FbtTranslations.registerTranslations(opts.translations);
}

module.exports = fbtInit;
