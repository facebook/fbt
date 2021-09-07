---
id: params
title: Parameters and interpolation
sidebar_label: Parameters (interpolation)
---
Interpolation of dynamic text and other markup is accomplished in the FBT framework via `<fbt:param>` or `fbt.param`:

```
<fbt desc="param example">
  Hello,
  <fbt:param name="name">{person.getName()}</fbt:param>.
</fbt>
```

```js
fbt('Hello, ' + fbt.param('name', person.getName()), 'param example')
```

These both [extract](collection.md) to the same following text:

```
"Hello, {name}"
```

Tokens are delimited with the braces above and translations are expected to keep the same total token *count* and same token *names* for any given `fbt` callsite.

### Required attributes
* **name** `string`: Name of the token

### Optional attributes
* **gender** `IntlVariations.GENDER_*`:
  * Pass the gender of the parameter for correctly variated text.
* **number** `number|true`:
  * Passing a value of type `number` into the `number` option uses that
value as the input for which we determine the [CLDR plural
value](http://cldr.unicode.org/index/cldr-spec/plural-rules).
  * You can pass `true` to simply use the parameter value (the same value that replaces the token).

--------------------------------------------------------------------------------

## fbt.name
`<fbt:name>` is just a special form of `fbt:param` that `requires` that you pass in the gender for the interpolated variable.
```
<fbt desc="param example">
  Hello,
  <fbt:name name="name" gender={person.getGender()}>{person.getName()}</fbt:name>.
</fbt>
```

Here, gender must be one of the 3 supported gender values in `IntlVariations`:

```
IntlVariations = {
  ...,
  GENDER_MALE: 1,
  GENDER_FEMALE: 2,
  GENDER_UNKNOWN: 3
}
```
--------------------------------------------------------------------------------
### Duplicate tokens
Tokens with the same name, but different values are prohibited in FBT.
If you want the same interpolation to show up, you must use
`fbt:same-param` or `fbt.sameParam`.  This construct only takes a name
and no value, as the value to the first instance is re-used for the
second token.

```
<fbt desc="param example">
  <fbt:name name="name" gender={gender}>
    {<a href="#">{name}</a>}
  </fbt:name>
  shared a link.  Tell
  <fbt:same-param name="name" />
  you liked it.
</fbt>

fbt(
  fbt.name(
    'name',
     <a href="#">{name}</a>,
     gender
   ) +
  ' shared a link.  Tell ' + fbt.sameParam('name') + ' you liked it.',
  'param example'
)
```
