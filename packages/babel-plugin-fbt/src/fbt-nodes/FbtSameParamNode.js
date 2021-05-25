/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+i18n_fbt_js
 * @flow
 */

/*eslint max-len: ["error", 100]*/

'use strict';

import type {StringVariationArgsMap} from './FbtArguments';
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';

const {errorAt} = require('../FbtUtil');
const FbtNode = require('./FbtNode');
const FbtNodeType = require('./FbtNodeType');
const {
  createInstanceFromFbtConstructCallsite,
  tokenNameToTextPattern,
} = require('./FbtNodeUtil');
const {isStringLiteral} = require('@babel/types');
const invariant = require('invariant');

/**
 * Represents an <fbt:sameParam> or fbt.sameParam() construct.
 * @see docs/params.md
 */
class FbtSameParamNode extends FbtNode<
  empty,
  BabelNodeCallExpression,
  null,
  null,
> {
  static +type: FbtNodeType = FbtNodeType.SameParam;

  /**
   * Create a new class instance given a BabelNode root node.
   * If that node is incompatible, we'll just return `null`.
   */
  static fromBabelNode({
    moduleName,
    node,
  }: FromBabelNodeFunctionArgs): ?FbtSameParamNode {
    return createInstanceFromFbtConstructCallsite(moduleName, node, this);
  }

  getOptions(): null {
    return null;
  }

  _getTokenName(): string {
    const [name] = this.getCallNodeArguments() || [];

    invariant(
      isStringLiteral(name),
      'Expected first argument of %s.sameParam to be a string literal, but got `%s`',
      this.moduleName,
      (name && name.type) || 'unknown',
    );

    return name.value;
  }

  getText(_argsList: StringVariationArgsMap): string {
    try {
      // TODO(T79804447): verify that the token name was already defined at the sentence level
      return tokenNameToTextPattern(this._getTokenName());
    } catch (error) {
      throw errorAt(this.node, error);
    }
  }

  getArgsForStringVariationCalc(): $ReadOnlyArray<empty> {
    return [];
  }

  getFbtRuntimeArg(): null {
    return null;
  }
}

module.exports = FbtSameParamNode;
