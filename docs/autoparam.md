---
id: autoparam
title: Auto-parameterization
sidebar_label: Auto-parameterization
---

# What is Auto Parameterization?

## The basics

`<fbt>` will automatically wrap any non-fbt children in the top-level
`<fbt>` as though they were written with an `<fbt:param>` with a
`name` attribute containing the child's text.  It will pull any child
text into the parameter name, including those of recursive structures.


- JSX fbt syntax:

```js
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

```js
{
  phrases: [
    {
      hashToLeaf: {
        someHash1: {
          text: 'Go on an {=awesome vacation}',
          desc: 'auto-wrap example',
        },
      },
      // ...
    },
    {
      hashToLeaf: {
        someHash2: {
          text: '{=awesome} vacation',
          desc: 'In the phrase: "Go on an {=awesome vacation}"',
        },
      },
      // ...
    },
    {
      hashToLeaf: {
        someHash3: {
          text: 'awesome',
          desc: 'In the phrase: "Go on an {=awesome} vacation"',
        },
      },
      // ...
    },
  ],
  childParentMappings: {
    '1': 0,
    '2': 1,
  },
}
```

Notice the description for "vacation" is auto-generated with an `"In
the phrase: ..."` prefix.  Additionally, we use a convention of adding an equal sign (`=`)
prefix in the interpolation `{=awesome vacation}` to signal to the
translator that this exact word or phrase goes in the associated outer
sentence.

Furthermore, we provide a mapping `{<childIndex>: <parentIndex>}` in
the collection output `childParentMappings`.  At Meta, we use
these to display all relevant inner and outer strings when translating
any given piece of text.  We recommend you do the same in whatever
translation framework you use.  Context is crucial for accurate
translations.

## Advanced scenario: string with nested fbt constructs

You can still use fbt constructs that produce multiple strings (e.g. `<fbt:pronoun>`) and expect the Auto Parameterization to work.

**Example with fbt:pronoun and fbt:plural**
```js
<fbt desc="advanced rich content example">
  <b>
    {/* Group 1 */}
    <fbt:pronoun
      capitalize="true"
      gender={personGender}
      human={true}
      type="subject"
    />
  </b>
  {/* Group 2 */}
  uploaded
  <Link href="#">
    {/* Group 3 */}
    <fbt:plural count={aCount} many="photos" showCount="ifMany">
      one photo
    </fbt:plural>
  </Link>
  {/* Group 4 */}
  that you haven't seen yet.
</fbt>
```

### Top-level strings

Top-level strings are build from the combination of all text sub-groups:

```
`She`  -------------\              /----- `{=one photo}` -----\
`He`   --------------* `uploaded` *                            * `that you haven't seen yet`
`They` -------------/              \-- `{=[number] photos}` --/

^^^^^^^                 ^^^^^^^^        ^^^^^^^^^^^^^^^^^^        ^^^^^^^^^^^^^^^^^^^^^^^^^
Group 1                 Group 2         Group 3                   Group 4
(Gender variation)                      (Nb variation)
```

**Extracted top-level strings by string variation criteria:**

1. Female:
    1. Single: `"{=She} uploaded {=one photo} that you haven't seen yet."`
    1. Plural: `"{=She} uploaded {=[number] photos} that you haven't seen yet."`
1. Male:
    1. Single: `"{=He} uploaded {=one photo} that you haven't seen yet."`
    1. Plural: `"{=He} uploaded {=[number] photos} that you haven't seen yet."`
1. Unknown:
    1. Single: `"{=They} uploaded {=one photo} that you haven't seen yet."`
    1. Plural: `"{=They} uploaded {=[number] photos} that you haven't seen yet."`

*NOTE: all these strings have the same description: `"advanced rich content example"`*

### Combinations of nested strings

Texts and descriptions of nested strings will have the relevant gender/number variations as well:

```
----------------------------------------------------------------------------------------------------------------------
| Text of   | Text of          | Description                                                                         |
| group 1   | group 3          |                                                                                     |
| (Gender)  | (Number)         |                                                                                     |
----------------------------------------------------------------------------------------------------------------------
| She       | {number} photos  | 'In the phrase: "{=She} uploaded {=[number] photos} that you haven\'t seen yet."'   |
| She       | one photo        | 'In the phrase: "{=She} uploaded {=one photo} that you haven\'t seen yet."'         |
| He        | {number} photos  | 'In the phrase: "{=He} uploaded {=[number] photos} that you haven\'t seen yet."'    |
| He        | one photo        | 'In the phrase: "{=He} uploaded {=one photo} that you haven\'t seen yet."'          |
| They      | {number} photos  | 'In the phrase: "{=They} uploaded {=[number] photos} that you haven\'t seen yet."'  |
| They      | one photo        | 'In the phrase: "{=They} uploaded {=one photo} that you haven\'t seen yet."'        |
----------------------------------------------------------------------------------------------------------------------
```

### Child-to-parent phrase mapping:

It's generally useful to submit translation requests containing strings that are closely related.
It helps improve translation consistency (tone, vocabulary, etc...) since the same translator
can work on the same bundle of strings all at once.

To support this use case, as part of the `fbt-collect` output, we expose the relationship between each parent/child string
in the `childParentMappings` property.

For each mapping entry:
- the key represents the index of the child phrase
- the value represents the index of the parent phrase

```js
{
  phrases: [
    phrase_0,
    phrase_1,
    phrase_2,
  ],
  childParentMappings: {
    '1': 0, // i.e. The phrase at index 1 has a parent phrase at index 0
    '2': 0,
  },
}
```

----

### `fbt-collect` output example

```js
{
  phrases: [
    {
      hashToLeaf: {
        c0500c5ca7453ce944fc2898b8447d07: {
          text: "{=She} uploaded {=[number] photos} that you haven't seen yet.",
          desc: 'example',
        },
        '75182beb24ce6e55c815220463a0ea53': {
          text: "{=She} uploaded {=one photo} that you haven't seen yet.",
          desc: 'example',
        },
        '69cb3cf4329c2a81916c103240f3f2d7': {
          text: "{=He} uploaded {=[number] photos} that you haven't seen yet.",
          desc: 'example',
        },
        '6f21123be92e0990409ec7727d2160ca': {
          text: "{=He} uploaded {=one photo} that you haven't seen yet.",
          desc: 'example',
        },
        f5ba797963f0f3e3bb7a4301d3772896: {
          text: "{=They} uploaded {=[number] photos} that you haven't seen yet.",
          desc: 'example',
        },
        '0fdccf9a11f8f074ecb7234bc358526a': {
          text: "{=They} uploaded {=one photo} that you haven't seen yet.",
          desc: 'example',
        },
      },
      // ...
    },
    {
      hashToLeaf: {
        '7b9ae98d32f354286dcae669cda85b66': {
          text: 'She',
          desc: 'In the phrase: "{=She} uploaded {=[number] photos} that you haven\'t seen yet."',
        },
        '710a73b38cff69aa3ffb03be0c26f0bc': {
          text: 'She',
          desc: 'In the phrase: "{=She} uploaded {=one photo} that you haven\'t seen yet."',
        },
        '8b33671a42a9e3209be4be7eb51b64ff': {
          text: 'He',
          desc: 'In the phrase: "{=He} uploaded {=[number] photos} that you haven\'t seen yet."',
        },
        b600bff03f3c3f0f93d254bcedeac1b8: {
          text: 'He',
          desc: 'In the phrase: "{=He} uploaded {=one photo} that you haven\'t seen yet."',
        },
        '94cbb79c52191ae0c66b6d4157f89e96': {
          text: 'They',
          desc: 'In the phrase: "{=They} uploaded {=[number] photos} that you haven\'t seen yet."',
        },
        '56f9198bf4e7da93e8347ce5a91d6999': {
          text: 'They',
          desc: 'In the phrase: "{=They} uploaded {=one photo} that you haven\'t seen yet."',
        },
      },
      // ...
    },
    {
      hashToLeaf: {
        f22d4fc3955f3e2119c6a5ee1a4d150a: {
          text: '{number} photos',
          desc: 'In the phrase: "{=She} uploaded {=[number] photos} that you haven\'t seen yet."',
        },
        a2dd015d8793b79910c6f07bed6e09cd: {
          text: 'one photo',
          desc: 'In the phrase: "{=She} uploaded {=one photo} that you haven\'t seen yet."',
        },
        ac67b87192e6ef2b426a069cc144c649: {
          text: '{number} photos',
          desc: 'In the phrase: "{=He} uploaded {=[number] photos} that you haven\'t seen yet."',
        },
        '2520980606f16a59cfef807692e1c5cc': {
          text: 'one photo',
          desc: 'In the phrase: "{=He} uploaded {=one photo} that you haven\'t seen yet."',
        },
        '525916bfc808cb252662573904dd75d8': {
          text: '{number} photos',
          desc: 'In the phrase: "{=They} uploaded {=[number] photos} that you haven\'t seen yet."',
        },
        '60bd72c39c28a59bee896c4f6bfa8ea9': {
          text: 'one photo',
          desc: 'In the phrase: "{=They} uploaded {=one photo} that you haven\'t seen yet."',
        },
      },
      // ...
    },
  ],
  childParentMappings: {
    '1': 0,
    '2': 0,
  },
}
```
