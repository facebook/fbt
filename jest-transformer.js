/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 * @noflow
 * @oncall i18n_fbt_js
 */

module.exports = require('babel-jest').createTransformer({
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-optional-catch-binding',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-transform-flow-strip-types',
    [
      'babel-plugin-fbt',
      {
        fbtEnumManifest: require('./.enum_manifest.json'),
      },
    ],
    'babel-plugin-fbt-runtime',
  ],
});
