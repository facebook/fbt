/**
 * Copyright (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @noflow
 * @format
 * @emails oncall+internationalization
 */

'use strict';

const stripPragmas = require('./stripPragmas');
const through = require('through2');

function gulpStripPragmas(options) {
  return through.obj(function (file, _, cb) {
    if (file.isBuffer()) {
      const contents = file.contents.toString('utf8');
      file.contents = Buffer.from(stripPragmas(contents, options.pragmas));
    }
    cb(null, file);
  });
}

module.exports = gulpStripPragmas;
