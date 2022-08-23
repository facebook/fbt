/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

/*eslint max-len: ["error", 100]*/

'use strict';

/////////////////////////////////////////////////////////////////////
// Planned fbt arguments that will be used by various fbt constructs
// `*` means that it's a static argument (whose value won't change at runtime)
/////////////////////////////////////////////////////////////////////
// name : tokenName*, nameStr, genderValue

import type {BabelNodeCallExpressionArg} from '../FbtUtil';
import type {StringVariationArgsMap} from './FbtArguments';
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';

const {
  createFbtRuntimeArgCallExpression,
  enforceBabelNodeCallExpressionArg,
  errorAt,
} = require('../FbtUtil');
const {GENDER_ANY} = require('../translate/IntlVariations');
const {GenderStringVariationArg} = require('./FbtArguments');
const FbtNode = require('./FbtNode');
const FbtNodeType = require('./FbtNodeType');
const {
  createInstanceFromFbtConstructCallsite,
  tokenNameToTextPattern,
} = require('./FbtNodeUtil');
const {isStringLiteral, stringLiteral} = require('@babel/types');
const invariant = require('invariant');

type Options = {|
  // `BabelNode` representing the `gender` of the fbt:name's value
  gender: BabelNodeCallExpressionArg,
  name: string, // Name of the string token
  // `BabelNode` representing the `value` of the fbt:name to render on the UI
  value: BabelNodeCallExpressionArg,
|};

/**
 * Represents an <fbt:name> or fbt.name() construct.
 * @see docs/params.md
 */
class FbtNameNode extends FbtNode<
  GenderStringVariationArg,
  BabelNodeCallExpression,
  null,
  Options,
> {
  static +type: FbtNodeType = FbtNodeType.Name;

  getOptions(): Options {
    try {
      const {moduleName} = this;
      let [name, value, gender] = this.getCallNodeArguments() || [];

      invariant(
        isStringLiteral(name),
        'Expected first argument of %s.name to be a string literal, but got %s',
        moduleName,
        name && name.type,
      );
      // $FlowFixMe[incompatible-type]
      name = name.value;

      value = enforceBabelNodeCallExpressionArg(
        value,
        `Second argument of ${moduleName}.name`,
      );
      gender = enforceBabelNodeCallExpressionArg(
        gender,
        `Third argument of ${moduleName}.name`,
      );

      return {name, value, gender};
    } catch (error) {
      throw errorAt(this.node, error);
    }
  }

  /**
   * Create a new class instance given a BabelNode root node.
   * If that node is incompatible, we'll just return `null`.
   */
  static fromBabelNode({
    moduleName,
    node,
  }: FromBabelNodeFunctionArgs): ?FbtNameNode {
    return createInstanceFromFbtConstructCallsite(moduleName, node, this);
  }

  getArgsForStringVariationCalc(): $ReadOnlyArray<GenderStringVariationArg> {
    return [
      new GenderStringVariationArg(this, this.options.gender, [GENDER_ANY]),
    ];
  }

  getTokenName(_argsMap: StringVariationArgsMap): string {
    return this.options.name;
  }

  getText(argsMap: StringVariationArgsMap): string {
    try {
      argsMap.mustHave(this);
      return tokenNameToTextPattern(this.options.name);
    } catch (error) {
      throw errorAt(this.node, error);
    }
  }

  getFbtRuntimeArg(): BabelNodeCallExpression {
    const {gender, name, value} = this.options;
    return createFbtRuntimeArgCallExpression(
      this,
      [stringLiteral(name), value, gender].filter(Boolean),
    );
  }

  getArgsThatShouldNotContainFunctionCallOrClassInstantiation(): $ReadOnly<{
    [argName: string]: BabelNodeCallExpressionArg,
  }> {
    return {gender: this.options.gender};
  }
}

module.exports = FbtNameNode;
