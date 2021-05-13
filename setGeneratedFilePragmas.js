/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @noflow
 * @emails oncall+internationalization
 */

'use strict';

const each = require('gulp-each');
const invariant = require('invariant');
const jestDocblock = require('jest-docblock');

// Inspired from https://stackoverflow.com/a/36328890/104598
const DOCBLOCK_PATTERN = /(\/\*\*[^*]*\*+(?:[^/*][^*]*\*+)*\/)([\s\S]*)/;

function setGeneratedFilePragmas(oncallID) {
  return each((content, file, callback) => {
    // using a regexp to get the first docblock because jestDocblock gets confused
    // when seeing multiple ones in the same file
    const matches = content.match(DOCBLOCK_PATTERN);
    const [_, docblock, code] = matches || [];

    if (!docblock) {
      invariant(
        false,
        "Couldn't find header docblock in file: `%s`\nContent excerpt: `%s`",
        file.path,
        content.substring(0, 100),
      );
    }

    const prelude = content.substr(0, matches.index);
    const {
      pragmas: {
        // Removing `codegen-command` pragmas
        'codegen-command': _delete1,
        'codegen-command:': _delete2,
        ...pragmas
      },
      comments,
    } = jestDocblock.parseWithComments(docblock);

    const newContent =
      prelude +
      jestDocblock.print({
        pragmas: {
          ...pragmas,
          generated: '', // remove any "SignedSource" value to avoid lint issues
          nolint: '',
          nogrep: '',
          emails: pragmas.emails || oncallID,
        },
        comments,
      }) +
      code;

    callback(null, newContent);
  });
}

module.exports = setGeneratedFilePragmas;
