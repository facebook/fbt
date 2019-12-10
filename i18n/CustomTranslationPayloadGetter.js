/**
 * @generated SignedSource<<858a00b20ea9fe0fcc85918bb75a1963>>
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

import FbtI18nNativeAssets from './FbtI18nNativeAssets';

// TODO: Add better types once this is updated in GitHub (T53555809)
const getTranslatedPayload = (
  hashKey: ?string,
  enumHashKey: $FlowFixMe,
  args: Array<$FlowFixMe>,
  _table: string | Object,
): ?{table: $FlowFixMe, args: Array<$FlowFixMe>} => {
  if (FbtI18nNativeAssets.isAvailable) {
    if (hashKey != null) {
      let translatedPayload = FbtI18nNativeAssets.getString(hashKey);
      if (translatedPayload) {
        translatedPayload = JSON.parse(translatedPayload);
      }

      return translatedPayload != null && translatedPayload !== ''
        ? {table: translatedPayload, args}
        : null;
    }
  }

  return null;
};

export {getTranslatedPayload};
