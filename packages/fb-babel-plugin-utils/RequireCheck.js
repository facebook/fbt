/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
