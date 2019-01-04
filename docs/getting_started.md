---
id: getting_started
title: Getting Started
sidebar_label: Getting Started
---

Check out our [github](https://github.com/facebookincubator/fbt) repository and run the demo.
The following assumes you have [node](https://nodejs.org) and [yarn](https://yarnpkg.com) installed.
```bash
git clone git@github.com:facebookincubator/fbt.git;
cd fbt/demo-app;
yarn install; # pull in dependencies
yarn manifest; # generate fbt enum manifests and source manifests
yarn collect-fbts; # Collect all fbt phrases from source
yarn translate-fbts; # Generate the translation payloads
yarn build;
yarn start; # Checkout your locally running server at localhost:8081
```
