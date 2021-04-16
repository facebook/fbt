---
id: autoparam
title: Auto-parameterization
sidebar_label: Auto-parameterization
---

`<fbt>` will automatically wrap any non-fbt children in the top-level
`<fbt>` as though they were written with an `<fbt:param>` with a
`name` attribute containing the child's text.  It will pull any child
text into the parameter name, including those of recursive structures.

- JSX fbt syntax:

```xml
<fbt desc="auto-wrap example">
  Go on an
  <a href="#">
    <span>awesome</span> vacation
  </a>
</fbt>
```

- Function syntax:

```js
fbt(
  [
    'Go on an',
    <a href="#">
      <span>awesome</span> vacation
    </a>,
  ],
  'auto-wrap example',
);
```

When extracted for translation, the result is:

```
{
 "phrases": [
  {
   "hashToLeaf": {
    "V2xk3OfcDrMIA7HC/rIXIg==": {
     "text": "Go on an {=awesome vacation}",
     "desc": "auto-wrap example"
    }
   },
   // ...
  },
  {
   "hashToLeaf": {
    "feX2lgKwwomWUYP5/78klg==": {
     "text": "{=awesome} vacation",
     "desc": "In the phrase: \"Go on an {=awesome vacation}\""
    }
   },
   // ...
  },
  {
   "hashToLeaf": {
    "a7sBUhipyZur9yE8H6dk2A==": {
     "text": "awesome",
     "desc": "In the phrase: \"Go on an {=awesome} vacation\""
    }
   },
   // ...
  }
 ],
 "childParentMappings": {
  "1": 0,
  "2": 1
 }
}

```

Notice the description for "vacation" is auto-generated with an `"In
the phrase: ..."` prefix.  Additionally, we use a convention of an `=`
prefix in the interpolation `{=awesome vacation}` to signal to the
translator that this exact word or phrase goes in the associated outer
sentence.

Furthermore, we provide a mapping `{<childIndex>: <parentIndex>}` in
the collection output `childParentMappings`.  At Facebook, we use
these to display all relevant inner and outer strings when translating
any given piece of text.  We recommend you do the same in whatever
translation framework you use.  Context is crucial for accurate
translations.
