/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @noflow
 * @emails oncall+internationalization
 */
'use strict';

const moduleMap = Object.assign(
  require('fbjs-scripts/third-party-module-map'),
  {
    invariant: 'invariant',
    React: 'react',
    ReactDOM: 'react-dom',
  },
);

module.exports = moduleMap;
