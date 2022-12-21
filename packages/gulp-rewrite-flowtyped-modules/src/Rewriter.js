/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @format
 * @noflow
 * @oncall i18n_fbt_js
 */

'use strict';

var flowParser = require('flow-parser');

/**
 * Runs the flow-parser on a given JavaScript file and rewrites modules
 * according to rewrite rules passed into options:
 *
 *  prefix: module prefix defaults to './', (not used when modules are mapped)
 *     map: module => rewriteModule map
 *    flow: options to pass to the flow-parser on parse(...)
 */
class Rewriter {
  constructor(src, options) {
    this._opts = {flow: {}, map: {}, prefix: './', ...options};
    this._src = src;
    this._idx = 0; // Tracks our current substring index in src
    this._dst = ''; // destination for new rewritten source
  }

  static rewrite(src, opts) {
    return new Rewriter(src, opts).rewrite();
  }

  rewrite() {
    this._rewrite(flowParser.parse(this._src, this._opts.flow));
    return this._dst + this._src.substr(this._idx);
  }

  _rewrite(esTree) {
    if (esTree.type == null && !Array.isArray(esTree)) {
      return;
    }
    for (const key in esTree) {
      const ast = esTree[key];
      if (ast == null) {
        continue;
      }
      if (
        ast.type === 'CallExpression' &&
        ast.callee.type === 'Identifier' &&
        ast.callee.name === 'require'
      ) {
        this._rewriteModule(ast.arguments[0]);
      } else if (ast.type === 'ImportDeclaration') {
        this._rewriteModule(ast.source);
      }
      this._rewrite(ast);
    }
  }

  _rewriteModule(ast) {
    if (ast.type !== 'Literal') {
      return;
    }
    const module = this._opts.map[ast.value] || this._opts.prefix + ast.value;
    const replacement = ast.raw[0] + module + ast.raw[0]; // add quotes
    this._dst += this._src.substring(this._idx, ast.range[0]) + replacement;
    this._idx = ast.range[1];
  }
}

module.exports = Rewriter;
