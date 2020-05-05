/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */
'use strict';

const moduleMap = require('./moduleMap');

// TODO T40028530: Remove this when we can convert to fbjs
// Depends on https://github.com/facebook/fbt/issues/40
module.exports = function babelPresets() {
  const plugins = [
    require('@babel/plugin-syntax-class-properties'),
    require('@babel/plugin-syntax-flow'),
    require('@babel/plugin-syntax-jsx'),
    require('babel-plugin-syntax-trailing-function-commas'),
    require('@babel/plugin-syntax-object-rest-spread'),
    require('babel-preset-fbjs/plugins/dev-expression'),
    require('babel-plugin-fbt'),
    require('babel-plugin-fbt-runtime'),
    [require('babel-preset-fbjs/plugins/rewrite-modules'), {map: moduleMap}],
  ];

  return {
    plugins: plugins.concat([
      require('@babel/plugin-transform-template-literals'),
      require('@babel/plugin-transform-literals'),
      require('@babel/plugin-transform-function-name'),
      require('@babel/plugin-transform-arrow-functions'),
      require('@babel/plugin-transform-block-scoped-functions'),
      require('@babel/plugin-proposal-class-properties'),
      require('@babel/plugin-proposal-nullish-coalescing-operator'),
      require('@babel/plugin-proposal-optional-chaining'),
      [require('@babel/plugin-transform-classes'), {loose: true}],
      require('@babel/plugin-transform-object-super'),
      require('@babel/plugin-transform-shorthand-properties'),
      require('@babel/plugin-transform-computed-properties'),
      require('@babel/plugin-transform-flow-strip-types'),
      require('@babel/plugin-transform-for-of'),
      [require('@babel/plugin-transform-spread'), {loose: true}],
      require('@babel/plugin-transform-parameters'),
      [require('@babel/plugin-transform-destructuring'), {loose: true}],
      require('@babel/plugin-transform-block-scoping'),
      require('@babel/plugin-transform-modules-commonjs'),
      require('@babel/plugin-transform-member-expression-literals'),
      require('@babel/plugin-transform-property-literals'),
      require('@babel/plugin-proposal-object-rest-spread'),
      require('@babel/plugin-transform-react-display-name'),
      require('@babel/plugin-transform-react-jsx'),
      require('babel-preset-fbjs/plugins/object-assign'),
    ]),
  };
};
