/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @emails oncall+internationalization
 * @format
 */

/*
cd scripts/intl/js/oss-fbt/__github__/packages/babel-plugin-fbt/src

find . | grep '.js$' | \
xargs \
~/www/scripts/third-party/node --max-old-space-size=2048 -- ~/www/scripts/third-party/node_modules/jscodeshift/bin/jscodeshift.js \
  --parser flow \
  --transform ~/www/scripts/intl/js/oss-fbt/__github__/convertFlowTypeComments.js

# Fix up manually some flow type issues in src/translate/IntlVariations.js because the regexp is not perfect

# Rerun prettier
find . | grep '.js$' | xargs prettier --insert-pragma --write
*/

'use strict';

// See https://regex101.com/r/QmyAf4/1
const FLOW_TYPE_COMMENT_PATTERN = /(\/\*:([^*]*\**)\*(?:[^/*][^*]*\*+)*\/)/gm;

function transformer(file, api, _opts) {
  const j = api.jscodeshift;

  return file.source.replace(
    FLOW_TYPE_COMMENT_PATTERN,
    (fullText, _, commentContent) => {
      console.warn('fullText = ', fullText);
      console.warn('commentContent = ', commentContent);
      if (commentContent.startsWith(':')) {
        return commentContent.substr(1);
      }
      return ':' + commentContent;
    },
  );
}

module.exports = transformer;
