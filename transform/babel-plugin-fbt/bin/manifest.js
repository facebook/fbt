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
 * @flow
 * @format
 */

/*global process:false*/

'use strict';

const {execSync} = require('child_process');
const fs = require('fs');
const optimist = require('optimist');
const path = require('path');

const argv = optimist
  .usage(
    'Generate the enum manifest and its corresponding source manifest ' +
      'intended for consumption by the fbt transform and collectFbt',
  )
  .describe('h', 'Display usage message')
  .alias('h', 'help')
  .default('src', process.cwd())
  .describe(
    'src',
    'The source folder in which to look for JS source containing fbt and ' +
      'files with the $FbtEnum.js suffix. Defaults to CWD',
  )
  .default('root', process.cwd())
  .describe(
    'root',
    'The folder from which to make source paths relative. ' +
      "e.g. '/' for absolute paths.  Defaults to CWD",
  )
  .default('enum-manifest', '.enum_manifest.json')
  .describe(
    'enum-manifest',
    'The path or filename to write the enum manfiest (accessed when ' +
      'processing shared enums)',
  )
  .default('src-manifest', '.src_manifest.json')
  .describe('src-manifest', 'The path or filename to write the source manfiest')
  .argv;

if (argv.help) {
  optimist.showHelp();
  process.exit(0);
}

// Register babel-plugins with node to enable parsing flow types, etc.
require('@babel/register')({
  plugins: [
    '@babel/plugin-syntax-object-rest-spread',
    '@babel/plugin-transform-flow-strip-types',
  ],
});

// Take newline delimitted output and return an array of lines
const lines = newlined =>
  newlined
    .toString()
    .trim()
    .split('\n');

// Find enum files
const enumFiles = lines(
  execSync("find . -type f -iname '*$FbtEnum.js'", {
    cwd: argv.src,
  }),
);

// Write enum manfiest
const enumManifest = {};
for (const filepath of enumFiles) {
  // Infer module name from filename.
  const name = path.parse(filepath).name;
  enumManifest[name] = require(path.resolve(argv.src, filepath));
}
fs.writeFileSync(argv['enum-manifest'], JSON.stringify(enumManifest));

// Find source files that are fbt-containing candidates
const srcFiles = lines(
  execSync(
    "find . -type f -iname '*.js' | xargs grep -E -l '\\b[Ff]b[st]\\b'",
    {cwd: argv.src},
  ),
).map(relpath => path.relative(argv.root, path.resolve(argv.src, relpath)));

fs.writeFileSync(
  argv['src-manifest'],
  JSON.stringify({[argv['enum-manifest']]: srcFiles}),
);
