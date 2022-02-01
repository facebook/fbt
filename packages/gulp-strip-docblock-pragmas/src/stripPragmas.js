/**
 * Copyright (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 * @noflow
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
