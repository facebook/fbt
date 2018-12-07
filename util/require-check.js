/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * These methods were extracted from fb-module plugin so they can be shared with
 * fbt plugin
 */

'use strict';

function isRequireCall(node) {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments.length === 1 &&
    node.arguments[0].type === 'StringLiteral'
  );
}

function isRequireAlias(path) {
  const grandParent = path.parentPath.parent;
  const parent = path.parent;
  const node = path.node;

  return (
    grandParent.type === 'Program' &&
    parent.type === 'VariableDeclaration' &&
    node.type === 'VariableDeclarator' &&
    node.id.type === 'Identifier' &&
    node.init &&
    isRequireCall(node.init) &&
    !node.init._isGeneratedInlinedRequire
  );
}

exports.isRequireAlias = isRequireAlias;
exports.isRequireCall = isRequireCall;
