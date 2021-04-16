/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/

'use strict';

/*::
import type {SVArgsList} from './FbtArguments';
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';
*/

const FbtNode = require('./FbtNode');
const {
  isJSXText,
  isStringLiteral,
} = require('@babel/types');

/**
 * Represents the text literals present within <fbt> or fbt() callsites.
 *
 * I.e.
 *
 *  fbt(
 *    'Hello', // <-- FbtTextNode
 *    'description',
 *  )
 */
class FbtTextNode
  extends FbtNode/*:: <empty, BabelNodeStringLiteral | BabelNodeJSXText> */ {

  /*:: static +type: 'text'; */

  /**
   * Create a new class instance given a BabelNode root node.
   * If that node is incompatible, we'll just return `null`.
   */
  static fromBabelNode({
    moduleName,
    node,
  } /*: FromBabelNodeFunctionArgs */) /*: ?FbtTextNode */ {
    return isJSXText(node) || isStringLiteral(node)
      ? new FbtTextNode({
        moduleName,
        node,
      })
      : null;
  }

  getArgsForStringVariationCalc() /*: $ReadOnlyArray<empty> */ {
    return [];
  }

  getText(_args /*: SVArgsList */) /*: string */ {
    return this.node.value;
  }
}
// $FlowFixMe[cannot-write] Needed because node.js v10 does not support static constants on classes
FbtTextNode.type = 'text';

module.exports = FbtTextNode;
