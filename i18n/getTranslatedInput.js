/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 * This file is generated. Do not modify it manually!
 * @codegen-command : phps RepoSync intl_oss_fbt
 * @codegen-source : fbsource/xplat/intl/oss-fbt/rn-demo-app/i18n/getTranslatedInput.js
 * @generated SignedSource<<d1576f16bc64649ade00295cd29bfbb0>>
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {FbtRuntimeCallInput, FbtTranslatedInput} from 'fbt/lib/FbtHooks';

import FbtI18nNativeAssets from './FbtI18nNativeAssets';

function getTranslatedInput(
  input: FbtRuntimeCallInput,
): ?FbtTranslatedInput {
  const {options} = input;
  if (options.hk != null) {
    let translatedPayload = FbtI18nNativeAssets.getString(options.hk);
    if (translatedPayload) {
      return {table: JSON.parse(translatedPayload), args: input.args};
    }
  }
  return null;
}

export {getTranslatedInput};
