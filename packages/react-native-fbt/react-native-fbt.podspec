# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

folly_compiler_flags = '-DFOLLY_NO_CONFIG -DFOLLY_MOBILE=1 -DFOLLY_USE_LIBCPP=1 -Wno-comma -Wno-shorten-64-to-32'
folly_version = '2021.06.28.00-v2'

Pod::Spec.new do |s|
  s.name            = "react-native-fbt"
  s.version         = package["version"]
  s.summary         = package["description"]
  s.description     = "react-native-fbt"
  s.homepage        = "https://github.com/facebook/fbt.git"
  s.license         = "MIT"
  s.platforms       = { :ios => "12.4", :tvos => "12.4" }
  s.compiler_flags  = folly_compiler_flags + ' -Wno-nullability-completeness'
  s.author          = "Facebook, Inc. and its affiliates"
  s.source          = { :git => "https://github.com/facebook/fbt.git", :tag => "#{s.version}" }

  s.source_files    = "ios/**/*.{h,m,mm,swift}"
  s.requires_arc    = true

  s.dependency "React"
  s.dependency "RCT-Folly", folly_version

  # s.dependency "..."

  # Enable codegen for this library
  use_react_native_codegen!(s, {
    :react_native_path => "../react-native",
    :js_srcs_dir => "./js",
    :library_name => "ReactNativeFbtSpec",
    :library_type => "modules",
    :modules_output_dir => "./ios",
    :output_dir => "./ios"
  })
end
