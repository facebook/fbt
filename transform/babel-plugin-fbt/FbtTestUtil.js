/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p babel_plugin_fbt --remote localhost:~/www
 *
 * Utility functions to test the Fbt Babel transform plugin
 *
 * @emails oncall+internationalization
 * @flow
 * @format
 */

'use strict';

const {transformSync} = require('@babel/core');

function payload(obj: {project: string}) {
  obj.project = obj.project || '';
  return JSON.stringify(`__FBT__${JSON.stringify(obj)}__FBT__`);
}

function transform(
  source /*: string */,
  pluginOptions /*: $FlowFixMe */,
): string {
  return transformSync(source, {
    ast: false,
    plugins: [
      require('@babel/plugin-syntax-jsx'),
      require('@babel/plugin-transform-react-jsx'),
      [require('./index'), pluginOptions],
    ],
    sourceType: 'module',
  }).code;
}

module.exports = {
  payload,
  transform,
};
