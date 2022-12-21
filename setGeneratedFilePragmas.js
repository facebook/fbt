/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @noflow
 * @oncall i18n_fbt_js
 */

'use strict';

const each = require('gulp-each');
const invariant = require('invariant');
const {parseWithComments, print} = require('jest-docblock');

// Inspired from https://stackoverflow.com/a/36328890/104598
const DOCBLOCK_PATTERN = /(\/\*\*[^*]*\*+(?:[^/*][^*]*\*+)*\/)([\s\S]*)/;
const STRIPPED_PRAGMAS = ['codegen-command:', 'codegen-command', 'format'];

function setGeneratedFilePragmas(oncallID) {
  return each((content, file, callback) => {
    const matches = content.match(DOCBLOCK_PATTERN);
    const [_, docblockStr, code] = matches || [];
    invariant(!!docblockStr, "No docblock in '%s'", file);
    const docblock = parseWithComments(docblockStr);
    STRIPPED_PRAGMAS.forEach(key => delete docblock.pragmas[key]);
    Object.assign(docblock.pragmas, {
      oncall: docblock.pragmas.oncall || oncallID,
      generated: '', // remove any "SignedSource" value to avoid lint issues
      noformat: '',
      nogrep: '',
    });
    const prelude = content.substr(0, matches.index);
    callback(null, prelude + print(docblock) + code);
  });
}

module.exports = setGeneratedFilePragmas;
