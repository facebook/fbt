/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/
/* eslint-disable brace-style */ // Needed due to Flow types inlined in comments

'use strict';

/*::
import type {FbtOptionValue, JSModuleNameType} from '../FbtConstants';
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';

type Options = {|
  gender?: ?BabelNode, // Represents the `gender`
  name: string, // Name of the string token
  // If `true`, the string that uses this fbt:param will have number variations.
  // The `number` value will be inferred from the value of fbt:param
  // If `number` is a `BabelNode`, then we'll use it internally as the value to determine
  // the number variation, and the fbt:param value will represent the UI text to render.
  number?: ?true | BabelNode,
|};
*/

const {ValidParamOptions} = require('../FbtConstants');
const {
  collectOptionsFromFbtConstruct,
  enforceBabelNode,
  errorAt,
} = require('../FbtUtil');
const {GenderStringVariationArg, NumberStringVariationArg} = require('./FbtArguments');
const FbtNode = require('./FbtNode');
const {createInstanceFromFbtConstructCallsite} = require('./FbtNodeUtil');
const {
  isStringLiteral,
} = require('@babel/types');
const invariant = require('invariant');

/**
 * Represents an <fbt:param> or fbt.param() construct.
 * @see docs/params.md
 */
class FbtParamNode extends FbtNode/*:: <
  GenderStringVariationArg | NumberStringVariationArg,
  BabelNodeCallExpression
  > */ {

  /*::
  static +type: 'param';
  +options: Options;
  */

  getOptions() /*: Options */ {
    try {
      const rawOptions = collectOptionsFromFbtConstruct(
        this.moduleName,
        this.node,
        ValidParamOptions,
      );
      const gender = enforceBabelNode.orNull(rawOptions.gender);
      const number = typeof rawOptions.number === 'boolean'
        ? rawOptions.number
        : enforceBabelNode.orNull(rawOptions.number);

      invariant(number !== false, '`number` option must be an expression or `true`');
      invariant(!gender || !number,
        'Gender and number options must not be set at the same time');

      let name = typeof rawOptions.name === 'string' ? rawOptions.name : null;
      if (!name) {
        const [arg0] = this.getCallNodeArguments() || [];
        invariant(isStringLiteral(arg0), 'First function argument must be a string literal');
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
  } /*: FromBabelNodeFunctionArgs */) /*: ?FbtParamNode */ {
    return createInstanceFromFbtConstructCallsite(moduleName, node, this);
  }

  getArgsForStringVariationCalc() /*: $ReadOnlyArray<
    | GenderStringVariationArg
    | NumberStringVariationArg
  > */ {
    const {gender, number} = this.options;
    const ret = [];
    invariant(!gender || !number, 'Gender and number options must not be set at the same time');
    if (gender) {
      ret.push(new GenderStringVariationArg(gender));
    }
    if (number) {
      ret.push(new NumberStringVariationArg(number === true ? null : number));
    }
    return ret;
  }
}
// $FlowFixMe[cannot-write] Needed because node.js v10 does not support static constants on classes
FbtParamNode.type = 'param';

module.exports = FbtParamNode;
