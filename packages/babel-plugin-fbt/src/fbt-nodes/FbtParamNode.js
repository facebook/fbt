/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

/*eslint max-len: ["error", 100]*/

'use strict';

import type {ParamVariationType} from '../../../../runtime/shared/FbtRuntimeTypes';
import type {
  BabelNodeCallExpressionArg,
  BabelNodeCallExpressionArgument,
} from '../FbtUtil';
import type {StringVariationArgsMap} from './FbtArguments';
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';

const {ValidParamOptions} = require('../FbtConstants');
const {
  collectOptionsFromFbtConstruct,
  createFbtRuntimeArgCallExpression,
  enforceBabelNodeExpression,
  errorAt,
  varDump,
} = require('../FbtUtil');
const {GENDER_ANY, NUMBER_ANY} = require('../translate/IntlVariations');
const {
  GenderStringVariationArg,
  NumberStringVariationArg,
} = require('./FbtArguments');
const FbtNode = require('./FbtNode');
const FbtNodeType = require('./FbtNodeType');
const {
  createInstanceFromFbtConstructCallsite,
  tokenNameToTextPattern,
} = require('./FbtNodeUtil');
const {
  arrayExpression,
  isExpression,
  isStringLiteral,
  numericLiteral,
  stringLiteral,
} = require('@babel/types');
const invariant = require('invariant');
const nullthrows = require('nullthrows');

type Options = {|
  gender?: ?BabelNodeExpression, // Represents the `gender`
  name: string, // Name of the string token
  // If `true`, the string that uses this fbt:param will have number variations.
  // The `number` value will be inferred from the value of fbt:param
  // If `number` is a `BabelNode`, then we'll use it internally as the value to determine
  // the number variation, and the fbt:param value will represent the UI text to render.
  number?: ?true | BabelNodeExpression,
  value: BabelNodeCallExpressionArgument,
|};

/**
 * Variations.
 */
const ParamVariation: ParamVariationType = {
  number: 0,
  gender: 1,
};

/**
 * Represents an <fbt:param> or fbt.param() construct.
 * @see docs/params.md
 */
class FbtParamNode extends FbtNode<
  GenderStringVariationArg | NumberStringVariationArg,
  BabelNodeCallExpression,
  null,
  Options,
> {
  static +type: FbtNodeType = FbtNodeType.Param;

  getOptions(): Options {
    try {
      const rawOptions = collectOptionsFromFbtConstruct(
        this.moduleName,
        this.node,
        ValidParamOptions,
      );
      const [arg0, arg1] = this.getCallNodeArguments() || [];
      const gender = enforceBabelNodeExpression.orNull(rawOptions.gender);
      const number =
        typeof rawOptions.number === 'boolean'
          ? rawOptions.number
          : enforceBabelNodeExpression.orNull(rawOptions.number);

      invariant(
        number !== false,
        '`number` option must be an expression or `true`',
      );
      invariant(
        !gender || !number,
        'Gender and number options must not be set at the same time',
      );

      let name = typeof rawOptions.name === 'string' ? rawOptions.name : null;
      if (name == null || name === '') {
        invariant(
          isStringLiteral(arg0),
          'First function argument must be a string literal',
        );
        name = arg0.value;
      }
      invariant(name.length, 'Token name string must not be empty');

      const value = nullthrows(
        arg1,
        'The second function argument must not be null',
      );

      return {
        gender,
        name,
        number,
        value,
      };
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
  }: FromBabelNodeFunctionArgs): ?FbtParamNode {
    return createInstanceFromFbtConstructCallsite(moduleName, node, this);
  }

  getArgsForStringVariationCalc(): $ReadOnlyArray<
    GenderStringVariationArg | NumberStringVariationArg,
  > {
    const {gender, number} = this.options;
    const ret = [];
    invariant(
      !gender || !number,
      'Gender and number options must not be set at the same time',
    );
    if (gender) {
      ret.push(new GenderStringVariationArg(this, gender, [GENDER_ANY]));
    } else if (number) {
      ret.push(
        new NumberStringVariationArg(this, number === true ? null : number, [
          NUMBER_ANY,
        ]),
      );
    }
    return ret;
  }

  getTokenName(_argsMap: StringVariationArgsMap): string {
    return this.options.name;
  }

  getText(argsMap: StringVariationArgsMap): string {
    try {
      this.getArgsForStringVariationCalc().forEach(expectedArg => {
        const svArg = argsMap.get(this);
        invariant(
          // $FlowExpectedError[method-unbinding] We're just comparing methods by reference
          svArg.constructor === expectedArg.constructor,
          'Expected SVArgument instance of %s but got %s instead: %s',
          expectedArg.constructor.name || 'unknown',
          svArg.constructor.name || 'unknown',
          varDump(svArg),
        );
      });
      return tokenNameToTextPattern(this.getTokenName(argsMap));
    } catch (error) {
      throw errorAt(this.node, error);
    }
  }

  getFbtRuntimeArg(): BabelNodeCallExpression {
    const {gender, name, number, value} = this.options;
    let variationValues: Array<BabelNodeExpression>;

    if (number != null) {
      variationValues = ([
        numericLiteral(ParamVariation.number),
      ]: Array<BabelNodeExpression>);
      if (number !== true) {
        // For number="true" we don't pass additional value.
        variationValues.push(number);
      }
    } else if (gender != null) {
      variationValues = [numericLiteral(ParamVariation.gender), gender];
    }
    return createFbtRuntimeArgCallExpression(
      this,
      [
        stringLiteral(name),
        value,
        variationValues ? arrayExpression(variationValues) : null,
      ].filter(Boolean),
    );
  }

  getArgsThatShouldNotContainFunctionCallOrClassInstantiation(): $ReadOnly<{
    [argName: string]: BabelNodeCallExpressionArg,
  }> {
    const {gender, number} = this.options;
    if (gender != null) {
      return {gender};
    }
    return isExpression(number) ? {number} : {};
  }
}

module.exports = FbtParamNode;
