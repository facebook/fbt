/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/

'use strict';

/*::
import type {StringVariationArgsMap} from './FbtArguments';
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';
*/

const FbtNode = require('./FbtNode');
const FbtNodeType = require('./FbtNodeType');
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

  /*:: static +type: FbtNodeType; */

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

  getText(_argsList /*: StringVariationArgsMap */) /*: string */ {
    return this.node.value;
  }
}
// $FlowFixMe[cannot-write] Needed because node.js v10 does not support static constants on classes
FbtTextNode.type = FbtNodeType.Text;

module.exports = FbtTextNode;
