<p>
  <a href="https://github.com/facebook/fbt/actions?query=workflow%3Abuild">
    <img src="https://github.com/facebook/fbt/workflows/build/badge.svg" />
  </a>

  <a href="https://twitter.com/fbt_js">
    <img src="https://img.shields.io/twitter/follow/fbt_js.svg?style=social" align="right" alt="Twitter Follow" />
  </a>

  <a href="https://discord.gg/cQvXZr5">
    <img src="https://img.shields.io/discord/102860784329052160.svg" align="right" alt="Discord Chat" />
  </a>

  <a href="https://www.facebook.com/groups/498204277369868">
    <img src="https://img.shields.io/badge/Facebook-Group-blue" align="right" alt="Facebook Group" />
  </a>
</p>

<h1 align="center">
  <img src="https://facebook.github.io/fbt/img/fbt.png" height="150" width="150" alt="FBT"/>
</h1>

FBT is an internationalization framework for JavaScript designed to be not just **powerful** and **flexible**, but also **simple** and **intuitive**.
It helps with the following:
* Organizing your source text for translation
* Composing grammatically correct translatable UI
* Eliminating verbose boilerplate for generating UI

## Online Resources

* [Official Website](https://facebook.github.io/fbt)
* [Documentation](https://facebook.github.io/fbt/docs/getting_started_on_web)

## Examples
* [See our demo here](demo-app/src/example/Example.react.js)
* [See our React Native demo here](https://github.com/facebook/fbt/tree/rn-demo-app)

## Requirements
* [Node.js](https://nodejs.org/)
* [Yarn](https://yarnpkg.com/)
* [Babel](https://babeljs.io/)

## Building the fbt library
```
git clone git@github.com:facebook/fbt.git
cd fbt
yarn install
```

**NOTE:** if you make changes to the fbt runtime that you'd like to
test in the demo-app, be sure to run this command to rebuild the JS code:

```
yarn build-runtime
```

## Using fbt
See how to use the source directly with Babel and Webpack in [our demo-app](demo-app#babelwebpackreact-oss-fbt-demo).

## How FBT works
FBT works by transforming your `<fbt>` and `fbt(...)` constructs via
Babel plugins.  These plugins serve to extract strings from source and
lookup translated payloads generated at build-time.  FBT creates tables
of all possible variations for the given fbt phrase and accesses this
at runtime.

## Join the fbt community
* [Website](https://facebook.github.io/fbt)
* [Facebook group](https://www.facebook.com/groups/498204277369868)
* [Discord #fbt channel in reactiflux](https://discord.gg/cQvXZr5)
* [Twitter](https://twitter.com/fbt_js)

See the [CONTRIBUTING](CONTRIBUTING.md) file for how to help out.

## Change log
See [CHANGELOG](CHANGELOG.md).

## List of npm modules published from this repo:

- [babel-plugin-fbt](https://www.npmjs.com/package/babel-plugin-fbt) (build-time / server-side)
  - See [package.json](packages/babel-plugin-fbt/package.json)
- [babel-plugin-fbt-runtime](https://www.npmjs.com/package/babel-plugin-fbt-runtime) (server-side)
  - See [package.json](packages/babel-plugin-fbt-runtime/package.json)
- [@fbtjs/default-collection-transform](https://www.npmjs.com/package/@fbtjs/default-collection-transform) (build-time)
  - See [package.json](packages/default-collection-transform/package.json)
- [fb-babel-plugin-utils](https://www.npmjs.com/package/fb-babel-plugin-utils) (server-side, used by `babel-plugin-fbt-runtime`)
  - See [package.json](packages/fb-babel-plugin-utils/package.json)
- [fbt](https://www.npmjs.com/package/fbt) (client-side)
  - See [package.json](packages/fbt/package.json)
- [fb-tiger-hash](https://www.npmjs.com/package/fb-tiger-hash) (build-time)
  - See [package.json](packages/fb-tiger-hash/package.json)
- [gulp-rewrite-flowtyped-modules](https://www.npmjs.com/package/gulp-rewrite-flowtyped-modules) (build-time)
  - See [package.json](packages/gulp-rewrite-flowtyped-modules/package.json)
- [gulp-strip-docblock-pragmas](https://www.npmjs.com/package/gulp-strip-docblock-pragmas) (build-time)
  - See [package.json](packages/gulp-strip-docblock-pragmas/package.json)
- [react-native-fbt](https://www.npmjs.com/package/react-native-fbt) (build-time)
  - See [package.json](packages/react-native-fbt/package.json)

## License
FBT is MIT licensed, as found in the [LICENSE](LICENSE) file.
