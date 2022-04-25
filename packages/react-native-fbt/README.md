# react-native-fbt

React Native module to enable the use of the [FBT translation framework](https://facebook.github.io/fbt/) in React Native apps (iOS/Android).

## Getting started

`$ yarn add react-native-fbt --dev`

### Mostly automatic installation

`$ react-native link react-native-fbt`

### Manual installation


#### iOS

1. In Xcode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-fbt` and add `Fbt.xcodeproj`
3. In Xcode, in the project navigator, select your project. Add `libFbt.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)

#### Android

1. Open up `android/app/src/main/java/[...]/MainApplication.java`
  - Add `import com.facebook.react.modules.FbtPackage;` to the imports at the top of the file
  - Add `new FbtPackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
    ```
    include ':react-native-fbt'
    project(':react-native-fbt').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-fbt/android')
    ```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
    ```
      compile project(':react-native-fbt')
    ```

## Usage
[React Native Demo App](https://github.com/facebook/fbt/tree/rn-demo-app)

## Notes
- The only currently supported way for changing the app language is by changing the language on the device itself. This native library depends on how the Android OS selects files depending on the language of the device.
