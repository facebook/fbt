# Babel/Webpack/React OSS FBT Demo

## Building and starting the demo app

Run the following commands in order:

```
yarn install
# 1. Generate enum and source manifests
yarn manifest
# 2. Collect FBT translatable texts
yarn collect-fbts
# 3. Generate translatedFbts.js from translation_input.json
yarn translate-fbts
# 4. Generate static files in `./output/`.
yarn build
# 5. Run a local web server with hot reloading at localhost:8081
yarn start
```

Note: step 1-3 can be done with this command: `yarn all`.

## Unit tests

```
yarn test
```

**NOTE**: if you make changes to the fbt runtime that you'd like to
test in the demo-app, be sure to run `yarn build-runtime` in the
top-level to ensure the latest changes are there
