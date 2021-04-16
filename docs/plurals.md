---
id: plurals
title: Plurals
sidebar_label: Plurals
---

`fbt:plural` provides you with a shorthand way for plural variations.
```
<fbt desc="plural example">
  You have
  <fbt:plural
    count={getLikeCount()}
    name="number of likes"
    showCount="ifMany"
    many="likes">
     a like
  </fbt:plural>
  on your
  <fbt:plural
    count={getPhotoCount()}
    showCount="no">
     photo
  </fbt:plural>.
</fbt>
```
OR
```js
fbt(
  'You have ' +
    fbt.plural('a like', getLikeCount(), {
      name: 'number of likes',
      showCount: 'ifMany',
      many: 'likes',
    }) +
    ' on your ' +
    fbt.plural('photo', getPhotoCount()),
  'plural example',
);
```

Both the above examples generate the following during [collection](collection).
```js
"phrases": [
  {
    "hashToLeaf": {
      "bae7d2f1abd57d08a9dca0b5d05edee8": {
        "text": "You have {number of likes} likes on your photos",
        "desc": "plural example",
      },
      "3306b396e08398f28d921b46039f008c": {
        "text": "You have {number of likes} likes on your photo",
        "desc": "plural example",
      },
      "c9e4b5b48f38634ffecaf34956a4b186": {
        "text": "You have a like on your photos",
        "desc": "plural example",
      },
      "cb49d6d764ea8aabdca0e9db7f10ba34": {
        "text": "You have a like on your photo"
        "desc": "plural example",
      },
    },
    "type": "table",
    ...
  }
]
```
#### Required arguments:
* **singular phrase** `string`: JSX child in `<fbt:plural>` and argument 1 in `fbt.plural`
* **count** `number`: `count` in `<fbt:plural>` and argument 2 in `fbt.plural`

#### Optional arguments:
* **many** `string`: Represents the plural form of the string in English.  Default is `{singular} + 's'`
* **showCount** `"yes"|"no"|"ifMany"`: Whether to show the `{number}` in the string.
*Note that the singular phrase never has a token, but inlines to `1`. This is to account for languages like Hebrew for which showing the actual number isn't appropriate*

  * **"no"**: (*DEFAULT*) Don't show the count
  * **"ifMany"**: Show the count only in plural case
  * **"yes"**: Show the count in all cases
* **name** `string`: Name of the token where count shows up. (*Default*: `"number"`)
* **value** `mixed`: For overriding the displayed `number`
