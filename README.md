# fbt 
FBT is an internationalization framework designed to be both intuitive and powerful, but also flexible and complete.  It the following problems:
* Organizing your source text for translation
* Composing grammatically correct UI
* i18n-driven source-code bloat
* 

## Examples
[See here](https://github.com/facebook/fbt)

## Requirements
* [node](https://nodejs.org/)
* [yarn](https://yarnpkg.com/)
* [babel](https://babeljs.io/)

## Building fbt
```
git clone git@github.com:facebook/fbt.git;
cd fbt;
yarn install;
```

## Installing fbt
We have plans to make the transform and runtime installable as an npm package. Until then,
See how to use the source directly with Babel and Webpack in our demo-app:

```
cd demo-app; # from fbt repo
yarn install;
yarn manifest;
yarn collect-fbts;
yarn translate-fbts;
yarn start;
```

## How FBT works
FBT works by transforming your `<fbt>` and `fbt(...)` constructs in
Babel plugins.  These plugins serve to extract strings from source and
lookup translate payloads generated at build-time.  FBT creates tables
of all possible variations for the given fbt phrase and accesses this
at runtime

## Full documentation
https://facebook.github.io/fbt

## Join the fbt community
* Website: https://facebook.github.io/fbt
* Facebook page: m.me/sjtbf
* Slack: https://fbtjs.slack.com
See the CONTRIBUTING file for how to help out.

## License
FBT is MIT licensed, as found in the LICENSE file.
