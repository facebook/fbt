/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Utility functions to test the Fbt Babel transform plugin
 *
 * @emails oncall+internationalization
 * @format
 * @noflow
 */

'use strict';

const {transformSync} = require('@babel/core');

function payload(obj /*: {project: string} */) /*: string */ {
  obj.project = obj.project || '';
  return JSON.stringify(`__FBT__${JSON.stringify(obj)}__FBT__`);
}

function transform(
  source /*: string */,
  pluginOptions /*: $FlowFixMe */,
) /*: string */ {
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

function transformKeepJsx(
  source /*: string */,
  pluginOptions /*: $FlowFixMe */,
) /*: string */ {
  const prettier = require('prettier');
  return prettier.format(
    transformSync(source, {
      ast: false,
      plugins: [
        require('@babel/plugin-syntax-jsx'),
        [require('./index'), pluginOptions],
      ],
      sourceType: 'module',
    }).code,
    {parser: 'babel'},
  );
}

function withFbsRequireStatement(code /*: string */) /*: string */ {
  return `const fbs = require("fbs");
  ${code}`;
}

function withFbtRequireStatement(code /*: string */) /*: string */ {
  return `const fbt = require("fbt");
  ${code}`;
}

module.exports = {
  payload,
  transform,
  transformKeepJsx,
  withFbsRequireStatement,
  withFbtRequireStatement,
};
