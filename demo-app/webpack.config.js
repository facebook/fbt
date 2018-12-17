/**
 * Copyright (c) Facebook, Inc. and its affiliates. All rights reserved.
 *
 * @flow
 */

let path = require('path');
let HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.join(__dirname, 'src', 'root.js'),
  output: {
    path: path.join(__dirname, 'output'),
    filename: '[name].js'
  },
  mode: process.env.NODE_ENV || 'development',
  resolve: {
    modules: [
      path.resolve(__dirname, 'src'),
      path.resolve(__dirname, 'src/example'),
      path.resolve(__dirname, '../runtime'),
      path.resolve(__dirname, '../runtime/FbtNumber'),
      path.resolve(__dirname, '../runtime/nonfb'),
      path.resolve(__dirname, '../runtime/nonfb/mocks'),
      'node_modules'
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'src')
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          plugins: [
            ["minify-replace", {
              "replacements": [{
                "identifierName": "__DEV__",
                "replacement": {
                  "type": "booleanLiteral",
                  "value": true
                }
              }]
            }],
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-object-rest-spread',
            '@babel/plugin-proposal-optional-catch-binding',
            '@babel/plugin-proposal-optional-chaining',
            '@babel/plugin-transform-flow-strip-types',
            ['../transform/babel-plugin-fbt/index.js', {
              fbtEnumManifest: require('./enum-manifest.json')
            }],
            '../transform/babel-plugin-fbt-runtime/index.js',
          ]
        }
      },
      {
        test: /\.(css)$/,
        use: [
          "style-loader",
          "css-loader"
        ]
      },
      {
        test: /\.(bmp|gif|jpg|jpeg|png|psd|svg|webp|ttf|ktx|wav|ogg|mp4|webm)$/,
        loaders: ['file-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'root.html')
    })
  ]
};
