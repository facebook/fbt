---
id: common
title: Common FBT strings
sidebar_label: Common strings
---
The `fbt` framework provides a way to define common simple strings in one shared location.  The expected format is as a text to description map.

E.g

```js
// OurCommonStrings.js
module.exports = {
  "Photo": "Still image ...",
  "Video": "Moving pictures ...",
  ...
};
```

## FBT Transform
It accepts these common strings via the main Babel transform, [`babel-plugin-fbt`](https://github.com/facebook/fbt/blob/8a3145030074162f8ecbfb7374dafac03661a3a0/packages/babel-plugin-fbt/FbtCommon.js#L22-L24), as a plugin option.

Example Babel setup:

```js
{
  plugins: [
    ['babel-plugin-fbt', {
      fbtCommonPath: "/path/to/OurCommonStrings.js",
      // OR inlined...
      fbtCommon: {
        "Photo": "...",
        ...
      },
      ...
    }],
    ...
  ]
}
```

## Runtime API
To use the strings at runtime, there is the `fbt.c(...)` function call or the `<fbt common=true>...</fbt>` JSX API.

***NOTE: The transform will throw if it encounters a common string *not* in the map provided.***

E.g.

```js
<button>
  {fbt.c('Photo')}
</button>
```

or

```js
<button>
  <fbt common>Photo</fbt>
</button>
```

Both examples above function as if the engineer had also included the description with the text.

```js
  <fbt desc="Still image ...">Photo</fbt>
```

All of these instances would produce the same identifying hash at collection time, and thus coalesce into the same translation.
