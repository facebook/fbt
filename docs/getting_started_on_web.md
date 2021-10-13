---
id: getting_started_on_web
title: Getting Started on web
sidebar_label: Web
---

## Try the Demo
Check out our [Github](https://github.com/facebook/fbt) repository and run the Webpack demo app.
See ["Building and starting the demo app"](https://github.com/facebook/fbt/tree/main/demo-app#building-and-starting-the-demo-app)
# Integrating into your app

## NPM module dependencies
The required NPM modules to add to your `dependencies` in your app are:
 * [**fbt**](https://www.npmjs.com/package/fbt) - The `fbt` runtime module
 * [**babel-plugin-fbt**](https://www.npmjs.com/package/babel-plugin-fbt) - The primary Babel transform
 * [**babel-plugin-fbt-runtime**](https://www.npmjs.com/package/babel-plugin-fbt-runtime) - The secondary Babel transform
   * Transforms the raw payloads within `fbt._(...)` so they can be used at runtime (by `fbt._`)
   * NOTE: [This plugin should get merged into `babel-plugin-fbt`](https://github.com/facebook/fbt/issues/125)
 * [**@fbtjs/default-collection-transform**](https://www.npmjs.com/package/@fbtjs/default-collection-transform)
   * Only required if if you elect *not* to pass a custom `--transform` nor `--custom-collector` in the [collection script](https://github.com/facebook/fbt/blob/3fc75eb5b3303db6041df098b5f77a94b5f36309/packages/babel-plugin-fbt/src/bin/collectFbt.js#L116-L152)

If you're unfamiliar with [Babel](https://babeljs.io/), you can read through [their documentation here](https://babeljs.io/)

### Babel Plugin ordering (Caveat)
There is a plugin ordering gotcha to be aware of if you use other Babel plugins.
FBT expects to be the first plugin to visit its relevant `<fbt>` and `fbt(...)` nodes
[See this Github issue tracking this](https://github.com/facebook/fbt/issues/40)

You'll hit issues if another transforms beats the `babel-plugin-fbt`
to the Babel AST, node and transforms it such that the plugin doesn't
"recognize" as an `fbt` node anymore.  This is most commonly on JSX nodes.
To work around this you can use Babel's `passPerPreset` option, and ensure `babel-plugin-fbt` is in an earlier preset bundle:
```
  babel.transformSync(source, {
    passPerPreset: true,
    {presets: [
      {plugins: [‘babel-plugin-fbt’, ‘babel-plugin-fbt-runtime'...]}
      {plugins: [‘babel-plugin-jsx-foo’, ...]} //
    ]},
    ... // your other options
  })
```

### Webpack Example
You'll need to add the fbt babel transforms in a manner similar to our demo-app.
[See our demo-app's Webpack config](https://github.com/facebook/fbt/blob/543e0a9c5b5c74e2094da3b94e3828c1dccacb7a/demo-app/webpack.config.js#L54-L59)

## Build-time / offline processes

### Collection
There are scripts bundled into the `babel-plugin-fbt` package that are designed for collecting source text (and associated metadata) from your application's source.
These are:

 * [fbt-manifest](https://github.com/facebook/fbt/blob/19531133625dab1d38995dcf578dcfdfa0b09048/packages/babel-plugin-fbt/package.json#L10) -
   Scans provided filesystem paths and generates a manifest of the [enumeration modules](https://facebook.github.io/fbt/docs/enums)
   * **NOTE**: Enum modules must end in [$FbtEnum.(js|jsx|ts|tsx)](https://github.com/facebook/fbt/blob/3a5441708ca6b71c2c18fe5a952d1058a22306d1/packages/babel-plugin-fbt/bin/manifest.js#L66) (i.e. `Foo$FbtEnum.js`)
 * [fbt-collectFbt](https://github.com/facebook/fbt/blob/19531133625dab1d38995dcf578dcfdfa0b09048/packages/babel-plugin-fbt/package.json#L9) -
   Given source input, extract any source text and print them to STDOUT as JSON
   * [**@fbtjs/default-collection-transform**](https://www.npmjs.com/package/@fbtjs/default-collection-transform) - As mentioned, this optional package provides a default transform for collection

### Translation
 * [fbt-translate](https://github.com/facebook/fbt/blob/19531133625dab1d38995dcf578dcfdfa0b09048/packages/babel-plugin-fbt/package.json#L11) -
   Creates translation payloads for runtime
   * Takes extracted source text (from `collectFbt`) and [translations provided in JSON format](https://facebook.github.io/fbt/docs/translating) to produce these payloads

### How to use these scripts
You can see how the demo-app [calls into these scripts here](https://github.com/facebook/fbt/blob/3a5441708ca6b71c2c18fe5a952d1058a22306d1/demo-app/package.json#L11-L14).

The demo app [runs all these in another script, here](https://github.com/facebook/fbt/blob/3a5441708ca6b71c2c18fe5a952d1058a22306d1/demo-app/run_all.js)

## Runtime
The [fbt runtime](https://www.npmjs.com/package/fbt) is what resolves the translation payload table generated during the translation phase into a singular result base on all the input provided at runtime.

### Initialization
The `fbt` runtime requires that you initialize with your relevant translations via the `init()` function.  You can see an [example of this in the demo-app](https://github.com/facebook/fbt/blob/df2414ab3eb00a94b4a082d8f62e0e39e3053e40/demo-app/src/example/Example.react.js#L22-L27).

### Changing of translation locale on the fly

Let's assume you've split your translation payloads per locale using the [`--output-dir` option](https://github.com/facebook/fbt/blob/98d0516290975f614737387748769e235bf61216/packages/babel-plugin-fbt/bin/translate.js#L145-L153) of the [`translate` script](https://github.com/facebook/fbt/blob/main/packages/babel-plugin-fbt/src/bin/translate.js). In this example, your app was initialized with the `es_ES` translation payload and, upon user request, you need to load `fr_FR` translations and show these in the UI. (We'll assume that your app already has access to the new translation payload)

In order to change of translation locale on the fly, you'll need to do all the items below:

1. **Update the translation payload** by calling [`FbtTranslations.registerTranslations(newTranslationPayload)`](https://github.com/facebook/fbt/blob/f58d7c24e675c925d6d54dc33aa749b1640da200/runtime/nonfb/FbtTranslations.js#L49). The translation payload object used there should have the same structure as what was passed to the `init()` function.
1. **Expose the current UI translation locale** by providing a [`getViewerContext()`](https://github.com/facebook/fbt/blob/df2414ab3eb00a94b4a082d8f62e0e39e3053e40/runtime/shared/FbtHooks.js#L83) hook to the `init()` function. See our our [demo app](https://github.com/facebook/fbt/blob/df2414ab3eb00a94b4a082d8f62e0e39e3053e40/demo-app/src/example/Example.react.js#L17-L27) for example.
   1. NOTE: it's not sufficient to only change the translation payload because we apply various number variation and phonological rules based on the UI locale. I.e. If you forget to change of locale, you might still end up displaying incorrect translations.
