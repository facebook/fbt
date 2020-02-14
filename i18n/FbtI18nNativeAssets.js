/**
 * @generated SignedSource<<935168106d08733ae621890afa6e9918>>
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

import {Platform, NativeModules} from 'react-native';

const _translationsDictionary: {[hashKey: string]: ?string} = {};

export default class FbtI18nNativeAssets {
  static isAvailable =
    Platform.OS === 'ios'
      ? NativeModules.FBTNativeModule != null
      : NativeModules.FbtAndroidNativeModule != null;

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
      } else {
        if (Platform.OS === 'ios') {
          translatedPayload = NativeModules.FBTNativeModule.getString(hashKey);
        } else {
          translatedPayload = NativeModules.FbtAndroidNativeModule.getString(
            hashKey,
          );
        }
      }
      _translationsDictionary[hashKey] = translatedPayload;
    }

    return translatedPayload;
  };
}
