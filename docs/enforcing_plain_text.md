---
id: enforcing_plain_text
title: Enforcing plain-text strings with the fbs API
sidebar_label: Enforcing plain-text strings
---

## TL;DR

* `fbs` is a specialized version of the `fbt` JS API to represent **only** translatable plain-text strings
   * It’s a subset of `fbt` since the latter can also represent rich text contents (like a mix of text and React components)
* Use `fbs` whenever you want to force the translated result to be a plain string.
   * This is typically useful for HTML attributes whose value can only be plain text strings (e.g. [ARIA description](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-description))
* The translation process of `fbs` is the [same as with regular JS fbt strings](https://www.internalfb.com/intern/wiki/Getting-started-with-i--n/clientside-in/#how-do-i-make-sure-my-st)

## What is it?

* `fbs` represents a translatable plain-text string
   * It’s a subset of fbt which can also represent rich text contents (i.e. a mix of text and React components)
* `fbs` means something like "FB string", it’s not a true acronym. 😅

## Why using it?

* Enforce plain text only translatable strings, which is useful for:
   * Writing localizable HTML attributes like `title`, `label`, `placeholder`, etc...
      * Why again? Because those HTML attributes only expect a string value; no HTML!
         * **Note that if you’re using `<fbt>` with embedded arbitrary HTML/React components, we’re dropping the inner texts so chances are that the final localized text is *incomplete! (See [onStringSerializationError hook](https://github.com/facebook/fbt/blob/09ad3546a2f02c53af4c031113989564872eba34/flow-types/libdef/fbt.js#L109-L131) for more info)***
   * React components or any JS code where you need to enforce those same constraints

## How to use it?

* Use the `fbs()` functional API *(recommended)*
   * You can still use the `<fbs>` JSX API but it’s *less type-safe* because the Flow engine cannot verify statically that the values of `<fbs:param>` are string-friendly.
* All existing fbt constructs are supported. Just write `fbs` instead of `fbt`.
   * E.g. `<fbt:param>` and `<fbs:param>` work the same way.
   * See [examples in unit tests file](https://github.com/facebook/fbt/blob/09ad3546a2f02c53af4c031113989564872eba34/runtime/shared/__tests__/fbs-test.js)
   * **🚨 IMPORTANT: if you pass a non-stringish value to `<fbs:param>`, we'll end up throwing a JS exception on the client-side.**
* How to submit translation requests for it?
   * Please follow the same process as for the regular `fbt` strings

### Examples in React

```jsx
<>
  <fbs desc="some desc">Hello world!</fbs>
  <fbs desc="some desc">
    Hello{' '}
    <fbt:name name="name" gender={someGender}>
      {name}
    </fbt:name>
  </fbs>

  {fbs('Hello world!', 'description')} // you can use the functional style too
</>
```
### Examples in regular JS

```js
let myPlainTranslatedText = fbs('Hello world!', 'description');

myPlainTranslatedText = fbs(
  [
    'I have ',
    fbs.plural('a dream', count, {
      many: 'dreams',
      showCount: 'yes',
    }),
    '.',
  ],
  'desc',
);
// singular text = "I have a dream."
// plural text = "I have {number} dreams."

// make sure to call .toString() as close to the UI recipient as possible
document.title = myPlainTranslatedText.toString();
```
### What do `fbs` result values return in JS?

* Upon invoking `fbs()` or `<fbs>`, you'll receive an `Fbs` value.
   * More accurately, it's an instance of `FbtPureStringResult`
* `fbs` values can be used in lieu of `fbt` values
   * `const someFbt: Fbt = fbs(...) // is Flow valid`
* `fbt` values CANNOT be used in lieu of `fbs` values (as expected)
   * `const plainText: Fbs = fbt(...) // is Flow invalid`

### What Flow type to use for my React props?

Use the [`Fbs`](https://github.com/facebook/fbt/blob/09ad3546a2f02c53af4c031113989564872eba34/flow-types/libdef/fbt.js#L63-L69) flow type.

*Example:*

```js
type Props = {
  title: Fbs,
};
```
