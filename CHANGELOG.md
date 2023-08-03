# Change log

List of changes for each released npm package version.

## TOC

- [fbt versions](#fbt-versions)
- [babel-plugin-fbt versions](#babel-plugin-fbt-versions)
- [babel-plugin-fbt-runtime versions](#babel-plugin-fbt-runtime-versions)
- [@fbtjs/default-collection-transform versions](#fbtjsdefault-collection-transform-versions)
- [@fbtjs/babel-plugin-standalone versions](#fbtjsbabel-plugin-standalone-versions)
- [fb-tiger-hash versions](#fb-tiger-hash-versions)
- [fb-babel-plugin-utils versions](#fb-babel-plugin-utils-versions)
- [gulp-rewrite-flowtyped-modules versions](#gulp-rewrite-flowtyped-modules-versions)
- [gulp-strip-docblock-pragmas versions](#gulp-strip-docblock-pragmas-versions)
- [react-native-fbt versions](#react-native-fbt-versions)
- [fbt-rn-android-native versions [Deprecated]](#fbt-rn-android-native-versions-deprecated)

### Top-level Github
- [chore] Strictify modules (Flow)
- [chore] Inline `keyMirror.js` module to remove `fbjs` package dependency
- [minor] Identify strings with updated `hash_key` in `categorizeNewStrings.js`
- [chore] Update copyright headers to 'Meta Platforms, Inc.'
- [chore] Upgrade to Flow v0.158.0
- [fix] Add missing dependencies for `@babel/preset-react`
- [build] Add test to ensure published versions are in sync
- [feat] Add example of fbt common to the demo-app. See `<fbt common={true}>...</fbt>`.
- [chore] Upgrade to Flow v0.141.0
- [chore] Use GitHub Actions for Continuous Integration
- [chore] Upgrade to Flow v0.137.0
- [chore] Adding @noflow annotations
- [chore] Upgrade to Flow v0.127.0
- [fix] Relax required version patterns of npm dependencies
- Sync `babelTypeShims.js` to GitHub. It was previously missing due to internal config issues.
- Upgrade to Flow v0.123.0
- [doc] Add Fbt Common Strings documentation
- Upgrade to Flow v0.120.1
- refactor: Remove String.prototype.* methods from FbtResult flow-types
- refactor: Breakup `moduleMap` from babelPresets
- Add `yarn clean-test` script to clean, rebuild and test this whole project
- Run Flow checks and all Jest tests in Travis by default
- Upgrade to Flow v0.115.0
- Remove the String.prototype methods (that aren't used internally) from libdefs
- Upgrade to Flow v0.113.0
- Make demo-app rely on the local versions of our published npm modules.
  That'll avoid us from having to update `package.json` for every package update.
- Fix demo-app breakage
- Require node v10.4.0+ because for fb-tiger-hash (we need BigInt!)
- *[Experimental]* Add support for Flow type checks.
  - Run `yarn flow:check` to check them.
    - NOTE: our Flow types are still in their infancy, so lots of errors are expected.
  - Run `yarn flow:watch` to recheck types upon changing JS files.
- Prepare directory structure for Lerna
- Enable testing packages from top-level in GitHub

### fbt versions
<details>
  <summary>
    Unreleased changes that have landed in main. Click to see more.
  </summary>

</details>

- 1.0.1:
  - [chore] Make it compatible with React 18 (and any `>=0.12.0`).

- 1.0.0:
  - [feat] Major release to maintain compatibility with `babel-plugin-fbt@1.0.0`
  - [feat] Expose the `fbs` API to output plain-text translatable strings.
  - [feat] Expose `extraOptions` to `FbtHooks.getFbtResult`
  - [chore] Throw an exception if we detect duplicate token names when using the low-level `fbt._()` API (See [9bb6890](https://github.com/facebook/fbt/commit/9bb689040b0c4d03ca7df68dde4a1dfb44949533) / D33476399)

- 0.17.1:
  - [fix] Fix React dependency in intlList.js
  - [feat] *[Experimental]* Add sanity check to ensure that each pattern string token is mapped to a single substitution value.
  - [chore] Add `.npmignore` config (avoid exporting some build, debug & test files)

- 0.17.0:
  - [feat] Add user's regional local in `IntlViewerContext`
  - [feat] Improve resilience of detection of fbt parameters inside translated string patterns and improve error message format.
  - [chore] Update babel-plugin-fbt-runtime dependency version to `^0.10.x`
  - [chore] Update babel-plugin-fbt dependency version to `^0.21.x`
  - [fix] Ensure that `fbs()` really returns `FbtPureStringResult` objects
  - [fix] Force fbs:plural to only show plain text custom UI values.
  - [feat] Convert babel-plugin-fbt raw JSFBT payload to runtime friendly version and add fbt._implicitParam() client-side method

- 0.16.6:
  - [feat] Add a new `FbtTranslations.getRegisteredTranslations` function
  - [feat] Add a new `FbtTranslations.mergeTranslations` function

- 0.16.5:
  - [chore] Update babel-plugin-fbt dependency version to `^0.20.x`

- 0.16.4:
  - [chore] Update babel-plugin-fbt dependency version to `^0.19.x`

- 0.16.3:
  - [chore] Update babel-plugin-fbt dependency version to `^0.18.x`

- 0.16.2:
  - [chore] Update babel-plugin-fbt dependency version to `^0.17.x`
  - [fix] Don't strip punctuation that isn't redundant with token punctuation

- 0.16.1:
  - [fix] Updated peer dependencies, and devEngines dependencies.
  - [fix] Improved Flow typing of `intlList`
- 0.16.0:
  - [major] Merge two `GenderConst` entries that had the same value to avoid confusion. <br/>
    I.e. `MIXED_SINGULAR` and `MIXED_PLURAL` will both be referred as `MIXED_UNKNOWN` and it'll keep the same value (`MIXED_UNKNOWN=5`).
  - [feat] Add Babel `presets` as a CLI option for [`collectFBT.js`](https://github.com/facebook/fbt/blob/c6201e9b463685a942563adaa62569430d41aa27/packages/babel-plugin-fbt/bin/collectFBT.js)
  - [feat] Add ES6 imports/exports support for shared enums. See [related doc.](https://facebook.github.io/fbt/docs/enums#es6-import-export-syntax)

- 0.15.0:
  - [feat] Add ability to provide your own ViewerContext dynamically. See [related doc.](https://facebook.github.io/fbt/docs/getting_started_on_web#changing-of-translation-locale-on-the-fly)
  - [fix] Render optional catch binding syntax to ES5 to fix [IE11 bug](https://github.com/facebook/fbt/pull/139)
  - [feat] Convert `fbt.isFbtInstance()` to a predicate function for Flow
  - [fix] Avoid generating unnecessary empty strings in fbt result contents
  - [chore] Log type of leaf reached during table access failure
  - [fix] Fix FlowFixMes in FbtTable.access
  - [feat] Improve feature detection of `Object.defineProperty()` for IE11

- 0.14.0:
  - [fix] Add NumberFormatConfig flow definition
  - [fix] Use `invariant` module in fbt runtime and list it as dependency
  - [refactor] Introduce `FbtTable` and related types around payload access

- 0.13.0:
  - [fix] FbtInit.getTranslatedInput was setting the wrong default.

- 0.12.1:
  - [fix] Patch fix for FbtHooks.getTranslatedInput (from 0.13.0)

- 0.12.0:
  - [feat] FbtHooks.getTranslatedInput for ReactNative translation retrieval

- 0.11.0:
  - [feat] Expose FbtResult in fbt
  - [feat] Enable overriding result returned from fbt via `getFbtResult` in `FbtHooks`
  - [feat] Provide onStringMethodUsed hook for IFbtErrorListener
  - [feat] Remove Banzai & FbtLogger, provide hooks in their place.
  - [refactor] Abstract away string serialization error handling.
  - [refactor] Move FbtContentItem and $NestedFbtContentItems to libdefs
  - [refactor] Flow type strict substituteTokens.js
  - Fix version in header comments

- 0.10.6:
  - More accurate peer dependencies

- 0.10.5:
  - Add README.md

- 0.10.4:
  - Improve repository link in package.json

- 0.10.3:
  - [bug] Fix IntlNumberType.get(...) to work with short locales [#85](https://github.com/facebook/fbt/pull/85)
  - Allow fbt:enum value prop to be a string literal
  - Fix intlList 'react' import [issue #62](https://github.com/facebook/fbt/issues/62)

- 0.10.2:
  - [04df822](https://github.com/facebook/fbt/commit/04df822) Updated package version references

- 0.10.0:
  - [9acb1cd](https://github.com/facebook/fbt/commit/9acb1cd) Make fbt translation payload getter customizable

### babel-plugin-fbt versions
  <details>
    <summary>
      Unreleased changes that have landed in main. Click to see more.
    </summary>

    - Add unit tests for fbs.enum() and <fbs:enum>
  </details>

- 1.0.0:
  - [feat]! Refactored the string extraction algorithm to properly generate meaningful text/description pairs for fbt callsites
    that contain JSX presentational elements.
    We've also added support for a new way to call `fbt()` using an array of inputs instead of string concatenation.
    See [#35](https://github.com/facebook/fbt/issues/35)

    BREAKING CHANGE: the `fbt-collect` script may extract new strings (that probably resemble strings from the `0.20.x` version of the extractor) that will need to be translated.
      Please see [this post for more information on how to upgrade.](TODO(T110819080)!!!!!!!!!!!!!)

  - [feat] Export non-native options that are specified through `extraOptions` to the 'options' argument (3rd argument) in fbt._() calls
  - [fix] Make `ValidFbtOptions` immutable
  - [chore] Address several dependency vulnerabilities
  - [chore] Update file headers and `LICENSE` file
  - See release notes from `0.21.0-rc*-beta` for more release details.

- 0.21.0-rc10-beta:
  - [feature] Support fbt `common` attribute without value
  - [chore] Add tests for common fbt

- 0.21.0-rc9-beta:
  - [fix]! Fixed issue where non-breaking space characters (`&nbsp;`) in `<fbt>` callsites were being replaced by space characters
  - [chore] Improve `.npmignore` config (avoid exporting some build, debug & test files)

- 0.21.0-rc8-beta:
  - [fix]! Prevent `fbt.sameParam` from referring to a non-existent token name or a plural construct token
  - [fix]! Prevent token name collisions among fbt constructs across all nesting levels

- 0.21.0-rc1-beta - 0.21.0-rc7-beta:
  - [fix] Add missing `fbjs` npm dependency
  - [feature] Introduce a script to identify new/updated strings after Auto-Param
  - [feat]! Pull out common `desc` from leaves and include `tokenAliases`
  when calculating `hash_key` in fbtJenkinsHash.js
  - [fix] Check for untransformed fbt constructs after FbtTransform
  - [fix] Check for nested fbt constructs
  - [fix] Stop TranslationBuilder from mutating FbtSite
  - [refactor] Make TranslationBuilder use clear token replacement helper in FbtUtil.js
  - [chore] Improve translate-test.js and FbtSite-test.js
  - [fix] Replace clear tokens in translation data with their token aliases
  - [fix!] (fbt:name) Fix issue where we failed to prevent users from using a "gender" value issued from a function/class invocation
  - [fix!] (fbt:enum) Fix issue where we failed to detect that enum object keys were issued from computed values instead of being statically defined
  - [fix] Move flow-enums-runtime from devDependency to a normal dependency since it's needed by FbtNodeType at runtime
  - [fix] Add missing @babel/register dependency
  - [feat] Print error message for each missing entry in input JSON
  - [chore] Update fb-babel-plugin-utils dependency version
  - [refactor] Improve readability of JS code output serialized with Jest snapshots
  - [chore]! Drop support for node.js `<12.16.x`
  - [feat]! Refactor the string extraction algorithm to properly generate meaningful text/description pairs for fbt callsites
    that contain JSX presentational elements.
    We're also adding support for a new way to call fbt() using an array of inputs instead of string concatenation.
    See [#35](https://github.com/facebook/fbt/issues/35)

- 0.21.0:
  - This version was published accidently. Please ignore.

- 0.20.3: Accidental npm release. It's the same as babel-plugin-fbt@0.20.2.
- 0.20.2:
  - [fix] Improve detection pattern of fbt/fbs JS callsites from FbtCollector

- 0.20.1:
  - [fix] Fix ability to detect fbs JS callsites from FbtCollector

- 0.20.0:
  - [refactor] Hang FbtUtil modules off of babel-plugin-fbt
  - [refactor]! Replace `fbtBabelPluginPath` with actual referenct to `fbtModule` in external transform

- 0.19.2:
  - [chore] Update devDependency of `gulp-strip-docblock-pragmas`

- 0.19.1:
  - [chore] Update fb-babel-plugin-utils dependency version

- 0.19.0:
  - [refactor]! Move to @fbtjs/default-collection-transform and avoid fb-babel-plugin-utils/SyntaxPlugins

- 0.18.0:
  - [fix] Ignore __private JSX attributes when parsing
  - [feat] Add ability to collect strings from a custom `FbtCollector` module for collection script

- 0.17.2:
  - [feat] Add external `transform` option for collection script
  - [fix] Add missing flow types for `yargs` npm module

- 0.17.1:
  - [chore] Additional flow typing in scripts

- 0.17.0:
  - [chore!] `collectFBT` renamed to `collectFbt` (BREAKING CHANGE: updates paths to binary)
  - [minor!] Add ability to write Flow annotations in JS code directly.
      Npm packages will contain both ES5 and Flow JS file versions.
      Source files have been moved to a `src` folder and their ES5-transpiled versions
      will be published inside the `dist` folder. (BREAKING CHANGE: updates paths to source files)
  - [chore] Adding @noflow annotations
  - [fix] Fix issue where the value of the `human` option of `fbt:pronoun` was processed incorrectly. Before, `human=true` used to behave as if `human=false`, and vice versa.
      Also, when `fbt:pronoun` is used without an explicit `human=false` option, we'll now generate the `NOT_A_PERSON` gender-case.
  - [fix] Fix incorrect object detection algorithm of `objMap()` in `FbtUtil.js`
  - [chore] Remove dead code

- 0.16.0:
  - [major] Merge two `GenderConst` entries that had the same value to avoid confusion. <br/>
    I.e. `MIXED_SINGULAR` and `MIXED_PLURAL` will both be referred as `MIXED_UNKNOWN` and it'll keep the same value (`MIXED_UNKNOWN=5`).
  - [refactor] Remove dependency on `fbjs` and `fbjs-scripts` modules. Update to `jest-docblock@^26.0.0`.
  - [feat] Added tests to ensure that `IntlVariations` gender and number constants are in sync with the client-side code equivalent

- 0.15.1:
  - [fix] `fbt:plural` branch pruning when `value` option present. (Introduced in v0.13.0)

- 0.15.0:
  - [fix] Relax required version patterns of npm dependencies
  - [fix] Add missing npm dependencies for `bin/manifest.js`
  - [feat] Add ES6 imports/exports support for shared enums. See [related doc.](https://facebook.github.io/fbt/docs/enums#es6-import-export-syntax)
  - [fix] Avoid throwing errors during string extraction when source code folder has no fbt string inside. (manifest & collect-fbts)

- 0.14.2:
  - [fix] Bug in collectFBT.js when using `BOTH` packagers with `--terse`

- 0.14.1:
  - [fix] Point to correct fb-babel-plugin-utils package version

- 0.14.0:
  - [fix] Fix issues due to missing dependency to the `nullthrows` npm package (only visible when using babel-plugin-fbt as a standalone module)
  - [feat] Add ability to provide strings as an array instead of a string concatenation pattern for the Fbt functional API.
  - [fix] Fixed Flow checks due to missing @babel/types dependency

- 0.13.0:
  - [feat] Loosen Babel dependencies and upgrade yargs
  - [feat] When throwing an error in the Babel transform, show source code of the related node.
  - [fix] Fix incorrect test input in `fbtFunctional-test.js`
  - [refactor] Split up the monolithic fbt transform logic into separate modules.

- 0.12.1:
  - Require passed plugins in collectFBT before passing to Babel

- 0.12.0:
  - Support common strings as plugin option

- 0.11.1:
  - Remove #!shebang from bin scripts and point to wrappers in `node_modules/.bin` shortcut paths

- 0.11.0:
  - [feature] Enable both phrase and text packaging in collectFbt
  - [feature] Create new `node_modules/.bin` shortcuts for our scripts.
    You can now execute them like this:
      - `yarn fbt-collect`
      - `yarn fbt-manifest`
      - `yarn fbt-translate`

- 0.10.4:
  - Add description in NPM package

- 0.10.3:
  - Sync fbjs, fbjs-scripts, & glob deps with other FB packages

- 0.10.2:
  - Add READMEs and improve repository link in package.json
  - Enable paths for enum module references
  - Enable multiple src folders for manifest
  - Fix manifest bug with directories ending in `.js`

- 0.10.1:
  - [bug] Fix IntlNumberType.get(...) to work with short locales [#85](https://github.com/facebook/fbt/pull/85)
  - Allow jsx files to be fbt-containing candidates.

- 0.10.0:
  - [435ec19](https://github.com/facebook/fbt/commit/435ec19) Ignoring tests and mocks from NPM modules
  - [67ed16f](https://github.com/facebook/fbt/commit/67ed16f) Prune fbt:pronoun branches
  - [b0247c6](https://github.com/facebook/fbt/commit/b0247c6) Fix bug in translate command where reading from stdin could sometimes fail (#79)
  - [0199b8d](https://github.com/facebook/fbt/commit/0199b8d) Remove `bin/tiger*` in favor of standalone `fb-tiger-hash` NPM package (native JS implementation)

- 0.9.16:
  - [7d46281](https://github.com/facebook/fbt/commit/7d46281) `output-dir` arg added to the translate script - output files split by locale.

- 0.9.14:
  - [c11e9fd](https://github.com/facebook/fbt/commit/c11e9fd) Enable custom Babel plugins for FBT collection

### babel-plugin-fbt-runtime versions
  <details>
    <summary>
      Unreleased changes that have landed in main. Click to see more.
    </summary>
  </details>

- 1.0.0:
  - [feat]! Major release to maintain compatibility with `babel-plugin-fbt@1.0.0`
  - [feat] Append hk/ehk to the `fbt._()  'options' argument rather than
    overriding the 'options' argument. This exposes extra options, which are
      dumped by `babel-plugin-fbt` to the 'options' argument, in fbt runtime
    calls.

- 0.10.0-rc1-beta - 0.10.0-rc5-beta:
  - [chore] Improve `.npmignore` config (avoid exporting some build, debug & test files)
  - [chore] Update fbtRuntime-test.js after the definition of `hash_key` in
  fbtJenkinsHash.js was modified
  - [refactor] Move clear token replacement logic to babel-plugin-fbt/src/FbtUtil.js
  - [chore] Updated peer dependency on babel-plugin-fbt
  - [chore] Updated devDependency on fb-babel-plugin-utils
  - [feat]! Strip jsfbt leaves of keys that are unneccessary for runtime and only keep the `text` key.
  - [refactor] Flowify index.js
  - [chore] Use `invariant()` from the `invariant` npm package instead of `fbjs/lib/invariant`

- 0.9.18:
  - [chore] Updated peer dependency on babel-plugin-fbt

- 0.9.17:
  - [chore] Updated devDependency on fb-babel-plugin-utils

- 0.9.16:
  - [chore] Updated peer dependency on babel-plugin-fbt

- 0.9.15:
  - [chore] Updated peer dependency on babel-plugin-fbt

- 0.9.14:
  - [fix] Updated peer dependency on babel-plugin-fbt

- 0.9.13:
  - [fix] Updated peer dependencies

- 0.9.12:
  - [fix] Relax required version patterns of npm dependencies

- 0.9.11:
  - Update peer dependency on `babel-plugin-fbt` and devDependency on `fb-babel-plugin-utils`

- 0.9.10:
  - Update peer dependency on `babel-plugin-fbt`

- 0.9.9:
  - Add description in NPM package

- 0.9.8:
  - Fix fbjs dependency semver

- 0.9.7:
  - package.json: improve repository link and set more accurate dependency versions

- 0.9.6:
  - Add READMEs and improve repository link in package.json

- 0.9.5:
  - [435ec19](https://github.com/facebook/fbt/commit/435ec19) Ignoring tests and mocks from NPM modules

- 0.9.4:
  - [250207c](https://github.com/facebook/fbt/commit/250207c) Update peer dependencies for babel-plugin-fbt.

### fb-tiger-hash versions

  <details>
    <summary>
      Unreleased changes that have landed in main. Click to see more.
    </summary>

  </details>

- 1.0.0:
  - [feat]! Major release to maintain compatibility with `babel-plugin-fbt@1.0.0`
  - [chore] Improve `.npmignore` config (avoid exporting some build, debug & test files)

- 0.2.0-rc1-beta:
  - [refactor] Add flow types
  - [refactor]! Replace `hashPhrases()` function by `getFbtHash()`

- 0.1.6:
  - Strip yarn files in .npmignore

- 0.1.5:
  - Add Typescript declarations and move source files to their own folder

- 0.1.4:
  - Add description in NPM package

- 0.1.3:
  - package.json: improve repository link and set more accurate dependency versions

- 0.1.0:
  -  First commit. A native JavaScript implementation of the Tiger hash Algorithm.

### @fbtjs/default-collection-transform versions
  <details>
    <summary>
      Unreleased changes that have landed in main. Click to see more.
    </summary>
  </details>

- 1.0.0:
  - [chore] Update peer dependency for `babel-plugin-fbt@1.0.0`
  - See `0.0.4-beta` for more info

- 0.0.4-beta:
  - [chore] Improve `.npmignore` config (avoid exporting some build, debug & test files)
  - [chore] Update peer dependency for `babel-plugin-fbt@^0.21.x`

- 0.0.3:
  - Update peer dependency on babel-plugin-fbt
  - Pass `{enum: true}` to '@babel/plugin-syntax-flow'

- 0.0.2:
  - Require Babel plugins directly

- 0.0.1:
  - First commit.  A default Babel transform to use for fbt collection.

### @fbtjs/babel-plugin-standalone versions

- 0.0.1:
  - First commit.  The standalone browser-friendly version of `babel-plugin-fbt`.

### fb-babel-plugin-utils versions
  <details>
    <summary>
     Unreleased changes that have landed in main. Click to see more.
    </summary>

  </details>

- 0.13.0:
  - [chore] Add `.npmignore` config (avoid exporting some build, debug & test files)
  - See `0.13.0-beta for` more info

- 0.13.0-beta:
  - [feat] Allow test data to specify `filter` status which decides whether a test will be run
  - [fix] Fixed display of error message for `assertSourceAstEqual()`

- 0.12.0:
  - [refactor!] Remove SyntaxPlugins
  - [chore] Remove SyntaxPluginsConfig

- 0.11.1:
  - [chore] Adding @noflow annotations

- 0.11.0:
  - [feat] Add ability to test against Jest code snapshots
  - [fix] Add missing `json-diff` npm dependency

- 0.10.1:
  - [fix] Relax required version patterns of npm dependencies

- 0.10.0:
  - Feat: expose utility function `generateFormattedCodeFromAST()` to convert a `BabelNode` to a source code string
  - Minor: clarify error messages when unit tests fail due to Babel AST node differences.
  - Minor: normalize source code before using it in unit tests' code comparisons

- 0.9.1:
  - Add READMEs and improve repository link in package.json

- 0.9.0:
  - Initial commit

### gulp-rewrite-flowtyped-modules versions

  <details>
    <summary>
     Unreleased changes that have landed in main. Click to see more.
    </summary>

  </details>

- 0.0.10:
  - [chore] Improve `.npmignore` config (avoid exporting some build, debug & test files)

- 0.0.9:
  - Initial commit

### gulp-strip-docblock-pragmas versions

  <details>
    <summary>
     Unreleased changes that have landed in main. Click to see more.
    </summary>

  </details>

- 0.0.4:
  - [chore] Improve `.npmignore` config (avoid exporting some build, debug & test files)

- 0.0.3:
  - Initial release

### react-native-fbt versions

  <details>
    <summary>
     Unreleased changes that have landed in main. Click to see more.
    </summary>

    - [chore] Improve `.npmignore` config (avoid exporting some build, debug & test files)
  </details>

- 0.0.1:
  - New React Native package that enables the FBT library for both iOS and Android

### fbt-rn-android-native versions [Deprecated]

- 0.0.2:
  - Updated Readme.md file with a link to a demo app showing how to use the module

- 0.0.1:
  - Initial commit
