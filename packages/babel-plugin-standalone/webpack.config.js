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

const path = require('path');
const process = require('process');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
const webpack = require('webpack');
const PRODUCTION = 'production';
const NODE_ENV = process.env.NODE_ENV || PRODUCTION;
const mainFilename = 'index.js';

module.exports = {
  target: 'web',
  entry: `./src/${mainFilename}`,
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: mainFilename,
    library: {
      type: 'commonjs2',
    },
  },
  mode: NODE_ENV,
  optimization: {
    // For debugging, set `moduleIds: 'named'` to expose module names instead of a number
    minimize: false,
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: `/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @${'generated'}
 * @${'noflow'}
 * @${'nolint'}
 * @${'nogrep'}
 * @oncall i18n_fbt_js
 */
`,
      raw: true,
    }),
    new webpack.ProvidePlugin({
      process: require.resolve('process'),
      Buffer: [require.resolve('buffer/'), 'Buffer'],
    }),
    // The JS build pipeline that we run on our module built by webpack will attempt to transform
    // require() statements, but its parsing is very basic.  Obfuscate these require() statements
    // to avoid the resulting breakage from the attempted transform.
    // Error example: P410206914
    new ReplaceInFileWebpackPlugin([
      {
        dir: 'dist',
        files: [mainFilename],
        rules: [
          // Fix this problematic code pattern:
          //
          //   (" is not bound. Did you forget to require('").concat(...)
          {
            search: /\brequire\('"/g,
            replace: `require" + "('"`,
          },
          // Fix this problematic code pattern:
          //
          //  function TSExternalModuleReference(node) {
          //     this.token("require(");
          //     this.print(node.expression, node);
          //     this.token(")");
          //   }
          {
            search: `"require\("`,
            replace: `"require" + "("`,
          },
          // Fix this problematic code pattern:
          //
          //   freeModule.require('util').types;
          {
            search: /\.require\('(\w+)'\)/g,
            replace: `['require']($1)`,
          },
        ],
      },
    ]),
    // compile time plugins
    new webpack.DefinePlugin({
      __DEV__: JSON.stringify(NODE_ENV !== PRODUCTION),
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    }),
  ],
  resolve: {
    alias: {
      // This is used by FbtCollector to read files on disk but not needed in browsers
      'graceful-fs': 'empty',
      // This is used only by fb-babel-plugin-utils/TestUtil but not needed in browsers
      'json-diff': 'empty',
      // Using a browser-friendly version of the Node `buffer` core module.
      // Adding the `/` suffix to force node.js to consider the custom "buffer" package
      // instead of its native one.
      buffer: require.resolve('buffer/'),
    },
    fallback: {
      'graceful-fs': false,
      'json-diff': false,
      fs: false,
      os: require.resolve('os-browserify/browser'),
      path: require.resolve('path-browserify'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            comments: false,
            plugins: [
              [
                require('babel-plugin-minify-replace'),
                {
                  replacements: [
                    {
                      identifierName: '__DEV__',
                      replacement: {
                        type: 'booleanLiteral',
                        value: true,
                      },
                    },
                  ],
                },
              ],
              // Same list of transforms as babelPlugins.js
              require('@babel/plugin-proposal-optional-catch-binding'),
              require('@babel/plugin-syntax-class-properties'),
              require('@babel/plugin-syntax-flow'),
              require('babel-plugin-syntax-trailing-function-commas'),
              require('@babel/plugin-syntax-object-rest-spread'),
              require('babel-preset-fbjs/plugins/dev-expression'),
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
              require('babel-preset-fbjs/plugins/object-assign'),
            ],
          },
        },
      },
    ],
  },
};
