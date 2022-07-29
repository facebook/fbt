/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
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

type Options = {|
  name: string, // Name of the string token
|};

/**
 * Represents an <fbt:sameParam> or fbt.sameParam() construct.
 * @see docs/params.md
 */
class FbtSameParamNode extends FbtNode<
  empty,
  BabelNodeCallExpression,
  null,
  Options,
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

  getOptions(): Options {
    try {
      const [name] = this.getCallNodeArguments() || [];
      invariant(
        isStringLiteral(name),
        'Expected first argument of %s.sameParam to be a string literal, but got `%s`',
        this.moduleName,
        (name && name.type) || 'unknown',
      );
      return {name: name.value};
    } catch (error) {
      throw errorAt(this.node, error);
    }
  }

  getTokenName(_argsMap: StringVariationArgsMap): string {
    return this.options.name;
  }

  getText(_argsList: StringVariationArgsMap): string {
    try {
      return tokenNameToTextPattern(this.getTokenName(_argsList));
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
