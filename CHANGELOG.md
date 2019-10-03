# Change log

List of changes for each released npm package version.

## Primo Mea-culpa
We haven't had the best track record of code/feature changes before this date, but let's try to do this properly from now on... [2019/09/03]

## TOC

- [fbt versions](#fbt-versions)
- [babel-plugin-fbt versions](#babel-plugin-fbt-versions)
- [babel-plugin-fbt-runtime versions](#babel-plugin-fbt-runtime-versions)
- [fb-tiger-hash versions](#fb-tiger-hash-versions)

### fbt versions
- 0.10.2:
  - [04df822](https://github.com/facebookincubator/fbt/commit/04df822) Updated package version references
- 0.10.0:
  - [9acb1cd](https://github.com/facebookincubator/fbt/commit/9acb1cd) Make fbt translation payload getter customizable


### babel-plugin-fbt versions
- [Unreleased]
  <details>
    <summary>
     Changes that have landed in master but are not yet released.
     Click to see more.
    </summary>

   - [MAJOR] Remove `bin/tiger*` in favor of standalone `fb-tiger-hash` NPM package (native JS implementation)
   - [BUG] Fix bug in translate command where reading from stdin could sometimes fail (#79)

  </details>

- 0.9.16:
  - [7d46281](https://github.com/facebookincubator/fbt/commit/7d46281) `output-dir` arg added to the translate script - output files split by locale.

- 0.9.14:
  - [c11e9fd](https://github.com/facebookincubator/fbt/commit/c11e9fd) Enable custom Babel plugins for FBT collection

### babel-plugin-fbt-runtime versions
- 0.9.4:
  - [250207c](https://github.com/facebookincubator/fbt/commit/250207c) Update peer dependencies for babel-plugin-fbt.

### fb-tiger-hash versions
- 0.1.0:
  -  First commit. A native JavaScript implementation of the Tiger hash Algorithm.
