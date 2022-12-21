/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @flow strict
 * @format
 * @oncall i18n_fbt_js
 */

const {execSync} = require('child_process');
const fs = require('fs');
const path = require('path');

process.chdir(__dirname);

if (!fs.existsSync('.src_manifest.json')) {
  execSync('yarn manifest');
}
if (!fs.existsSync('.source_strings.json')) {
  execSync('yarn collect-fbts');
}
if (!fs.existsSync(path.resolve('src', 'translatedFbts.json'))) {
  execSync('yarn translate-fbts');
}
