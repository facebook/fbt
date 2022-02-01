/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 * @noflow
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
