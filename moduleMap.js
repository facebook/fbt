/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @noflow
 * @oncall i18n_fbt_js
 */
'use strict';

const moduleMap = Object.assign(
  require('fbjs-scripts/third-party-module-map'),
  {
    invariant: 'invariant',
    react: 'react',
    ReactDOMLegacy_DEPRECATED: 'react-dom',
  },
);

module.exports = moduleMap;
