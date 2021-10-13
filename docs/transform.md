---
id: transform
title: JS Transforms (Transpilation)
sidebar_label: Babel Transforms
---
The fbt comes with 2 babel transforms.

## babel-plugin-fbt
The first is the `babel-plugin-fbt`.  Internally, it first transforms `<fbt>` instances into their `fbt(...)` equivalent.  After which, it turns all `fbt(...)` calls into `fbt._(...)` calls with an intermediary payload as the first argument, and the runtime arguments to be passed in.

## babel-plugin-fbt-runtime
This transform takes the intermediary payload and turns it into the object that the `fbt._(...)` runtime expects.

### Why are there 2 transforms?
Internally, Facebook actually consumes the output of the `babel-plugin-fbt` at
build-time.  We search for `__FBT__` sentinels, generate an identifier (hash)
for the FBT payload, and store it for lookup later after generating the
translated payload in a separate process.  At resource request time, we lookup
the `payload identifier + locale` and replace the identifier inline in source
with the translated payload. Conceptually, we're performing the
[`FbtTranslations`](https://github.com/facebook/fbt/blob/main/runtime/nonfb/FbtTranslations.js)
lookup, but on the server-side before serving the JS resource.
