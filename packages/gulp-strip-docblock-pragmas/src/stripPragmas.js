/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @format
 * @noflow
 * @oncall i18n_fbt_js
 */

'use strict';

var {extract, parseWithComments, print, strip} = require('jest-docblock');

function stripPragmas(contents, pragmas) {
  const parsed = parseWithComments(extract(contents));
  parsed.pragmas = (pragmas || Object.keys(parsed.pragmas)).reduce(
    (agg, key) => {
      delete agg[key];
      return agg;
    },
    parsed.pragmas,
  );
  return print(parsed) + strip(contents);
}

module.exports = stripPragmas;
