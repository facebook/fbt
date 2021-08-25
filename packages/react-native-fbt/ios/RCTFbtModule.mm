/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "RCTFbtModule.h"
#import "FBReactNativeFbtModuleSpec.h"

using namespace facebook::react;

@interface RCTFbtModule () <NativeFbtModuleSpec>
@end

@implementation RCTFbtModule

RCT_EXPORT_MODULE(FbtModule)

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(getString:(NSString *)hashKey)
{
  NSString* translation = NSLocalizedString(hashKey, .normal);

  // If there's no translation for the hashKey, we return an empty string
  if ([hashKey isEqualToString:translation]) {
    return @"";
  } else {
    return translation;
  }
}

@end

Class FbtModuleCls(void)
{
  return RCTFbtModule.class;
}
