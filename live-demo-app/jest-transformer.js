/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 * @flow strict-local
 */

 module.exports = require('babel-jest').createTransformer({
   plugins:[
     '@babel/plugin-proposal-class-properties',
     '@babel/plugin-proposal-object-rest-spread',
     '@babel/plugin-proposal-optional-catch-binding',
     '@babel/plugin-proposal-optional-chaining',
     '@babel/plugin-transform-flow-strip-types',
     ['../transform/babel-plugin-fbt/index.js', {
       fbtEnumManifest: require('./.enum_manifest.json')
     }],
     '../transform/babel-plugin-fbt-runtime/index.js',
   ]
 });
