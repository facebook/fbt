# Copyright (c) Facebook, Inc. and its affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-fbt"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-fbt
                   DESC
  s.homepage     = "https://github.com/facebook/fbt.git"
  s.license      = "MIT"
  s.platforms    = { :ios => "11.0", :tvos => "11.0" }
  s.authors      = { "Your Name" => "yourname@email.com" }
  s.source       = { :git => "https://github.com/facebook/fbt.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"
  s.requires_arc = true

  s.dependency "React"

  # s.dependency "..."
end
