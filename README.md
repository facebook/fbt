# FBT
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

## Building fbt
```
git clone git@github.com:facebookincubator/fbt.git
cd fbt
yarn install
```

## Installing fbt
We will make the transform and runtime installable as an npm package soon. Until then,
See how to use the source directly with Babel and Webpack in our demo-app:

```
cd demo-app # from fbt repo
yarn install
yarn manifest
yarn collect-fbts
yarn translate-fbts
yarn start
```

## How FBT works
FBT works by transforming your `<fbt>` and `fbt(...)` constructs via
Babel plugins.  These plugins serve to extract strings from source and
lookup translate payloads generated at build-time.  FBT creates tables
of all possible variations for the given fbt phrase and accesses this
at runtime

## Full documentation
https://facebookincubator.github.io/fbt

## Join the fbt community
* [Website](https://facebookincubator.github.io/fbt)
* [Facebook group](https://www.facebook.com/groups/498204277369868)
* [Discord #fbt channel in reactiflux](https://discord.gg/cQvXZr5)
* [Twitter](https://twitter.com/fbt_js)

See the [CONTRIBUTING](CONTRIBUTING.md) file for how to help out.

## License
FBT is MIT licensed, as found in the [LICENSE](LICENSE) file.

### Code Visualization:

Here is a cool visualization of the code evolution

 [![Watch the video](https://img.youtube.com/vi/wESu8hSEvJ4/0.jpg)](https://www.youtube.com/watch?v=wESu8hSEvJ4)

 [https://www.youtube.com/watch?v=wESu8hSEvJ4](https://www.youtube.com/watch?v=wESu8hSEvJ4)

