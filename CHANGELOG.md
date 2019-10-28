# Change log

List of changes for each released npm package version.

## Primo Mea-culpa
We haven't had the best track record of code/feature changes before this date, but let's try to do this properly from now on... [2019/09/03]

## TOC

- [fbt versions](#fbt-versions)
- [babel-plugin-fbt versions](#babel-plugin-fbt-versions)
- [babel-plugin-fbt-runtime versions](#babel-plugin-fbt-runtime-versions)
- [fb-tiger-hash versions](#fb-tiger-hash-versions)
- [fb-babel-plugin-utils versions](#fb-babel-plugin-utils)

### Top-level Github
- *[Experimental]* Add support for Flow type checks.
  - Run `yarn flow:check` to check them.
    - NOTE: our Flow types are still in their infancy, so lots of errors are expected.
  - Run `yarn flow:watch` to recheck types upon changing JS files.
- Prepare directory structure for Lerna
- Enable testing packages from top-level in GitHub

### fbt versions
  <details>
    <summary>
     Unreleased changes that have landed in master. Click to see more.
    </summary>
  </details>

- 0.10.5:
  - Add README.md

- 0.10.4:
  - Improve repository link in package.json

- 0.10.3:
  - [bug] Fix IntlNumberType.get(...) to work with short locales [#85](https://github.com/facebookincubator/fbt/pull/85)
  - Allow fbt:enum value prop to be a string literal
  - Fix intlList 'react' import [issue #62](https://github.com/facebookincubator/fbt/issues/62)

- 0.10.2:
  - [04df822](https://github.com/facebookincubator/fbt/commit/04df822) Updated package version references

- 0.10.0:
  - [9acb1cd](https://github.com/facebookincubator/fbt/commit/9acb1cd) Make fbt translation payload getter customizable

### babel-plugin-fbt versions
  <details>
    <summary>
     Unreleased changes that have landed in master. Click to see more.
    </summary>

  </details>

- 0.10.2:
  - Add READMEs and improve repository link in package.json
  - Enable paths for enum module references

- 0.10.1:
  - [bug] Fix IntlNumberType.get(...) to work with short locales [#85](https://github.com/facebookincubator/fbt/pull/85)
  - Allow jsx files to be fbt-containing candidates.

- 0.10.0:
  - [435ec19](https://github.com/facebookincubator/fbt/commit/435ec19) Ignoring tests and mocks from NPM modules
  - [67ed16f](https://github.com/facebookincubator/fbt/commit/67ed16f) Prune fbt:pronoun branches
  - [b0247c6](https://github.com/facebookincubator/fbt/commit/b0247c6) Fix bug in translate command where reading from stdin could sometimes fail (#79)
  - [0199b8d](https://github.com/facebookincubator/fbt/commit/0199b8d) Remove `bin/tiger*` in favor of standalone `fb-tiger-hash` NPM package (native JS implementation)

- 0.9.16:
  - [7d46281](https://github.com/facebookincubator/fbt/commit/7d46281) `output-dir` arg added to the translate script - output files split by locale.

- 0.9.14:
  - [c11e9fd](https://github.com/facebookincubator/fbt/commit/c11e9fd) Enable custom Babel plugins for FBT collection

### babel-plugin-fbt-runtime versions
- 0.9.7:
  - package.json: improve repository link and set more accurate dependency versions

- 0.9.6:
  - Add READMEs and improve repository link in package.json

- 0.9.5:
  - [435ec19](https://github.com/facebookincubator/fbt/commit/435ec19) Ignoring tests and mocks from NPM modules

- 0.9.4:
  - [250207c](https://github.com/facebookincubator/fbt/commit/250207c) Update peer dependencies for babel-plugin-fbt.

### fb-tiger-hash versions
- 0.1.3:
  - package.json: improve repository link and set more accurate dependency versions

- 0.1.0:
  -  First commit. A native JavaScript implementation of the Tiger hash Algorithm.

### fb-babel-plugin-utils

- 0.9.1:
  - Add READMEs and improve repository link in package.json

- 0.9.0:
  - Initial commit
