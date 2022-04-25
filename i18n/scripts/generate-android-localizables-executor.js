/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 * This file is generated. Do not modify it manually!
 * @codegen-command : phps RepoSync intl_oss_fbt
 * @codegen-source : fbsource/xplat/intl/oss-fbt/rn-demo-app/i18n/scripts/generate-android-localizables-executor.js
 * @generated SignedSource<<84f2daf1146f2a21b9825f3d7abfb3d7>>
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @noflow
 */

// Nice wrapper to use generate-android-localizables from babel node directly.

'use strict';

const {
  generateAndroidLocalizableFiles,
} = require('./generate-android-localizables');
const fs = require('fs');
const yargs = require('yargs');

const args = {
  HELP: 'h',
  TRANSLATION_OUTPUT: 'translationOutput',
  ANDROID_RES_DIR: 'androidResDir',
  TRANSLATIONS_FILENAME: 'translationsFilename',
};

const argv = yargs
  .usage(
    'Take translations output, and write individual JSON files for each ' +
      'locale:  raw-es_rES/localizable.json => {<hash>: translatedString}',
  )
  .string(args.TRANSLATION_OUTPUT)
  .default(args.TRANSLATION_OUTPUT, './i18n/fbt/translatedFbts.json')
  .describe(args.TRANSLATION_OUTPUT, `path to the translatedFbts`)
  .string(args.ANDROID_RES_DIR)
  .default(args.ANDROID_RES_DIR, 'android/app/src/main/res')
  .describe(
    args.ANDROID_RES_DIR,
    `path to the res folder of your android application`,
  )
  .string(args.TRANSLATIONS_FILENAME)
  .default(args.TRANSLATIONS_FILENAME, 'localizable.json')
  .describe(
    args.TRANSLATIONS_FILENAME,
    `name that json translation files should take`,
  ).argv;

if (argv[args.HELP]) {
  yargs.showHelp();
  process.exit(0);
}

generateAndroidLocalizableFiles(
  JSON.parse(
    fs.readFileSync(argv[args.TRANSLATION_OUTPUT], {encoding: 'utf8'}),
  ),
  argv[args.ANDROID_RES_DIR],
  argv[args.TRANSLATIONS_FILENAME],
);
