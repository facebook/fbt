---
id: autoparam
title: Auto-parameterization
sidebar_label: Auto-parameterization
---

`<fbt>` will automatically wrap any non-fbt children in the top-level
`<fbt>` as though they were written with an `<fbt:param>` with a
`name` attribute containing the child's text.  It will pull any child
text into the parameter name, including those of recursive structures.   
<span style="color:red"> **Note this is inherently not available to
the `fbt(...)` API** </span>


```xml
<fbt desc="auto-wrap example">
  Go on an
  <a href="#">
    <span>awesome</span> vacation
  </a>
</fbt>
```

When extracted for translation, the result is

```
{
  "phrases": [
    {
      "hashToText": {
        "6b034a8291e7e7a8241fe7b914106066": "Go on an {=awesome vacation}"
      },
      "desc": "auto-wrap example",
      ...,
    },
    {
      "hashToText": {
        "e9b2d1a9d1ae7961c40dfac907d50d64": "{=awesome} vacation"
      },
      "desc": "In the phrase: \"Go on an {=awesome vacation}\"",
      ...,
    },
    {
      "hashToText": {
        "63a89a77a42a9681b88086dc938ec5e3": "awesome"
      },
      "desc": "In the phrase: \"Go on an {=awesome} vacation\"",
      ...,
    }
  ],
  "childParentMappings": {
    "1": 0,
    "2": 1
  }
}
```

Notice the description for "vacation" is auto-generated with an `"In
the phrase: ..."` prefix.  Additionally we use a convention of an `=`
prefix in the interpolation `{=awesome vacation}` to signal to the
translator that this exact word or phrase goes in the associated outer
sentence.

Furthermore, we provide a mapping `{<childIndex>: <parentIndex>}` in
the collection output `childParentMappings`.  At Facebook, we use
these to display all relevant inner and outer strings when translating
any given piece of text.  We recommend you do the same in whatever
translation framework you use.  Context is crucial for accurate
translations.
