/**
 * @generated SignedSource<<8eb51a2ebfe40bc40fca79cd0f9cc1fc>>
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
 * @flow strict-local
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
