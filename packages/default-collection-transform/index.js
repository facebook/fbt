/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @emails oncall+i18n_fbt_js
 * @flow
 * @noformat
 */

'use strict';

const babel = require('@babel/core');

/*::
import type {BabelPluginList, BabelPresetList} from '@babel/core';
import type {TransformOptions} from 'babel-plugin-fbt/dist/bin/FbtCollector';
import type {BabelPluginFbt, PluginOptions} from "babel-plugin-fbt";
*/

const defaultSyntaxPlugins = [
  require('@babel/plugin-syntax-class-properties'),
  [require('@babel/plugin-syntax-flow'), {enums: true}],
  require('@babel/plugin-syntax-jsx'),
  require('@babel/plugin-syntax-object-rest-spread'),
  require('@babel/plugin-syntax-numeric-separator'),
  require('@babel/plugin-syntax-optional-chaining'),
  require('@babel/plugin-syntax-nullish-coalescing-operator'),
  require('@babel/plugin-syntax-optional-catch-binding'),
];

function transform(
  code /*: string */,
  options /*: TransformOptions */,
  plugins /*: BabelPluginList */,
  presets /*: BabelPresetList */,
) /*: void */ {
  const {fbtModule, ...pluginOptions} = options;
  const opts = {
    ast: false,
    code: false,
    filename: options.filename,
    plugins: defaultSyntaxPlugins.concat(plugins, [
      // $FlowFixMe[incompatible-call]
      [
        (fbtModule /*: BabelPluginFbt */),
        (pluginOptions /*: PluginOptions */)
      ],
    ]),
    presets,
    sourceType: 'unambiguous',
  };
  babel.transformSync(code, opts);
}

module.exports = transform;
