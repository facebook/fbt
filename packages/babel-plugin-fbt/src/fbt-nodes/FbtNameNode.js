/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/
/* eslint-disable brace-style */ // Needed due to Flow types inlined in comments

'use strict';

/////////////////////////////////////////////////////////////////////
// Planned fbt arguments that will be used by various fbt constructs
// `*` means that it's a static argument (whose value won't change at runtime)
/////////////////////////////////////////////////////////////////////
// name : tokenName*, nameStr, genderValue

/*::
import type {SVArgsList} from './FbtArguments';
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';

type Options = {|
  gender: BabelNode, // `BabelNode` representing the `gender` of the fbt:name's value
  name: string, // Name of the string token
  value: BabelNode, // `BabelNode` representing the `value` of the fbt:name to render on the UI
|};
*/

const {
  enforceBabelNode,
  errorAt,
} = require('../FbtUtil');
const {GENDER_ANY} = require('../translate/IntlVariations');
const {GenderStringVariationArg} = require('./FbtArguments');
const FbtNode = require('./FbtNode');
const {createInstanceFromFbtConstructCallsite, tokenNameToTextPattern} = require('./FbtNodeUtil');
const {
  isStringLiteral,
} = require('@babel/types');
const invariant = require('invariant');

/**
 * Represents an <fbt:name> or fbt.name() construct.
 * @see docs/params.md
 */
class FbtNameNode extends FbtNode/*:: <
  GenderStringVariationArg,
  BabelNodeCallExpression,
  > */ {
  /*::
  static +type: 'name';
  +options: Options;
  */

  getOptions() /*: Options */ {
    try {
      const {moduleName} = this;
      let [
        name,
        value,
        gender,
      ] = this.getCallNodeArguments() || [];

      invariant(isStringLiteral(name),
        'Expected first argument of %s.name to be a string literal, but got %s',
        moduleName,
        name && name.type,
      );
      name = name.value;

      value = enforceBabelNode(value, `Second argument of ${moduleName}.name`);
      gender = enforceBabelNode(gender, `Third argument of ${moduleName}.name`);

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
  } /*: FromBabelNodeFunctionArgs */) /*: ?FbtNameNode */ {
    return createInstanceFromFbtConstructCallsite(moduleName, node, this);
  }

  getArgsForStringVariationCalc() /*: $ReadOnlyArray<GenderStringVariationArg> */ {
    return [new GenderStringVariationArg(this, this.options.gender, [GENDER_ANY])];
  }

  getText(argsList: SVArgsList): string {
    try {
      GenderStringVariationArg.assert(argsList.consumeOne());
      return tokenNameToTextPattern(this.options.name);
    } catch (error) {
      throw errorAt(this.node, error);
    }
  }
}
// $FlowFixMe[cannot-write] Needed because node.js v10 does not support static constants on classes
FbtNameNode.type = 'name';

module.exports = FbtNameNode;
