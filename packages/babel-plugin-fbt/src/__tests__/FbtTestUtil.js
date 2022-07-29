/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * Utility functions to test the Fbt Babel transform plugin
 *
 * @format
 * @noflow
 * @oncall i18n_fbt_js
 */

'use strict';

const {SENTINEL} = require('../FbtConstants');
const {transformSync} = require('@babel/core');
const prettier = require('prettier');

function payload(obj: {project: string}): string {
  obj.project = obj.project || '';
  return JSON.stringify(`__FBT__${JSON.stringify(obj)}__FBT__`);
}

function transform(source: string, pluginOptions: $FlowFixMe): string {
  return transformSync(source, {
    ast: false,
    plugins: [
      require('@babel/plugin-syntax-jsx'),
      [
        require('@babel/plugin-transform-react-jsx'),
        {
          throwIfNamespace: false,
        },
      ],
      [require('../index'), pluginOptions],
    ],
    sourceType: 'module',
  }).code;
}

function snapshotTransform(source: string, pluginOptions: $FlowFixMe): string {
  return transform(source, {fbtBase64: true, ...pluginOptions});
}

function transformKeepJsx(source: string, pluginOptions: $FlowFixMe): string {
  return prettier.format(
    transformSync(source, {
      ast: false,
      plugins: [
        require('@babel/plugin-syntax-jsx'),
        [require('../index'), pluginOptions],
      ],
      sourceType: 'module',
    }).code,
    {parser: 'babel'},
  );
}

const snapshotTransformKeepJsx = (
  source: string,
  pluginOptions: $FlowFixMe,
): string => transformKeepJsx(source, {fbtBase64: true, ...pluginOptions});

function withFbsRequireStatement(code: string): string {
  return `const fbs = require("fbs");
  ${code}`;
}

function withFbtRequireStatement(code: string): string {
  return `const fbt = require("fbt");
  ${code}`;
}

const fbtSentinelRegex = /(["'])__FBT__(.*?)__FBT__\1/gm;

/**
 * Serialize JS source code that contains fbt client-side code.
 * For readability, the JSFBT payload is deconstructed and the FBT sentinels are
 * replaced by inline comments.
 * Usage: see https://jestjs.io/docs/en/expect#expectaddsnapshotserializerserializer
 */
const jsCodeFbtCallSerializer = {
  serialize(rawValue, _config, _indentation, _depth, _refs, _printer) {
    const decoded = rawValue.replace(
      fbtSentinelRegex,
      (_match, _quote, body) => {
        const json = Buffer.from(body, 'base64').toString('utf8');
        return `/* ${SENTINEL} start */ ${json} /* ${SENTINEL} end */`;
      },
    );
    return prettier.format(decoded, {parser: 'babel'});
  },

  test(rawValue) {
    return typeof rawValue === 'string';
  },
};

const nonASCIICharRegex = /[^\0-~]/g;

/**
 * Serialize JS source code that contains non-ASCII characters in unicode.
 * Non-ASCII characters in unicode string will be replaced with utf-8 representation.
 * E.g.'み' -> '\u307f'
 */
const jsCodeNonASCIICharSerializer = {
  serialize(rawValue) {
    return JSON.stringify(rawValue).replace(
      nonASCIICharRegex,
      char => '\\u' + char.charCodeAt().toString(16).padStart(4, '0'),
    );
  },

  test(rawValue) {
    return typeof rawValue === 'string';
  },
};

module.exports = {
  jsCodeFbtCallSerializer,
  jsCodeNonASCIICharSerializer,
  payload,
  snapshotTransform,
  snapshotTransformKeepJsx,
  transform,
  transformKeepJsx,
  withFbsRequireStatement,
  withFbtRequireStatement,
};
