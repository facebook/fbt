/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @noflow
 * @oncall i18n_fbt_js
 */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: path.join(__dirname, 'src', 'root.js'),
  output: {
    path: path.join(__dirname, 'output'),
    filename: '[name].js'
  },
  mode: process.env.NODE_ENV || 'development',
  resolve: {
    alias: {
      invariant: path.resolve(
        __dirname,
        '../node_modules/invariant/invariant.js'
      ),
    },
    modules: [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'src/example'),
      '../node_modules'
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'src')
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            plugins: [
              ['minify-replace', {
                'replacements': [{
                  'identifierName': '__DEV__',
                  'replacement': {
                    'type': 'booleanLiteral',
                    'value': true
                  }
                }]
              }],
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-object-rest-spread',
              '@babel/plugin-proposal-optional-catch-binding',
              '@babel/plugin-proposal-optional-chaining',
              '@babel/plugin-transform-flow-strip-types',
              ['babel-plugin-fbt', {
                fbtCommonPath: './common_strings.json',
                // We can also provide the fbt enum manifest directly as a JS variable
                // fbtEnumManifest: require('./.enum_manifest.json'),
                fbtEnumPath: path.join(__dirname, '.enum_manifest.json'),
              }],
              'babel-plugin-fbt-runtime',
            ]
          }
        }
      },
      {
        test: /\.(css)$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(bmp|gif|jpg|jpeg|png|psd|svg|webp|ttf|ktx|wav|ogg|mp4|webm)$/,
        use: ['file-loader'],
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'root.html')
    })
  ]
};
