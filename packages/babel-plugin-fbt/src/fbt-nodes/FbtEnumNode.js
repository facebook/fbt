/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/

'use strict';

/////////////////////////////////////////////////////////////////////
// Planned fbt arguments that will be used by various fbt constructs
// `*` means that it's a static argument (whose value won't change at runtime)
/////////////////////////////////////////////////////////////////////
// enum : enumMap*, enumValue

/*::
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';
import type {EnumStringVariationArg, AnyFbtArgument} from './FbtArguments';
*/

const {
  errorAt,
} = require('../FbtUtil');
const FbtNode = require('./FbtNode');
const {createInstanceFromFbtConstructCallsite} = require('./FbtNodeUtil');

/**
 * Represents an <fbt:enum> or fbt.enum() construct.
 * @see docs/enums.md
 */
class FbtEnumNode
  extends FbtNode/*:: <EnumStringVariationArg, BabelNodeCallExpression> */ {

  /*:: static +type: 'enum'; */

  /**
   * Create a new class instance given a BabelNode root node.
   * If that node is incompatible, we'll just return `null`.
   */
  static fromBabelNode({
    moduleName,
    node,
  } /*: FromBabelNodeFunctionArgs */) /*: ?FbtEnumNode */ {
    return createInstanceFromFbtConstructCallsite(moduleName, node, this);
  }

  _getValueNode() /*: BabelNode */ {
    throw errorAt(this.node, 'not implemented yet');
  }

  _getEnumRangeNode() /*: BabelNode */ {
    throw errorAt(this.node, 'not implemented yet');
  }
}
// $FlowFixMe[cannot-write] Needed because node.js v10 does not support static constants on classes
FbtEnumNode.type = 'enum';

module.exports = FbtEnumNode;
