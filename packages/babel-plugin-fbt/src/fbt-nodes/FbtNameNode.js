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
import type {GenderStringVariationArg} from './FbtArguments';
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';
*/

const {
  errorAt,
} = require('../FbtUtil');
const FbtNode = require('./FbtNode');
const {createInstanceFromFbtConstructCallsite} = require('./FbtNodeUtil');

/**
 * Represents an <fbt:name> or fbt.name() construct.
 * @see docs/params.md
 */
class FbtNameNode extends FbtNode/*:: <
  GenderStringVariationArg,
  BabelNodeCallExpression,
  > */ {
  /*:: static +type: 'name'; */

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

  _getTokenName() /*: ?string */ {
    throw errorAt(this.node, 'not implemented yet');
  }

  _getValueNode() /*: BabelNode */ {
    throw errorAt(this.node, 'not implemented yet');
  }

  _getGenderNode() /*: BabelNode */ {
    throw errorAt(this.node, 'not implemented yet');
  }
}
// $FlowFixMe[cannot-write] Needed because node.js v10 does not support static constants on classes
FbtNameNode.type = 'name';

module.exports = FbtNameNode;
