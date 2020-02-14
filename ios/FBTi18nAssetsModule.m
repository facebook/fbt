/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "FBTi18nAssetsModule.h"

@implementation FBTi18nAssetsModule

RCT_EXPORT_MODULE(FBTNativeModule);

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(getString:(NSString *)hashKey)
{
  NSString* translation = NSLocalizedString(hashKey, .normal);

  // if there's no translation for the hashKey, we return an empty string
  if ([hashKey isEqualToString:translation]) {
    return @"";
  } else {
    return translation;
  }
}

@end
