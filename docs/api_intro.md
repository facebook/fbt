---
id: api_intro
title: The FBT API
sidebar_label: Introduction
---
The fbt framework has two (mostly) equivalent APIs: A JSX-style `<fbt>` tag API and a "vanilla" or "functional" `fbt(...)` API that more closely resembles standard JavaScript.  In general, you can compose your translatable text in either format.  As the following example illustrates, the child of the `<fbt>` tag shows up as the first argument to `fbt` and any attributes show up in the optional third argument parameter.  The `desc` (text description) argument is the exception to this rule because it is a *required* parameter and attribute in `fbt(...)` and `<fbt>` respectively.

Let's start with a simple example:

## JSX `<fbt />` API
```
<fbt project="foo" desc="a simple example">
  Hello, World!
</fbt>
```
### Required attributes
* `desc`: description of text to be translated

### Optional attributes
* **author** `string`: Text author
* **project** `string`: Project to which the text belongs
* **preserveWhitespace** `bool`: (Default: `false`)
FBT normally consolidates whitespace down to one space (`' '`).
Turn this off by setting this to `true`
* **subject** `IntlVariations.GENDER_*`: Pass an [implicit subject](implicit_params) gender to a partially formed text
* **common** `bool`: Use a "common" string repository
* **doNotExtract** `bool`: Informs [collection](collection) to skip this string (useful for tests/mocks)

--------------------------------------------------------------------------------

## "Vanilla" `fbt(...)` API

```js
fbt('Hello, World', 'a simple example', {project:"foo"})
```

#### Required arguments
1. Text to translate
2. Description of text to be translated

#### Optional parameters
3. Options object - same optional arguments as the `<fbt>` [attributes above](api_intro#optional-attributes)

--------------------------------------------------------------------------------
## Docblock defaults
Defaults for the above optional attributes may be provided in the
docblock with the `@fbt` pragma.  It uses a straight `JSON.parse` to
interpret this, so you'll have to make sure your object is parseable. (i.e. keys should be wrapped in `"double quotes"`)

E.g.
```
/**
 * @fbt {"author": "me", "project": "awesome sauce"}
 */
```

----

## Can I enforce `fbt` strings to be rendered only as plain-text?

Yes, please use the [`fbs` API as per this documentation.](enforcing_plain_text)

----

## Custom Fbt API attributes

The Fbt library supports the ability to define custom attributes/options that enable developers to customize how to render fbt result strings on the client-side.

**NOTE: these options do not have any effect on how we extract fbt strings.**

To configure this, you'll need to define the extra options to the `babel-plugin-fbt` Babel plugin as part of your general Babel config.
*(See also [Babel plugin config](https://babeljs.io/docs/en/plugins/#plugin-options))*

**Example of Babel plugin config**
```js
"plugins": [
  ["babel-plugin-fbt", {
    "extraOptions": {
      "aStringOption": true,
      "aStringEnumOption": {
        "yes": true,
        "no": true,
      },
    },
  }],
]
```

Then, you can use these new options in your JS code as follow:

```
<fbt desc="..."
  aStringOption="any text"
  aStringEnumOption="yes">
  ...
</fbt>;

fbt('...', '...', {
  aStringOption: 'any text',
  aStringEnumOption: 'yes'
});
```

Eventually, on the client-side, these option values will be exposed to the `getFbtResult` hook.
[See this unit test for example.](https://github.com/facebook/fbt/blob/cfa45341068b31b0fec11d919717789d86aa1112/runtime/shared/__tests__/fbt-test.js#L345-L353)
