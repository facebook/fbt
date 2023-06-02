/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

import type {EnumManifest, EnumModule} from '../FbtEnumRegistrar';

const {
  FBT_ENUM_MODULE_SUFFIX: ENUM_FILE,
  ModuleNameRegExp,
} = require('../FbtConstants');
const fs = require('fs');
// $FlowFixMe[untyped-import]
const glob = require('glob');
const invariant = require('invariant');
const path = require('path');

const FILE_EXT = '.@(js|jsx|ts|tsx)';

function generateManifest(
  enumManifestPath: string,
  srcPaths: $ReadOnlyArray<string>,
  cwd: string = process.cwd(),
): {
  enumManifest: EnumManifest,
  srcManifest: {[enumManifestPath: string]: Array<string>},
} {
  // Register babel-plugins with node to enable parsing flow types, etc.
  // $FlowFixMe[untyped-import]
  require('@babel/register')({
    // Ensure babel resolves paths relative to our package directory so the
    // plugins can always be resolved to this node_modules directory.
    cwd: path.resolve(__dirname, '../'),
    plugins: [
      '@babel/plugin-syntax-object-rest-spread',
      '@babel/plugin-transform-flow-strip-types',
      '@babel/plugin-transform-modules-commonjs',
    ],
  });

  // Find enum files
  const enumManifest: {[enumModuleName: string]: EnumModule} = {};
  for (const src of srcPaths) {
    const enumFiles: Array<string> = glob.sync(
      path.resolve(cwd, src) + '/**/*' + ENUM_FILE + FILE_EXT,
      {
        nodir: true,
      },
    );
    for (const filepath of enumFiles) {
      // Infer module name from filename.
      const name = path.parse(filepath).name;

      // $FlowExpectedError[unsupported-syntax]
      const obj = require(path.resolve(filepath));
      const enumValue: EnumModule = obj.__esModule ? obj.default : obj;

      invariant(
        enumValue != null,
        'No valid enum found for `%s`, ensure you are exporting your enum ' +
          'via `module.exports = { ... };` or `export default { ... };`',
        name,
      );
      enumManifest[name] = enumValue;
    }
  }

  // Find source files that are fbt-containing candidates
  const getFiles: string => Array<string> = src =>
    glob.sync(path.resolve(cwd, src) + '/**/*' + FILE_EXT, {nodir: true});

  const srcFiles = []
    // $FlowFixMe[incompatible-call]
    .concat(...srcPaths.map(getFiles))
    .filter(filepath =>
      fs
        .readFileSync(filepath)
        .toString('utf8')
        .split('\n')
        .some(line => ModuleNameRegExp.test(line)),
    )
    .map(filepath => path.relative(cwd, filepath));

  return {
    enumManifest,
    srcManifest: {[enumManifestPath]: srcFiles},
  };
}

module.exports = {generateManifest};
