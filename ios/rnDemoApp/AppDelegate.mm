/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

// TODO: Import <reacthermes/HermesExecutorFactory.h> instead if RCT_USE_HERMES is true.
#import <React/JSCExecutorFactory.h>

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTCxxBridgeDelegate.h>
#import <React/RCTJSIExecutorRuntimeInstaller.h>
#import <React/RCTRootView.h>

#import <ReactCommon/RCTTurboModuleManager.h>

#import "RNDemoAppTurboModuleProvider.h"

@interface AppDelegate () <RCTCxxBridgeDelegate, RCTTurboModuleManagerDelegate> {
  RCTTurboModuleManager *_turboModuleManager;
}
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // TODO: Enable TurboModule
  RCTEnableTurboModule(NO);
  
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"rn-demo-app"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

#pragma mark - RCTCxxBridgeDelegate

- (std::unique_ptr<facebook::react::JSExecutorFactory>)jsExecutorFactoryForBridge:(RCTBridge *)bridge
{
  if (RCTTurboModuleEnabled()) {
    _turboModuleManager = [[RCTTurboModuleManager alloc] initWithBridge:bridge
                                                               delegate:self
                                                              jsInvoker:bridge.jsCallInvoker];
    // Necessary to allow NativeModules to lookup TurboModules
    [bridge setRCTTurboModuleRegistry:_turboModuleManager];

  #if RCT_DEV
    if (!RCTTurboModuleEagerInitEnabled()) {
      /**
       * Instantiating DevMenu has the side-effect of registering
       * shortcuts for CMD + d, CMD + i,  and CMD + n via RCTDevMenu.
       * Therefore, when TurboModules are enabled, we must manually create this
       * NativeModule.
       */
      [_turboModuleManager moduleForName:"RCTDevMenu"];
    }
  #endif
  }

  __weak __typeof(self) weakSelf = self;
  // TODO: Use HermesExecutorFactory if using Hermes
  return std::make_unique<facebook::react::JSCExecutorFactory>(
      facebook::react::RCTJSIExecutorRuntimeInstaller([weakSelf, bridge](facebook::jsi::Runtime &runtime) {
        if (!bridge) {
          return;
        }
        __typeof(self) strongSelf = weakSelf;
        if (strongSelf) {
          facebook::react::RuntimeExecutor syncRuntimeExecutor =
              [&](std::function<void(facebook::jsi::Runtime & runtime_)> &&callback) { callback(runtime); };
          [strongSelf->_turboModuleManager installJSBindingWithRuntimeExecutor:syncRuntimeExecutor];
        }
      }));
}

#pragma mark RCTTurboModuleManagerDelegate

- (Class)getModuleClassFromName:(const char *)name
{
  return facebook::react::RNDemoAppTurboModuleClassProvider(name);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                      jsInvoker:(std::shared_ptr<facebook::react::CallInvoker>)jsInvoker
{
  return facebook::react::RNDemoAppTurboModuleProvider(name, jsInvoker);
}

- (id<RCTTurboModule>)getModuleInstanceFromClass:(Class)moduleClass
{
  return [moduleClass new];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name initParams:(const facebook::react::ObjCTurboModule::InitParams &)params {
  return nullptr;
}

@end
