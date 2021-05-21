/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "RNDemoAppTurboModuleProvider.h"

#import <React/CoreModulesPlugins.h>

// NOTE: This entire file should be codegen'ed.

namespace facebook {
namespace react {

Class RNDemoAppTurboModuleClassProvider(const char *name) {
  // TODO: return FbtModule class.
  return RCTCoreModulesClassProvider(name);
}

std::shared_ptr<TurboModule> RNDemoAppTurboModuleProvider(const std::string &name, std::shared_ptr<CallInvoker> jsInvoker) {

  return nullptr;
}

} // namespace react
} // namespace facebook
