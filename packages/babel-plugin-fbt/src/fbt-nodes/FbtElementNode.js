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
import type {JSModuleNameType} from '../FbtConstants';
import type {AnyStringVariationArg} from './FbtArguments';
import type {
  FbtChildNode,
} from './FbtNode';
*/

const {
  errorAt,
} = require('../FbtUtil');
const FbtNode = require('./FbtNode');
const {
  isArrayExpression,
  isCallExpression,
  isJSXElement,
  isSpreadElement,
} = require('@babel/types');

/**
 * Represents the main fbt() or <fbt> construct.
 * Every nested fbt construct will be reachable from the `children` property.
 *
 * E.g. When we have an fbt callsite like this:
 *
 *     fbt(
 *       [
 *         'Hello',
 *         <strong>
 *           World!
 *         </strong>
 *       ],
 *       'description',
 *     )
 *
 * We'll represent it like this:
 *
 * FbtElementNode                    // fbt()
 *   |
 *   *- FbtTextNode                  // 'Hello'
 *   *- FbtImplicitParamNode         // <strong/>
 *        |
 *        *- FbtTextNode             // 'World!'
 *
 */
class FbtElementNode
  extends FbtNode/*:: <
    AnyStringVariationArg,
    BabelNodeCallExpression,
    FbtChildNode
  > */ {
  /*:: static +type: 'element'; */

  getProject() /*: string */ {
    throw errorAt(this.node, 'not implemented yet');
  }

  // Returns the string description which depends on the string variation factor values
  getDescription() /*: string */ {
    throw errorAt(this.node, 'not implemented yet');
  }

  /**
   * Create a new class instance given a BabelNode root node.
   * If that node is incompatible, we'll just return `null`.
   */
  static fromBabelNode({
    moduleName,
    node,
  } /*: {|
    moduleName: JSModuleNameType,
    node: BabelNode,
  |} */) /*: ?FbtElementNode */ {
    if (!isCallExpression(node)) {
      return null;
    }
    const fbtElement = new FbtElementNode({
      moduleName,
      node,
    });
    const {arguments: [fbtContentsNode]} = node;

    if (!isArrayExpression(fbtContentsNode)) {
      throw errorAt(
        node,
        `${moduleName}: expected callsite's first argument to be an array`,
      );
    }

    for (const elementChild of (fbtContentsNode.elements || [])) {
      if (elementChild == null) {
        throw errorAt(node, `${moduleName}: elementChild must not be nullish`);
      }
      if (isSpreadElement(elementChild)) {
        throw errorAt(elementChild, `Array spread syntax is not supported`);
      }
      fbtElement.appendChild(this.createChildNode({
        moduleName,
        node: elementChild,
      }));
    }
    return fbtElement;
  }

  /**
   * Create a child fbt node for a given BabelNode.
   */
  static createChildNode({
    moduleName,
    node,
  } /*: {|
    moduleName: JSModuleNameType,
    node: BabelNodeExpression,
  |} */) /*: FbtChildNode */ {
    // Some of these modules may cause dependency cycles with the current one.
    // So we must import them only on-demand rather than on initialization.
    // Don't worry, require() calls are cached.
    const FbtEnumNode = require('./FbtEnumNode');
    const FbtImplicitParamNode = require('./FbtImplicitParamNode');
    const FbtNameNode = require('./FbtNameNode');
    const FbtParamNode = require('./FbtParamNode');
    const FbtPluralNode = require('./FbtPluralNode');
    const FbtPronounNode = require('./FbtPronounNode');
    const FbtSameParamNode = require('./FbtSameParamNode');
    const FbtTextNode = require('./FbtTextNode');

    let fbtChildNode;
    const fbtChildNodeClasses = [
      FbtEnumNode,
      FbtNameNode,
      FbtParamNode,
      FbtPluralNode,
      FbtPronounNode,
      FbtSameParamNode,
      FbtTextNode,
    ];

    for (const Constructor of fbtChildNodeClasses) {
      fbtChildNode = Constructor.fromBabelNode({moduleName, node});
      if (fbtChildNode != null) {
        break;
      }
    }

    // Try to convert to FbtImplicitParamNode as a last resort
    if (fbtChildNode == null && isJSXElement(node)) {
      // Later on, we should only allow non-fbt JSX elements here for auto-wrapping.
      // fbt:param, fbt:pronoun, etc... should appear as children of it.
      fbtChildNode = FbtImplicitParamNode.fromBabelNode({moduleName, node});
    }

    if (fbtChildNode != null) {
      return fbtChildNode;
    }
    throw errorAt(node, `${moduleName}: unsupported babel node: ${node.type}`);
  }
}
// $FlowFixMe[cannot-write] Needed because node.js v10 does not support static constants on classes
FbtElementNode.type = 'element';

module.exports = FbtElementNode;
