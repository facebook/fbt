---
id: translating
title: Translating
sidebar_label: Translating FBTs
---

The [`translate`](https://github.com/facebook/fbt/blob/main/packages/babel-plugin-fbt/src/bin/translate.js) script expects a JSON payload coming in from `STDIN`
that has FBT `phrases` (just like those collected from `collectFbt`)
alongside the relevant translations for a given locale.

In addition to the below example, the `translation_input.json`
provided in our [GitHub demo
app](https://github.com/facebook/fbt/blob/main/demo-app/translation_input.json)
is a good reference on the "schema" used for the translations.

```json
{
  "phrases": [
    "hashToLeaf": {
      <text_hash>: {
        "text": <text>,
        "desc": <description>,
      },
      ...
    },
    "jsfbt": string | {t: <table>, m: <metadata>}
  ],
  ...
  "translationGroups": [{
    "fb-locale": "xx_XX",
    "translations": {
      <translation_hash>: {
        "tokens": [<token1>, ..., <tokenN>],
        "types": [<variationType1>, ..., <variationTypeN>]
        "translations": [{
            "translation": <translation1>,
            "variations": [variationValue1,...,variationValueN]
          },
          ...,
        ]
      }
    }
  }]
}
```

The `<text_hash>` and `<translation_hash>` correspond in the above example.
That is `translations[<hash>]` is the translation entry for
`phrases.hashToLeaf[<hash>]`.

Here `tokens`, `types` and `variations` are all associative arrays.  That is, in
the above example, `types[i]` represents the variation type (or mask) of
`tokens[i]` and `variations[i]` is the variation value of `token[i]` for the
given translation entry.

## Variation types
Variation types can be one of
```
IntlVariations.BITMASK_NUMBER: 28
IntlVariations.BITMASK_GENDER:  3
```

This signifies what the given token can variate on.  Token types of type `GENDER` can be:
```
IntlVariations.GENDER_MALE:   1
IntlVariations.GENDER_FEMALE  2
IntlVariations.GENDER_UNKNOWN 3
```

while token types of `NUMBER` can be:
```
IntlVariations.NUMBER_ONE:    4
IntlVariations.NUMBER_TWO:    8
IntlVariations.NUMBER_MANY:  12
IntlVariations.NUMBER_ZERO:  16
IntlVariations.NUMBER_FEW:   20
IntlVariations.NUMBER_OTHER: 24
```
