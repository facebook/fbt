/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 * This file is generated. Do not modify it manually!
 * @codegen-command : phps RepoSync intl_oss_fbt
 * @codegen-source : fbsource/xplat/intl/oss-fbt/packages/react-native-fbt/ios/RCTFbtModule.mm
 * @generated SignedSource<<c6826314f5a4b28a2186f2bfab94de27>>
 */
/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "RCTFbtModule.h"
#import <react-native-fbt/ReactNativeFbtSpec.h>

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

- (std::shared_ptr<TurboModule>)getTurboModule:(const ObjCTurboModule::InitParams &)params
{
  return std::make_shared<NativeFbtModuleSpecJSI>(params);
}

@end

Class FbtModuleCls(void)
{
  return RCTFbtModule.class;
}
