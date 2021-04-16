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
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';

type Options = {|
  // If true, capitalize the pronoun text
  capitalize?: ?boolean,
  // BabelNode representing the value of the `gender`
  gender: BabelNode,
  // If true, exclude non-human-related pronouns from the generated string variations
  human?: ?boolean,
  // Type of pronoun
  type: $Keys<typeof ValidPronounUsages>,
|};
*/

const {
  ValidPronounOptions,
  ValidPronounUsages,
} = require('../FbtConstants');
const {
  collectOptionsFromFbtConstruct,
  enforceBabelNode,
  enforceBoolean,
  enforceStringEnum,
  errorAt,
} = require('../FbtUtil');
const {GenderStringVariationArg} = require('./FbtArguments');
const FbtNode = require('./FbtNode');
const {createInstanceFromFbtConstructCallsite} = require('./FbtNodeUtil');
const {
  isStringLiteral,
} = require('@babel/types');
const invariant = require('invariant');
const nullthrows = require('nullthrows');

/**
 * Represents an <fbt:pronoun> or fbt.pronoun() construct.
 * @see docs/pronouns.md
 */
class FbtPronounNode extends FbtNode/*:: <
  GenderStringVariationArg,
  BabelNodeCallExpression,
  > */ {

  /*::
  static +type: 'pronoun';
  +options: Options;
  */

  /**
   * Create a new class instance given a BabelNode root node.
   * If that node is incompatible, we'll just return `null`.
   */
  static fromBabelNode({
    moduleName,
    node,
  } /*: FromBabelNodeFunctionArgs */) /*: ?FbtPronounNode */ {
    return createInstanceFromFbtConstructCallsite(moduleName, node, this);
  }

  getOptions() /*: Options */ {
    const rawOptions = collectOptionsFromFbtConstruct(
      this.moduleName,
      this.node,
      ValidPronounOptions,
    );

    try {
      const args = this.getCallNodeArguments() || [];
      const [usageArg, genderArg] = args;
      invariant(isStringLiteral(usageArg), '`type`, the first argument');
      const type = enforceStringEnum(
        usageArg.value,
        ValidPronounUsages,
        '`type`, the first argument',
      );
      const gender = enforceBabelNode(genderArg, '`gender`, the second argument');
      const mergedOptions = nullthrows(rawOptions);
      return {
        capitalize: enforceBoolean.orNull(mergedOptions.capitalize),
        gender,
        human: enforceBoolean.orNull(mergedOptions.human),
        type,
      };
    } catch (error) {
      throw errorAt(this.node, error);
    }
  }

  initCheck() /*: void */ {
    const args = this.getCallNodeArguments();
    invariant(args && (args.length === 2 || args.length === 3) || !args,
      "Expected '(usage, gender [, options])' arguments to %s.pronoun",
      this.moduleName,
    );
  }

  _getGenderNode() /*: BabelNode */ {
    throw errorAt(this.node, 'not implemented yet');
  }

  getArgsForStringVariationCalc() /*: $ReadOnlyArray<GenderStringVariationArg> */ {
    return [new GenderStringVariationArg(this.options.gender)];
  }
}
// $FlowFixMe[cannot-write] Needed because node.js v10 does not support static constants on classes
FbtPronounNode.type = 'pronoun';

module.exports = FbtPronounNode;
