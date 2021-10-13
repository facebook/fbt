---
id: collection
title: Extracting FBTs
sidebar_label: Extracting translatable texts
---
We provide

[`collectFbt.js`](https://github.com/facebook/fbt/blob/main/packages/babel-plugin-fbt/src/bin/collectFbt.js)
as a utility for collecting strings.  It expects a JSON input of:
```
{
  <enumManifestPath>: [
    <path1>, <path2>, ..., <pathN>
  ]
}
```
_`collectFbt.js` is also exposed as a binary named `fbt-collect` from `babel-plugin-fbt`_

`enumManifestPath` doesn't need to point to a valid enum manifest, but if you use a [shared enum](enums#shared-enums) it's required.

The enum-manifest should be a `"JSON.parseable"` mapping from all known enums in your app to the key/value pairs they respectively represent:
```
{
 "EnumA": {
    "keyA1": "valA1",
    ...,
    "keyAN": "valAN"
  },
  ...,
 "EnumX": {
    "keyX1": "valX1",
    ...,
    "keyXM": "valXM"
  },
}
```
We've provided `manifest.js` as an easy way to generate this manifest from a given source tree.
_`manifest.js` is also exposed as a binary named `fbt-manifest` from `babel-plugin-fbt`_

`collectFbt.js` will output a JSON object in the following format:

```js
{
  "phrases": [
    {
      "hashToLeaf": {
        <hash>: {
          "text": <text>,
          "desc": <description>,
        },
        ...
      },
      "line_beg": <beginning_line>,
      "col_beg": <beginning_col>,
      "line_end": <end_line>,
      "col_end": <col_end>,
      "type": "text"|"table",
      "project": <project>,
      "jsfbt": string|{t: <table>, m: <metadata>},
    }
  ],
  childParentMapping: {
    <childIdx>: <parentIdx>
  }
}
```

`phrases` here represents all the *source* information we need to
process and produce an `fbt._(...)` callsite's final payload.  When
combined with corresponding translations to each `hashToLeaf` entry we
can produce the translated payloads `fbt._()` expects.

When it comes to moving from source text to translations, what is most
pertinent is the `hashToLeaf` payload containing all relevant texts
with their identifying hash.  You can provide a custom hash module to
`collectFbts` if you so choose.  It defaults to md5.

### A note on hashes

In the FBT framework, there are 2 main places we uses hashes for
identification: **text** and **fbt callsite**.  The `hashToLeaf` mapping
above represents the hash (using whichever algorithm was chosen in
`collectFbt`) of the **text** and its **description**.  This is used
when *building* the translated payloads.

The hash of the callsite (defaulting to `jenkins` hash) is used to
look up the payload in
[`FbtTranslations`](https://github.com/facebook/fbt/blob/main/runtime/nonfb/FbtTranslations.js).
This is basically the hash of the object you see in `jsfbt`.

See [Translating FBTs](translating) for getting your translations in
the right format.
