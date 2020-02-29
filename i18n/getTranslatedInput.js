/**
 * @generated SignedSource<<64f5f834628fc680784f95cc3842b80e>>
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
