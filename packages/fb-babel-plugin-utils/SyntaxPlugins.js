/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * TODO: Place team name in emails tag.
 * @emails oncall+internationalization
 */

// flowlint ambiguous-object-type:error

'use strict';

const SyntaxPluginsConfig = require('./SyntaxPluginsConfig');

// Keep these require's explicit for grep friendliness.
const SYNTAX_PLUGINS_MAP /*: {[string]: ?Object | [Object, {...}], ...} */ = {
  '@babel/plugin-syntax-class-properties': require('@babel/plugin-syntax-class-properties'),
  '@babel/plugin-syntax-flow': [
    require('@babel/plugin-syntax-flow'),
    {enums: true},
  ],
  '@babel/plugin-syntax-jsx': require('@babel/plugin-syntax-jsx'),
  '@babel/plugin-syntax-object-rest-spread': require('@babel/plugin-syntax-object-rest-spread'),
  '@babel/plugin-syntax-numeric-separator': require('@babel/plugin-syntax-numeric-separator'),
  '@babel/plugin-syntax-optional-chaining': require('@babel/plugin-syntax-optional-chaining'),
  '@babel/plugin-syntax-nullish-coalescing-operator': require('@babel/plugin-syntax-nullish-coalescing-operator'),
  '@babel/plugin-syntax-optional-catch-binding': require('@babel/plugin-syntax-optional-catch-binding'),
};

if (SyntaxPluginsConfig.shouldEnableFBSourcePlugins) {
  SYNTAX_PLUGINS_MAP[
    '@babel/plugin-syntax-dynamic-import'
  ] = require('@babel/plugin-syntax-dynamic-import');
}

const SYNTAX_PLUGINS /*: Array<Object> */ = [];
for (const pluginName in SYNTAX_PLUGINS_MAP) {
  SYNTAX_PLUGINS.push(SYNTAX_PLUGINS_MAP[pluginName]);
}

module.exports = {
  list: SYNTAX_PLUGINS,
  map: SYNTAX_PLUGINS_MAP,
};
