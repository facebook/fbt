---
id: enums
title: Enumerations
sidebar_label: Enumerations
---

Enumerations eliminate a lot of UI code duplication while enabling accurate translations.  `<fbt:enum>` and `fbt.enum` both provide the ability to add your ad-hoc or pre-defined and shared enumerations.

## Adhoc enums
Adhoc enums can be provided inline to the `enum-range` attribute or as the second parameter to `fbt.enum`.
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
The shorthand array adhoc enum functions as though you had a `{value: value}` map.
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
      "hashToLeaf": {
        "tGN0j5ePJCeH9fIlp3Yq6w==": {
          "text": "Buy a new car!",
          "desc": "buy prompt",
        },
        "ElXst6oKNLh1XU8GjJucQQ==": {
          "text": "Buy a new house!",
          "desc": "buy prompt",
        },
        "fAHV109uPI7aCxZqNmuTfg==": {
          "text": "Buy a new boat!",
          "desc": "buy prompt",
        },
        "end24pKDi2/oxKff1YEXzQ==": {
          "text": "Buy a new houseboat!"
          "desc": "buy prompt",
        },
      },
      ...
    },
```
--------------------------------------------------------------------------------

## Shared enums

If you need to use the same enum multiple times, you can use a pre-defined
enum. These enum module names need to end with `$FbtEnum`, must be able to be `"JSON.stringifiable"` and
should have simple key/value structures.

They also require a separate build step to generate an enum-manifest and source manifest that makes
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
module.exports = Example$FbtEnum;

// Demo.react.js
const Example$FbtEnum = require('Example$FbtEnum');
<fbt desc="Example enum">
  <fbt:param name="name">{this.state.ex2Name}</fbt:param>
  has a
  <fbt:enum
    enum-range={Example$FbtEnum}
    value={this.state.exampleObject}
  />
  to share!
</fbt>
```
### ES6 Import/export syntax

ES6 import/export syntax is supported but the Enum must be exported as a
`default` export.

```js
// Example$FbtEnum.js
const Example$FbtEnum = {
  LINK: "link",
  PAGE: "page",
  PHOTO: "photo",
  POST: "post",
  VIDEO: "video",
};
export default Example$FbtEnum;

// Demo.react.js
import Example$FbtEnum from 'Example$FbtEnum';
<fbt desc="Example enum">
  <fbt:param name="name">{this.state.ex2Name}</fbt:param>
  has a
  <fbt:enum
    enum-range={Example$FbtEnum}
    value={this.state.exampleObject}
  />
  to share!
</fbt>
```
