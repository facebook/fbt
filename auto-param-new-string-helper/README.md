
# How to Prepare Your Existing FBTs for Auto-Param

## Context
The new string collection script backed by `babel-plugin-fbt@1.0.0` might extract
new or updated source strings for your existing fbts. We provide a step-by-step
guide on how to identify these new source strings, but it is your responsibility
 to make sure these strings get translated before they go into production.

## Step 1: Extract current (or soon-to-be-legacy) strings
While you are still on an old `babel-plugin-fbt` release, run `yarn fbt-collect`
to collect legacy strings. For example, run the following to extract legacy strings
and save them to `.legacy_source_strings.json`.
```
yarn fbt-collect --fbt-common-path ./common_strings.json --pretty --manifest < .src_manifest.json > .legacy_source_strings.json
```
`.legacy_source_strings.json` should look something like this
```json
{
 "phrases": [
  {
   "hashToText": {
    "f9df2DVor1ccX0uzZbuDVQ==": "Your FBT Demo"
   },
   "filepath": "src/example/Example.react.js",
   "line_beg": 130,
   "col_beg": 12,
   "line_end": 130,
   "col_end": 49,
   "desc": "title",
   "project": "fbt-demo-project",
   "type": "text",
   "jsfbt": "Your FBT Demo"
  },
```

## Step 2: Upgrade to `babel-plugin-fbt@1.0.0`
Install `babel-plugin-fbt@1.0.0` and rebuild.

## Step 3: Extract new source strings
Run `yarn fbt-collect` again to extract source strings using the new `babel-plugin-fbt`.
```
yarn fbt-collect --fbt-common-path ./common_strings.json --pretty --manifest < .src_manifest.json > .new_source_strings.json
```
`.new_source_strings.json` should look like this
```json
{
 "phrases": [
  {
   "hashToLeaf": {
    "f9df2DVor1ccX0uzZbuDVQ==": {
     "text": "Your FBT Demo",
     "desc": "title"
    }
   },
   "filepath": "src/example/Example.react.js",
   "line_beg": 129,
   "col_beg": 12,
   "line_end": 129,
   "col_end": 49,
   "project": "fbt-demo-project",
   "jsfbt": {
    "t": {
     "desc": "title",
     "text": "Your FBT Demo"
    },
    "m": []
   }
  },
```

## Step 4: Find deltas between legacy and new source strings

Run `./categorize_new_strings.sh` script to compare new source strings with the
legacy ones. The script saves any updated or new source strings to `.new_strings_by_category.json`.
```
cd auto-param-new-string-helper
./categorize_new_strings.sh .legacy_source_strings.json .new_source_strings.json
```
We group updated source strings by their 'category'. The `categoryToCnt` in
`.new_strings_by_category.json` maps a category to the number of updated strings
in this category. The `newStringByCategory` maps a category to the actual strings
 that get updated. Each updated string is indexed by its **new** hash.

`.new_strings_by_category.json` should look like this:
```json
{
  "categoryToCnt": {
    "SAME_HASH_BUT_ADDITIONAL_IMPLICIT_VARIATIONS": 0,
    "UPDATED_TEXT_DUE_TO_VARIATIONS_IN_INNER_STRING": 1,
    "UPDATED_TEXT_DUE_TO_REPLACING_HIDDEN_TOKEN_WITH_VARIATIONS": 0,
    "UPDATED_TEXT_DUE_TO_HIDDEN_INNER_STRING_TOKEN_NAME": 0,
    "UPDATED_TEXT_DUE_TO_LEADING_OR_TRIALING_SPACE": 1,
    "UPDATED_TEXT_DUE_TO_FIXING_UNPRESERVED_WHITESPACES": 0,
    "UPDATED_TEXT_DUE_TO_OTHER_REASON": 0,
    "UPDATED_DESC_DUE_TO_SPACES_IN_FRONT_OF_INNER_STRINGS": 0,
    "UPDATED_DESC_DUE_TO_HIDDEN_FBT_PARAM_TOKEN_NAME": 0,
    "UPDATED_DESC_DUE_TO_VARIATIONS": 0,
    "UPDATED_DESC_DUE_TO_HIDDEN_TOKEN_AND_ADDED_VARIATIONS": 2,
    "UPDATED_DESC_DUE_TO_OTHER_REASON": 0
  },
  "newStringByCategory": {
    "SAME_HASH_BUT_ADDITIONAL_IMPLICIT_VARIATIONS": {},
    "UPDATED_TEXT_DUE_TO_VARIATIONS_IN_INNER_STRING": {
      "gVKMc/8jq5vnYR5v2bb32g==": {
        "legacyHash": "PqPPir8Kg9xSlqdednPFOg==",
        "text": "{name} has shared {=[number] photos} with you",
        "legacyText": "{name} has shared {=a photo} with you",
        "desc": "example 1",
        "legacyDesc": "example 1",
        "project": "fbt-demo-project",
        "filepath": "src/example/Example.react.js",
        "lineBeg": 220,
        "lineEnd": 234
      }
    },
    "UPDATED_TEXT_DUE_TO_REPLACING_HIDDEN_TOKEN_WITH_VARIATIONS": {},
    "UPDATED_TEXT_DUE_TO_HIDDEN_INNER_STRING_TOKEN_NAME": {},
    "UPDATED_TEXT_DUE_TO_LEADING_OR_TRIALING_SPACE": {
      "Q9mOAQ+ogHG20z2QkEkNmQ==": {
        "legacyHash": "8UZCD6gFUKN+U5UUo1I3/w==",
        "text": "a photo",
        "legacyText": " a photo",
        "desc": "In the phrase: \"{name} has shared {=a photo} with you\"",
        "legacyDesc": "In the phrase: \"{=} has shared {=a photo} with you\"",
        "project": "fbt-demo-project",
        "filepath": "src/example/Example.react.js",
        "lineBeg": 225,
        "lineEnd": 232
      }
    },
    "UPDATED_TEXT_DUE_TO_FIXING_UNPRESERVED_WHITESPACES": {},
    "UPDATED_TEXT_DUE_TO_OTHER_REASON": {},
    "UPDATED_DESC_DUE_TO_SPACES_IN_FRONT_OF_INNER_STRINGS": {},
    "UPDATED_DESC_DUE_TO_HIDDEN_FBT_PARAM_TOKEN_NAME": {},
    "UPDATED_DESC_DUE_TO_VARIATIONS": {},
    "UPDATED_DESC_DUE_TO_HIDDEN_TOKEN_AND_ADDED_VARIATIONS": {
      "tYYOLLMbffdJQQlSVEVv/A==": {
        "legacyHash": "/gj3gwqx1z8Xw233oZgOpQ==",
        "text": "{number} photos",
        "legacyText": "{number} photos",
        "desc": "In the phrase: \"{name} has shared {=[number] photos} with you\"",
        "legacyDesc": "In the phrase: \"{=} has shared {=a photo} with you\"",
        "project": "fbt-demo-project",
        "filepath": "src/example/Example.react.js",
        "lineBeg": 225,
        "lineEnd": 232
      },
      "+GIAo9dvEfv5V1574993kQ==": {
        "legacyHash": "mmqgrx7cIVUnJZnhEIjItw==",
        "text": "{=View}",
        "legacyText": "{=View}",
        "desc": "In the phrase: \"{name} has a page to share! {=View} their page.\"",
        "legacyDesc": "In the phrase: \"{=} has a to share!{=View}.\"",
        "project": "fbt-demo-project",
        "filepath": "src/example/Example.react.js",
        "lineBeg": 310,
        "lineEnd": 312
      },
    },
    "UPDATED_DESC_DUE_TO_OTHER_REASON": {}
  }
}
```

## Step 5: Translate updated/new strings as identified in `.new_strings_by_category.json`
You should prepare translations for every new/updated hash that appears in
`newStringByCategory`, but the actual implementation may vary depending on your workflow.
