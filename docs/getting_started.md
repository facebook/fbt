---
id: getting_started
title: Getting Started
sidebar_label: Getting Started
---

## Try the Demo
Check out our [Github](https://github.com/facebook/fbt) repository and run the Webpack demo app.
See ["Building and starting the demo app"](https://github.com/facebook/fbt/tree/master/demo-app#building-and-starting-the-demo-app)
# Integrating into your app

## NPM module dependencies
The required NPM modules to add to your `dependencies` in your app are:
 * [**fbt**](https://www.npmjs.com/package/fbt) - The `fbt` runtime module
 * [**babel-plugin-fbt**](https://www.npmjs.com/package/babel-plugin-fbt) - The primary Babel transform
 * [**babel-plugin-fbt-runtime**](https://www.npmjs.com/package/babel-plugin-fbt-runtime) - The secondary Babel transform
   * Transforms the raw payloads within `fbt._(...)` so they can be used at runtime (by `fbt._`)
   * NOTE: [This plugin should get merged into `babel-plugin-fbt`](https://github.com/facebook/fbt/issues/125)

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
There are scripts bundled into the `babel-plugin-fbt` package that are desigend for collecting source text (and associated metadata) from your application's source.
These are:

 * [manifest](https://github.com/facebook/fbt/blob/master/packages/babel-plugin-fbt/bin/manifest.bin.js) -
   Scans provided filesystem paths and generates a manifest of the [enumeration modules](https://facebook.github.io/fbt/docs/enums)
   * **NOTE**: Enum modules must end in [$FbtEnum.(js|jsx|ts|tsx)](https://github.com/facebook/fbt/blob/3a5441708ca6b71c2c18fe5a952d1058a22306d1/packages/babel-plugin-fbt/bin/manifest.js#L66) (i.e. `Foo$FbtEnum.js`)
 * [collectFBT](https://github.com/facebook/fbt/blob/master/packages/babel-plugin-fbt/bin/collectFBT.bin.js) -
   Given source input, extract any source text and print them to STDOUT as JSON

### Translation
 * [translate](https://github.com/facebook/fbt/blob/master/packages/babel-plugin-fbt/bin/translate.bin.js) -
   Creates translation payloads for runtime
   * Takes extracted source text (from `collectFBT`) and [translations provided in JSON format](https://facebook.github.io/fbt/docs/translating) to produce these payloads

### How to use these scripts
You can see how the demo-app [calls into these scripts here](https://github.com/facebook/fbt/blob/3a5441708ca6b71c2c18fe5a952d1058a22306d1/demo-app/package.json#L11-L14).

The demo app [runs all these in another script, here](https://github.com/facebook/fbt/blob/3a5441708ca6b71c2c18fe5a952d1058a22306d1/demo-app/run_all.js)

## Runtime
The [fbt runtime](https://www.npmjs.com/package/fbt) is what resolves the translation payload table generated during the translation phase into a singular result base on all the input provided at runtime.

### Initialization
The `fbt` runtime requires that you initialize with your relevant translations via the `init` function.  You can see an [example of this in the demo-app](https://github.com/facebook/fbt/blob/98d0516290975f614737387748769e235bf61216/demo-app/src/example/Example.react.js#L16-L17).

If you've split your translation payloads using [the `--output-dir` option](https://github.com/facebook/fbt/blob/98d0516290975f614737387748769e235bf61216/packages/babel-plugin-fbt/bin/translate.js#L145-L153) to the [`translate` script](https://github.com/facebook/fbt/blob/master/packages/babel-plugin-fbt/bin/translate.js), you can still update locales on-the-fly after you've brought your payload in by updating the translation map held by `fbt`, [similar to the demo-app](https://github.com/facebook/fbt/blob/98d0516290975f614737387748769e235bf61216/packages/babel-plugin-fbt/bin/translate.js#L178), or by calling into `init` with your new translations for your given locale again.
