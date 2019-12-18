# Babel/ReactNative/Android OSS FBT

## Building and starting the demo app

Run the following commands in order:

```
# 1. Generate enum and source manifests
yarn manifest
# 2. Collect FBT translatable texts
yarn collect-fbts
# 3. Generate translatedFbts.js from translation_input.json
yarn translate-fbts
# 4. Generate android/res translation files by running the
#    generate-android-localizable script with the ouput of translate-fbts
# 5. Run a local web server with hot reloading at localhost:8081
yarn android
```

## Change log
 See [CHANGELOG](CHANGELOG.md).
