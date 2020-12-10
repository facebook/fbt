# Babel/Webpack/React OSS FBT Demo

## Building and starting the demo app

Assuming you're in the `demo-app` folder (the same folder as this README),
run the following commands in order:

```
# 1. Prerequisites: install npm packages in the parent folder
pushd .. && yarn install && popd
# 2. Generate enum and source manifests
yarn manifest
# 3. Collect FBT translatable texts
yarn collect-fbts
# 4. Generate translatedFbts.js from translation_input.json
yarn translate-fbts
# 5. Generate static files in `./output/`.
yarn build
# 6. Run a local web server with hot reloading at localhost:8081
yarn start
```

Note: step 2-4 can be done with this command: `yarn all`.

## Unit tests

```
yarn test
```

**NOTE**: if you make changes to the fbt runtime that you'd like to
test in the demo-app, be sure to run `yarn build-runtime` in the
top-level to ensure the latest changes are there
