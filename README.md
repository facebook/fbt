# fbt 
FBT is an internationalization framework designed to be both intuitive and powerful, but also flexible and complete.  It the following problems:
* Organizing your source text for translation
* Composing grammatically correct UI
* i18n-driven source-code bloat
* 

## Examples
[See here](https://github.com/facebook/fbt)

## Requirements
* [node]()
* yarn
* babel

## Building fbt
...


## Installing __________
```
git clone git@github.com:facebook/fbt.git;
cd fbt/demo-app;
yarn install;
yarn manifest;
yarn collect-fbts;
yarn translate-fbts;
yarn start;
```


## How fbt works
FBT works by transforming your `<fbt>` and `fbt(...)` constructs in
Babel plugins.  These plugins serve to extact strings from source and
lookup translate payloads generated at build-time.

## Full documentation
https://facebook.github.io/fbt

## Join the __________ community
* Website: https://facebook.github.io/fbt
* Facebook page: m.me/sjtbf
* Slack: https://fbtjs.slack.com
See the CONTRIBUTING file for how to help out.

## License
fbt is MIT licensed, as found in the LICENSE file.
