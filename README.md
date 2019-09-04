<h1 align="center">
  <img src="https://facebookincubator.github.io/fbt/img/fbt.png" height="150" width="150"/>
</h1>

FBT is an internationalization framework for JavaScript designed to be both powerful and flexible, but also simple and intuitive.  It helps with the following:
* Organizing your source text for translation
* Composing grammatically correct translatable UI
* Eliminating verbose boilerplate for generating UI

## Examples
[See our demo here](demo-app/src/example/Example.react.js)

## Requirements
* [Node.js](https://nodejs.org/)
* [Yarn](https://yarnpkg.com/)
* [Babel](https://babeljs.io/)

## Building the fbt library
```
git clone git@github.com:facebookincubator/fbt.git
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
lookup translate payloads generated at build-time.  FBT creates tables
of all possible variations for the given fbt phrase and accesses this
at runtime.

## Full documentation
https://facebookincubator.github.io/fbt

## Join the fbt community
* [Website](https://facebookincubator.github.io/fbt)
* [Facebook group](https://www.facebook.com/groups/498204277369868)
* [Discord #fbt channel in reactiflux](https://discord.gg/cQvXZr5)
* [Twitter](https://twitter.com/fbt_js)

See the [CONTRIBUTING](CONTRIBUTING.md) file for how to help out.

## List of npm modules published from this repo:

- [fbt](https://www.npmjs.com/package/fbt) (client-side)
  - See [package.json](fbt-runtime/package.json) config
- [babel-plugin-fbt](https://www.npmjs.com/package/babel-plugin-fbt) (server-side)
  - See [package.json](transform/babel-plugin-fbt/package.json) config
- [babel-plugin-fbt-runtime](https://www.npmjs.com/package/babel-plugin-fbt-runtime) (server-side)
  - See [package.json](transform/babel-plugin-fbt-runtime/package.json) config
- [fb-babel-plugin-utils](https://www.npmjs.com/package/fb-babel-plugin-utils) (server-side, used by `babel-plugin-fbt-runtime`)
  - See [package.json](transform/fb-babel-plugin-utils/package.json) config

## How to release a new npm version

Example for the `fbt` npm module:

```
cd fbt-runtime/
yarn publish_to_npm_latest
```

## License
FBT is MIT licensed, as found in the [LICENSE](LICENSE) file.
