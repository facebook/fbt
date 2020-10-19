---
id: pronouns
title: Pronouns
sidebar_label: Pronouns
---

`fbt:pronoun` and `fbt.pronoun` both take a required `PRONOUN_USAGE` enum and a [`GenderConst`](https://github.com/facebook/fbt/blob/master/runtime/nonfb/GenderConst.js) enum:
```
const PRONOUN_USAGE = {
  OBJECT: 0,
  POSSESSIVE: 1,
  REFLEXIVE: 2,
  SUBJECT: 3,
}

const GenderConst = {
  NOT_A_PERSON: 0
  UNKNOWN_SINGULAR: 1
  UNKNOWN_PLURAL: 2
  FEMALE: 3
  MALE: 4
}
```

**<span style={{ color: "red" }}>NOTE: This is not the same gender as used in `fbt:param`, `fbt:name`, or `subject`!</span>**<br/>
The `IntlVariations` used in those cases only has `GENDER_MALE`, `GENDER_FEMALE`, and `GENDER_UNKNOWN`.


## Pronoun example:

```
<fbt desc="pronoun example">
  <fbt:param name="name">{ent.getName()}</fbt:param>
  shared
  <fbt:pronoun type="possessive" gender={ent.getPronounGender()} />
  photo with you.
</fbt>
```

### Optional attributes
* **capitalize** `bool`: Whether to capitalize the pronoun in the source string.
* **human** `bool`: Whether to elide the NOT_A_PERSON option in the text variations generated.

The example above generates:
```
{
  "hashToText": {
    "I/p+TWpGhrtv9gnABybPMw==": "{name} shared her photo with you.",
    "3Yb/zNhF8nZ8aR+NSPaeJQ==": "{name} shared his photo with you.",
    "JYTtgHGMpBOM2Vrc9JLeUw==": "{name} shared their photo with you."
  },
  ...,
  "type": "table",
  "desc": "pronoun example",
  "jsfbt": {
    "t": {
      "1": "{name} shared her photo with you.",
      "2": "{name} shared his photo with you.",
      "*": "{name} shared their photo with you."
    },
    "m": [
      null
    ]
  }
}
```

## Combinations
Conceptually, pronouns work as though there was an `enum` supplied for the given `type`.
Below is the table of possible values for their various types.
*Note how `reflexive` and `object` have 4 types*

    subject:    he/she/they
    possessive: his/her/their
    reflexive:  himself/herself/themselves/themself
    object:     him/her/them/this

     V Name                  Subject Possessive Reflexive  Object
    =============================================================
     0 NOT_A_PERSON          they    their      themself   this
     1 UNKNOWN_SINGULAR      they    their      themself   them
     2 UNKNOWN_PLURAL        they    their      themselves them
     3 FEMALE                she     her        herself    her
     4 MALE                  he      his        himself    him
