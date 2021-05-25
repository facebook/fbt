/**
 * Copyright (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @noflow
 * @format
 * @emails oncall+i18n_fbt_js
 */

'use strict';

var {rewrite} = require('./Rewriter');
var through = require('through2');

function gulpFlowRewriteModules(options) {
  return through.obj(function (file, _, cb) {
    if (file.isBuffer()) {
      const contents = file.contents.toString('utf8');
      file.contents = Buffer.from(rewrite(contents, options));
    }
    cb(null, file);
  });
}

module.exports = gulpFlowRewriteModules;
