---
id: pronouns
title: Pronouns
sidebar_label: Pronouns
---

`fbt:pronoun` and `fbt.pronoun` both take a required `PRONOUN_USAGE` enum and a [`GenderConst`](https://github.com/facebook/fbt/blob/main/runtime/nonfb/GenderConst.js) enum:
```
const PRONOUN_USAGE = {
  OBJECT: 0,
  POSSESSIVE: 1,
  REFLEXIVE: 2,
  SUBJECT: 3,
}

const GenderConst = {
  NOT_A_PERSON: 0
  FEMALE_SINGULAR: 1
  MALE_SINGULAR: 2
  FEMALE_SINGULAR_GUESS: 3
  MALE_SINGULAR_GUESS: 4
  MIXED_UNKNOWN: 5
  NEUTER_SINGULAR: 6
  UNKNOWN_SINGULAR: 7
  FEMALE_PLURAL: 8
  MALE_PLURAL: 9
  NEUTER_PLURAL: 10
  UNKNOWN_PLURAL: 11
}
```

**<span style={{ color: "red" }}>NOTE: This is not the same gender as used in `fbt:param`, `fbt:name`, or `subject`!</span>**<br/>
The `IntlVariations` used in those cases only has `GENDER_MALE`, `GENDER_FEMALE`, and `GENDER_UNKNOWN`.


## Pronoun example:

```
<fbt desc="pronoun example">
  <fbt:param name="name">{ent.getName()}</fbt:param>
  shared
  <fbt:pronoun type="possessive" gender={ent.getPronounGender()} human={true} />
  photo with you.
</fbt>
```

### Optional attributes
* **capitalize** `bool`: Whether to capitalize the pronoun in the source string.
* **human** `bool`: Whether to elide the NOT_A_PERSON option in the text variations generated.

The example above generates:
```
{
  "hashToLeaf": {
    "I/p+TWpGhrtv9gnABybPMw==": {
      "text": "{name} shared her photo with you.",
      "desc": "pronoun example",
    },
    "3Yb/zNhF8nZ8aR+NSPaeJQ==": {
      "text": "{name} shared his photo with you.",
      "desc": "pronoun example",
    },
    "JYTtgHGMpBOM2Vrc9JLeUw==": {
      "text": "{name} shared their photo with you."
      "desc": "pronoun example",
    },
  },
  ...,
  "type": "table",
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
     1 FEMALE_SINGULAR       she     her        herself    her
     2 MALE_SINGULAR         he      his        himself    him
     3 FEMALE_SINGULAR_GUESS she     her        herself    her
     4 MALE_SINGULAR_GUESS   he      his        himself    him
     5 MIXED_UNKNOWN         they    their      themselves them
     6 NEUTER_SINGULAR       they    their      themself   them
     7 UNKNOWN_SINGULAR      they    their      themself   them
     8 FEMALE_PLURAL         they    their      themselves them
     9 MALE_PLURAL           they    their      themselves them
    10 NEUTER_PLURAL         they    their      themselves them
    11 UNKNOWN_PLURAL        they    their      themselves them
