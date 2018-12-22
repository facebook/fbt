---
id: enums
title: Enumerations
sidebar_label: Enumerations
---

Enumerations eliminate a lot of UI code duplication while enabling accurate translations.  `<fbt:enum>` and `fbt.enum` both provide the ability to add your ad-hoc or pre-defined and shared enumerations.

## Adhoc enums
Adhoc enums can be provided inline to the `enum-range` attribute or as the second parameter to `fbt.enum`
### Enum map
```
<fbt desc="buy prompt">
  Buy a new
  <fbt:enum enum-range={{
    CAR: 'car',
    HOUSE: 'house',
    BOAT: 'boat',
    HOUSEBOAT: 'houseboat',
  }} value={enumVal} />!
</fbt>

fbt(
  'Buy a new ' +
    fbt.enum(enumVal, {
      CAR: 'car',
      HOUSE: 'house',
      BOAT: 'boat',
      HOUSEBOAT: 'houseboat',
    }),
  'buy prompt',
);
```

### Shorthand array (keys = values)
The shorthand array adhoc enum functions as though you had a `{value: value}` map
```
<fbt desc="buy prompt">
  Buy a new
  <fbt:enum enum-range={[
    'car', 'house', 'boat', 'houseboat']
  } value={enumVal} />!
</fbt>

fbt(
  'Buy a new' + fbt.enum(enumVal, ['car', 'house', 'boat', 'houseboat']),
  'buy prompt',
);
```

All the above examples [extract](collection.md) the same 4 separate strings for translation in JSON like:

```js
{
  "phrases": [
    {
      "hashToText": {
        "tGN0j5ePJCeH9fIlp3Yq6w==": "Buy a new car!",
        "ElXst6oKNLh1XU8GjJucQQ==": "Buy a new house!",
        "fAHV109uPI7aCxZqNmuTfg==": "Buy a new boat!",
        "end24pKDi2/oxKff1YEXzQ==": "Buy a new houseboat!"
      },
      ...,
      "desc": "buy prompt",
      ...
    },
```
--------------------------------------------------------------------------------

## Shared enums

If you need to use same enum multiple times, you can use a pre-defined
enum. These enums need to be able to be `"JSON.stringifiable"` and
should have simple key/value structures. They also require a separate
build step to generate an enum-manifest and source manifest that makes
them available to the `babel-plugin-fbt` at "build-time".

```js
// Example$FbtEnum.js
const Example$FbtEnum = {
  LINK: "link",
  PAGE: "page",
  PHOTO: "photo",
  POST: "post",
  VIDEO: "video",
};

// Demo.react.js
const ExampleEnum = require('ExampleEnum');
<fbt desc="Example enum">
  <fbt:param name="name">this.state.ex2Name</fbt:param>
  has a
  <fbt:enum
    enum-range={ExampleEnum}
    value={this.state.exampleObject}
  />
  to share!
</fbt>
```
