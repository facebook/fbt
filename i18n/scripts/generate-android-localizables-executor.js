/**
 * @generated SignedSource<<6c0f4b462bfce5757dd01dc9abc41c47>>
 * @codegen-command : phps FBSyncAll
 *
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * !! This file is synchronized from fbsource. You should not     !!
 * !! modify it directly. Instead:                                !!
 * !!                                                             !!
 * !! 1) Update this file on fbsource and land your change there. !!
 * !! 2) A sync diff should be created and accepted automatically !!
 * !!    within 30 minutes that copies the changes you made on    !!
 * !!    fbsource to www. All that's left is to verify the        !!
 * !!    revision is good land it on www.                         !!
 * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Nice wrapper to use generate-android-localizables from babel node directly
 *
 * @noflow
 */

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
