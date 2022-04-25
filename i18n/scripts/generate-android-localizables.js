/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 * This file is generated. Do not modify it manually!
 * @codegen-command : phps RepoSync intl_oss_fbt
 * @codegen-source : fbsource/xplat/intl/oss-fbt/rn-demo-app/i18n/scripts/generate-android-localizables.js
 * @generated SignedSource<<ed6128e5ea1f1b6a639f8ab42381f6ce>>
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {TranslationScriptOutput} from './translate-fbts';

const invariant = require('invariant');
const fs = require('fs');
const path = require('path');

/**
 * Generates locales that comply with Android resources format
 * https://developer.android.com/guide/topics/resources/providing-resources
 *
 * @param locale Locale in the form langCode_regionCode.
 * @return Locale in the form langCode-rRegionCode.
 */
function generateAndroidLocale(locale: string): string {
  const langRegionCode = locale.split('_');
  invariant(
    langRegionCode.length == 2,
    'Lang-region array must have two items',
  );
  return `${langRegionCode[0]}-r${langRegionCode[1]}`;
}

function jsonEncodeValues(localeValues) {
  const encodedValues = {};
  for (const hash in localeValues) {
    encodedValues[hash] = JSON.stringify(localeValues[hash]);
  }
  return encodedValues;
}

/**
 * Take translations output, and write individual JSON files for each locale
 * raw-es_rES/localizable.json => {<hash>: translatedString}
 * raw-ru_rRU/localizable.json
 */
function generateAndroidLocalizableFiles(
  translationOutput: TranslationScriptOutput,
  androidResDir: string,
  translationsFileName: string,
) {
  try {
    for (const locale in translationOutput) {
      const androidLocale = generateAndroidLocale(locale);
      const rawXXDir = path.join(androidResDir, `raw-${androidLocale}`);

      if (!fs.existsSync(rawXXDir)) {
        fs.mkdirSync(rawXXDir);
      }
      fs.writeFileSync(
        path.join(rawXXDir, translationsFileName),
        JSON.stringify(jsonEncodeValues(translationOutput[locale])),
        {encoding: 'utf8'},
      );
    }
  } catch (error) {
    console.error('An error ocurred while generating the android localizables');
    console.error(error);
    process.exit(1);
    throw error;
  }
}

module.exports = {
  generateAndroidLocalizableFiles,
};
