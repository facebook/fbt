/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/

'use strict';

/*::
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';
*/

const {
  errorAt,
} = require('../FbtUtil');
const FbtNode = require('./FbtNode');
const {createInstanceFromFbtConstructCallsite} = require('./FbtNodeUtil');

/**
 * Represents an <fbt:sameParam> or fbt.sameParam() construct.
 * @see docs/params.md
 */
class FbtSameParamNode
  extends FbtNode/*:: <empty, BabelNodeCallExpression> */ {

  /*:: static +type: 'sameParam'; */

  /**
   * Create a new class instance given a BabelNode root node.
   * If that node is incompatible, we'll just return `null`.
   */
  static fromBabelNode({
    moduleName,
    node,
  } /*: FromBabelNodeFunctionArgs */) /*: ?FbtSameParamNode */ {
    return createInstanceFromFbtConstructCallsite(moduleName, node, this);
  }

  _getTokenName() /*: ?string */ {
    throw errorAt(this.node, 'not implemented yet');
  }

  getArgsForStringVariationCalc() /*: $ReadOnlyArray<empty> */ {
    return [];
  }
}
// $FlowFixMe[cannot-write] Needed because node.js v10 does not support static constants on classes
FbtSameParamNode.type = 'sameParam';

module.exports = FbtSameParamNode;
