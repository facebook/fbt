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
// pronoun : genderValue

/*::
import type {
  GenderStringVariationArg,
} from './FbtArguments';
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';
*/

const {
  errorAt,
} = require('../FbtUtil');
const FbtNode = require('./FbtNode');
const {createInstanceFromFbtConstructCallsite} = require('./FbtNodeUtil');

/**
 * Represents an <fbt:pronoun> or fbt.pronoun() construct.
 * @see docs/pronouns.md
 */
class FbtPronounNode extends FbtNode/*:: <
  GenderStringVariationArg,
  BabelNodeCallExpression,
  > */ {

  /*:: static +type: 'pronoun'; */

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

  _getGenderNode() /*: BabelNode */ {
    throw errorAt(this.node, 'not implemented yet');
  }
}
// $FlowFixMe[cannot-write] Needed because node.js v10 does not support static constants on classes
FbtPronounNode.type = 'pronoun';

module.exports = FbtPronounNode;
