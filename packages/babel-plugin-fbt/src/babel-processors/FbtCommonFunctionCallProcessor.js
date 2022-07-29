/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

/*eslint max-len: ["error", 100]*/

'use strict';

import type {JSModuleNameType} from '../FbtConstants';
import type {NodePathOf} from '@babel/core';
import typeof BabelTypes from '@babel/types';

const FbtCommon = require('../FbtCommon');
const {CommonOption} = require('../FbtConstants');
const FbtNodeChecker = require('../FbtNodeChecker');
const {errorAt, expandStringConcat, normalizeSpaces} = require('../FbtUtil');

type NodePath = NodePathOf<BabelNodeCallExpression>;

/**
 * This class provides utility methods to process the babel node of the fbt common function call.
 * I.e. `fbt.c(...)`
 */
class FbtCommonFunctionCallProcessor {
  moduleName: JSModuleNameType;
  node: $PropertyType<NodePath, 'node'>;
  path: NodePath;
  t: BabelTypes;

  constructor({
    babelTypes,
    moduleName,
    path,
  }: {
    babelTypes: BabelTypes,
    moduleName: JSModuleNameType,
    path: NodePath,
  }): void {
    this.moduleName = moduleName;
    this.node = path.node;
    this.path = path;
    this.t = babelTypes;
  }

  static create({
    babelTypes,
    path,
  }: {
    babelTypes: BabelTypes,
    path: NodePath,
  }): ?FbtCommonFunctionCallProcessor {
    const nodeChecker = FbtNodeChecker.forFbtCommonFunctionCall(path.node);
    return nodeChecker != null
      ? new FbtCommonFunctionCallProcessor({
          babelTypes,
          moduleName: nodeChecker.moduleName,
          path,
        })
      : null;
  }

  /**
   * Converts an Fbt common call of the form `fbt.c(text)` to the basic form `fbt(text, desc)`
   */
  convertToNormalCall(): BabelNodeCallExpression {
    const {moduleName, node, t} = this;
    if (node.arguments.length !== 1) {
      throw errorAt(
        node,
        `Expected ${moduleName}.c to have exactly 1 argument. ${node.arguments.length} was given.`,
      );
    }

    const text = normalizeSpaces(
      expandStringConcat(moduleName, node.arguments[0]).value,
    ).trim();

    const desc = FbtCommon.getDesc(text);
    if (desc == null || desc === '') {
      throw errorAt(
        node,
        FbtCommon.getUnknownCommonStringErrorMessage(moduleName, text),
      );
    }

    const callNode = t.callExpression(t.identifier(moduleName), [
      t.stringLiteral(text),
      t.stringLiteral(desc),
      t.objectExpression([
        t.objectProperty(t.identifier(CommonOption), t.booleanLiteral(true)),
      ]),
    ]);

    callNode.loc = node.loc;
    return callNode;
  }
}

module.exports = FbtCommonFunctionCallProcessor;
