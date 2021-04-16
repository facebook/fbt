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
// proxy the fbt-subject: genderValue

/*::
import type {GenderStringVariationArg} from './FbtArguments';
import type {
  FbtChildNode,
} from './FbtNode';
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';
*/

const {
  convertToStringArrayNodeIfNeeded,
  errorAt,
} = require('../FbtUtil');
const FbtElementNode = require('./FbtElementNode');
const FbtNode = require('./FbtNode');
const FbtTextNode = require('./FbtTextNode');
const {
  isBinaryExpression,
  isJSXElement,
  isStringLiteral,
  isTemplateLiteral,
} = require('@babel/types');

/**
 * Represents non-fbt JSX element nested inside an fbt callsite.
 */
class FbtImplicitParamNode
  extends FbtNode /*:: <GenderStringVariationArg, BabelNodeJSXElement, FbtChildNode> */ {

  /*:: static +type: 'implicitElement'; */

  getProject() /*: string */ {
    throw errorAt(this.node, 'not implemented yet');
  }

  // Returns the string description which depends on the string variation factor values
  getDescription() /*: string */ {
    throw errorAt(this.node, 'not implemented yet');
  }

  _getTokenName() /*: ?string */ {
    throw errorAt(this.node, 'not implemented yet');
  }

  getSubjectNode() /*: ?BabelNode */ {
    throw errorAt(this.node, 'not implemented yet');
  }

  /**
   * Create a new class instance given a BabelNode root node.
   * If that node is incompatible, we'll just return `null`.
   */
  static fromBabelNode({
    moduleName,
    node,
  } /*: FromBabelNodeFunctionArgs */) /*: ?FbtImplicitParamNode */ {
    if (!isJSXElement(node)) {
      return null;
    }
    const implicitElement = new FbtImplicitParamNode({
      moduleName,
      node,
    });

    const fbtChildren /*: Array<?FbtChildNode> */ = [];
    for (const child of node.children) {
      switch (child.type) {
        case 'JSXText':
          fbtChildren.push(
            FbtTextNode.fromBabelNode({moduleName, node: child})
          );
          break;

        case 'JSXExpressionContainer': {
          const {expression} = child;
          if (isBinaryExpression(expression) || isStringLiteral(expression) ||
            isTemplateLiteral(expression)) {
            const elements = convertToStringArrayNodeIfNeeded(moduleName, expression).elements ||
              ([] /*: Array<null> */);

            elements.forEach(elem => {
              if (elem == null) {
                return;
              }
              if (elem.type !== 'StringLiteral') {
                throw errorAt(
                  child,
                  `${moduleName}: only string literals ` +
                  `(or concatenations of string literals) are supported inside JSX expressions, ` +
                  `but we found the node type "${elem.type}" instead.`,
                  {suggestOSSWebsite: true},
                );
              }
              fbtChildren.push(
                FbtElementNode.createChildNode({moduleName, node: elem})
              );
            });
            continue;
          }

          if (expression.type === 'JSXEmptyExpression') {
            // usually, it's a comment inside a JSX expression
            continue;
          }

          fbtChildren.push(
            FbtElementNode.createChildNode({moduleName, node: expression})
          );
          break;
        }

        case 'JSXElement': {
          fbtChildren.push(
            FbtElementNode.createChildNode({moduleName, node: child})
          );
          break;
        }

        default:
          throw errorAt(child, `${moduleName}: unsupported babel node: ${child.type}`,
            {suggestOSSWebsite: true});
      }
    }

    fbtChildren.forEach(implicitElement.appendChild, implicitElement);
    return implicitElement;
  }
}
// $FlowFixMe[cannot-write] Needed because node.js v10 does not support static constants on classes
FbtImplicitParamNode.type = 'implicitElement';

module.exports = FbtImplicitParamNode;
