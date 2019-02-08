# Babel/Webpack/React OSS FBT Demo

* `yarn manifest` to generate enum and source manifests
* `yarn collect-fbts` to collect FBT translatable texts
* `yarn translate-fbts` to generate translatedFbts.js from translation_input.json
* `yarn build` to generate static files in `./output/`.
  * The commands above are required to run this step
* `yarn start` to run a local server with hot reloading.
* `yarn test` to run unit tests.

**NOTE**: If you make changes to the fbt runtime that you'd like to
test in the demo-app, be sure to run `yarn build-runtime` in the
top-level to ensure the latest changes are there
