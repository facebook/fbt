/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format strict-local
 */
'use strict';

const moduleMap = Object.assign(
  {},
  require('fbjs/module-map'),
  require('fbjs-scripts/third-party-module-map'),
);

// TODO T40028530: Remove this when we can convert to fbjs
// Depends on https://github.com/facebookincubator/fbt/issues/40
module.exports = function babelPresets(opts) {
  opts = opts || {};
  const plugins = [
    require('@babel/plugin-syntax-class-properties'),
    require('@babel/plugin-syntax-flow'),
    require('@babel/plugin-syntax-jsx'),
    require('babel-plugin-syntax-trailing-function-commas'),
    require('@babel/plugin-syntax-object-rest-spread'),
    require('babel-preset-fbjs/plugins/dev-expression'),
    require('babel-plugin-fbt/index.js'),
    require('babel-plugin-fbt-runtime/index.js'),
    [require('babel-preset-fbjs/plugins/rewrite-modules'), {map: moduleMap}],
  ];

  // We only want to add declarations for flow transforms and not for js. So we
  // have to do this separate from above.
  if (opts.flow) {
    plugins.push(require('babel-preset-fbjs/plugins/dev-declaration'));
  }

  return {
    plugins: plugins.concat([
      require('@babel/plugin-transform-template-literals'),
      require('@babel/plugin-transform-literals'),
      require('@babel/plugin-transform-function-name'),
      require('@babel/plugin-transform-arrow-functions'),
      require('@babel/plugin-transform-block-scoped-functions'),
      require('@babel/plugin-proposal-class-properties'),
      [require('@babel/plugin-transform-classes'), {loose: true}],
      require('@babel/plugin-transform-object-super'),
      require('@babel/plugin-transform-shorthand-properties'),
      require('@babel/plugin-transform-computed-properties'),
      require('@babel/plugin-transform-for-of'),
      [require('@babel/plugin-transform-spread'), {loose: true}],
      require('@babel/plugin-transform-parameters'),
      [require('@babel/plugin-transform-destructuring'), {loose: true}],
      require('@babel/plugin-transform-block-scoping'),
      require('@babel/plugin-transform-modules-commonjs'),
      require('@babel/plugin-transform-member-expression-literals'),
      require('@babel/plugin-transform-property-literals'),
      require('@babel/plugin-transform-flow-strip-types'),
      require('@babel/plugin-proposal-object-rest-spread'),
      require('@babel/plugin-transform-react-display-name'),
      require('@babel/plugin-transform-react-jsx'),
      require('babel-preset-fbjs/plugins/object-assign'),
    ]),
  };
};
