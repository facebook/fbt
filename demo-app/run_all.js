/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow
 * @emails oncall+internationalization
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
