/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 * This file is generated. Do not modify it manually!
 * @codegen-command : phps RepoSync intl_oss_fbt
 * @codegen-source : fbsource/xplat/intl/oss-fbt/rn-demo-app/i18n/FbtI18nNativeAssets.js
 * @generated SignedSource<<3e0ea1fbdaf33302fbb2ae68facdf640>>
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import NativeFbtModule from 'react-native-fbt';

const _translationsDictionary: {[hashKey: string]: ?string} = {};

export default class FbtI18nNativeAssets {
  static getString = (hashKey: string): ?string => {
    let translatedPayload;
    if (hashKey in _translationsDictionary) {
      translatedPayload = _translationsDictionary[hashKey];
    } else {
      if (__DEV__ && !global.nativeExtensions && !global.nativeCallSyncHook) {
        // Chrome debugger does not support synchronous native method.
        // Thus do not use getString in Chrome debugger.
        // **Translations will not work while debugging**
        translatedPayload = null;
      } else if (NativeFbtModule != null) {
        translatedPayload = NativeFbtModule.getString(hashKey);
      }
      _translationsDictionary[hashKey] = translatedPayload;
    }

    return translatedPayload;
  };
}
