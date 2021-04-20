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

const path = require('path');
const process = require('process');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
const webpack = require('webpack');
const PROD_MODE = 'production';
const NODE_ENV = process.env.NODE_ENV || PROD_MODE;
const isProd = NODE_ENV === PROD_MODE;
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
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @${'generated'}
 * @${'noflow'}
 * @${'nolint'}
 * @${'nogrep'}
 * @emails oncall+internationalization
 */
`,
      raw: true,
    }),
    new webpack.ProvidePlugin({
      process: require.resolve('process'),
      Buffer: [require.resolve('buffer/'), 'Buffer'],
    }),
    // Our internal JS pipeline has a pretty rudimentary `require(...)` detection algorithm
    // so we need to obfuscate a number of "require()" call patterns in the generated bundle.
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
      __DEV__: JSON.stringify(!isProd),
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
    }),
  ],
  resolve: {
    alias: {
      'graceful-fs': 'empty',
      'json-diff': 'empty',
      // Adding the `/` suffix to force node.js to consider the custom "buffer" package
      // instead of its native one
      buffer: require.resolve('buffer/'),
      process: require.resolve('process'),
    },
    modules: ['../../node_modules'],
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
