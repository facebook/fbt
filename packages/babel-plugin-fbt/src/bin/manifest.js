/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

const {generateManifest} = require('./manifestUtils');
const fs = require('fs');
const yargs = require('yargs');

const argv = yargs
  .usage(
    'Generate the enum manifest and its corresponding source manifest ' +
      'intended for consumption by the fbt transform and collectFbt',
  )
  .describe('h', 'Display usage message')
  .alias('h', 'help')
  .array('src')
  .default('src', [process.cwd()])
  .describe(
    'src',
    'The source folder(s) in which to look for JS source containing fbt and ' +
      'files with the $FbtEnum.js suffix. Defaults to CWD',
  )
  .default('enum-manifest', '.enum_manifest.json')
  .describe(
    'enum-manifest',
    'The path or filename to write the enum manfiest (accessed when ' +
      'processing shared enums)',
  )
  .default('src-manifest', '.src_manifest.json')
  .describe(
    'src-manifest',
    'The path or filename to write the source manifest',
  ).argv;

if (argv.help) {
  yargs.showHelp();
  process.exit(0);
}

const enumManifestPath = argv['enum-manifest'];
const {enumManifest, srcManifest} = generateManifest(
  enumManifestPath,
  argv.src,
);

// Write enum manfiest
fs.writeFileSync(enumManifestPath, JSON.stringify(enumManifest));

fs.writeFileSync(argv['src-manifest'], JSON.stringify(srcManifest));
