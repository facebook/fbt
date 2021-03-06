/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @noflow
 * @emails oncall+i18n_fbt_js
 */
'use strict';

const moduleMap = Object.assign(
  require('fbjs-scripts/third-party-module-map'),
  {
    invariant: 'invariant',
    React: 'react',
    ReactDOMLegacy_DEPRECATED: 'react-dom',
  },
);

module.exports = moduleMap;
