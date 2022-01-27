#!/bin/bash
#######################
# Script to compare strings collected by the bleeding edge version of
# fbt library (babel-plugin-fbt@0.21.0) with strings collected by a previous
# version.
#
# Usage:
#   - While you are still on old babel-plugin-fbt, run `yarn fbt-collect` to
#     collect legacy strings
#   - Upgrade to babel-plugin-fbt@~0.21.0 in your package.json and run `yarn install`
#   - Run `yarn fbt-collect` to collect new strings
#   - Run `./categorize_new_strings.sh <legacy_srings.json> <new_strings.json> [--return-new-hash-key]`
#
#######################

set -euo pipefail

inputFileLegacy=$1
inputFileNew=$2
optionReturnPhrasesWithNewHashKey=""
if [[ $# -gt 2 ]]; then
  optionReturnPhrasesWithNewHashKey=$3
fi

tempFileLegacy=$inputFileLegacy.temp.json
tempFileNew=$inputFileNew.temp.json

jq '.phrases' "$inputFileLegacy" | jq '.|=sort_by(.filepath, .line_beg, .col_beg)' --sort-keys >& "$tempFileLegacy"
jq '.phrases' "$inputFileNew" | jq '.|=sort_by(.filepath, .line_beg, .col_beg)' --sort-keys >& "$tempFileNew"

node categorizeNewStrings.js \
  "$tempFileLegacy" "$tempFileNew" "$optionReturnPhrasesWithNewHashKey" \
  > "new_strings_by_category.json" && rm "$tempFileLegacy" "$tempFileNew"
