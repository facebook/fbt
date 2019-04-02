---
id: getting_started
title: Getting Started
sidebar_label: Getting Started
---

Check out our [GitHub](https://github.com/facebookincubator/fbt) repository and run the demo.

The following assumes you have [Node](https://nodejs.org) and [Yarn](https://yarnpkg.com) installed.

```bash
git clone git@github.com:facebookincubator/fbt.git
cd fbt
yarn install # Build the fbt library
cd demo-app
yarn install # Install dependencies for demo
yarn manifest # Generate fbt enum manifests and source manifests
yarn collect-fbts # Collect all fbt phrases from source
yarn translate-fbts # Generate the translation payloads
yarn build
yarn start # Check out your locally running server at localhost:8081
```
