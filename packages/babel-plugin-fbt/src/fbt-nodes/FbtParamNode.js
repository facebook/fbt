/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+internationalization
 * @flow
 */

/*eslint max-len: ["error", 100]*/
/* eslint-disable brace-style */ // Needed due to Flow types inlined in comments

'use strict';

import type {StringVariationArgsMap} from './FbtArguments';
import type {FbtOptionValue, JSModuleNameType} from '../FbtConstants';
import type {AnyFbtNode} from './FbtNode';
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';

type Options = {|
  gender?: ?BabelNodeExpression, // Represents the `gender`
  name: string, // Name of the string token
  // If `true`, the string that uses this fbt:param will have number variations.
  // The `number` value will be inferred from the value of fbt:param
  // If `number` is a `BabelNode`, then we'll use it internally as the value to determine
  // the number variation, and the fbt:param value will represent the UI text to render.
  number?: ?true | BabelNodeExpression,
|};

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
const {
  createInstanceFromFbtConstructCallsite,
  getClosestElementOrImplicitParamNodeAncestor,
  tokenNameToTextPattern,
} = require('./FbtNodeUtil');
const {
  arrayExpression,
  isStringLiteral,
  numericLiteral,
  stringLiteral,
} = require('@babel/types');
const invariant = require('invariant');
const nullthrows = require('nullthrows');

/**
 * Variations.
 */
const Variation = {
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
> {
  static +type: 'param';
  +options: Options;

  getOptions(): Options {
    try {
      const rawOptions = collectOptionsFromFbtConstruct(
        this.moduleName,
        this.node,
        ValidParamOptions,
      );
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
      if (!name) {
        const [arg0] = this.getCallNodeArguments() || [];
        invariant(
          isStringLiteral(arg0),
          'First function argument must be a string literal',
        );
        name = arg0.value;
      }
      invariant(name.length, 'Token name string must not be empty');

      return {
        gender,
        name,
        number,
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
    const [, value] = this.getCallNodeArguments() || [];
    const {options} = this;
    const {gender, number} = options;
    let variationValues;

    if (number != null) {
      variationValues = [numericLiteral(Variation.number)];
      if (number !== true) {
        // For number="true" we don't pass additional value.
        variationValues.push(number);
      }
    } else if (gender != null) {
      variationValues = [numericLiteral(Variation.gender), gender];
    }
    return createFbtRuntimeArgCallExpression(
      this,
      [
        stringLiteral(options.name),
        nullthrows(value),
        variationValues ? arrayExpression(variationValues) : null,
      ].filter(Boolean),
    );
  }
}
// $FlowFixMe[cannot-write] Needed because node.js v10 does not support static constants on classes
FbtParamNode.type = 'param';

module.exports = FbtParamNode;
