/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

/*eslint max-len: ["error", 100]*/

'use strict';

import type {ParamSet} from '../FbtUtil';
import type {TokenAliases} from '../index';
import type {
  AnyStringVariationArg,
  StringVariationArgsMap,
} from './FbtArguments';
import type {IFbtElementNode} from './FbtElementNode';
import type {AnyFbtNode, FbtChildNode, PlainFbtNode} from './FbtNode';
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';

const {
  convertToStringArrayNodeIfNeeded,
  errorAt,
  setUniqueToken,
  varDump,
} = require('../FbtUtil');
const FbtElementNode = require('./FbtElementNode');
const FbtNode = require('./FbtNode');
const FbtNodeType = require('./FbtNodeType');
const {
  convertIndexInSiblingsArrayToOuterTokenAlias,
  convertToTokenName,
  getChildNodeText,
  getChildNodeTextForDescription,
  getTextFromFbtNodeTree,
  getTokenAliasesFromFbtNodeTree,
} = require('./FbtNodeUtil');
const FbtTextNode = require('./FbtTextNode');
const {
  isBinaryExpression,
  isJSXAttribute,
  isJSXElement,
  isJSXExpressionContainer,
  isJSXIdentifier,
  isNumericLiteral,
  isStringLiteral,
  isTemplateLiteral,
} = require('@babel/types');
const invariant = require('invariant');
const nullthrows = require('nullthrows');

/**
 * Represents non-fbt JSX element nested inside an fbt callsite.
 */
class FbtImplicitParamNode
  extends FbtNode<
    AnyStringVariationArg,
    BabelNodeJSXElement,
    FbtChildNode,
    null,
  >
  implements IFbtElementNode
{
  static +type: FbtNodeType = FbtNodeType.ImplicitParam;

  _tokenSet: ParamSet = {};

  _getElementNode(): FbtElementNode {
    return nullthrows(this.getFirstAncestorOfType(FbtElementNode));
  }

  _getSubjectNode(): ?BabelNode {
    return this._getElementNode().options.subject;
  }

  getOptions(): null {
    return null;
  }

  /**
   * We define an FbtImplicitParamNode's outer token alias to be
   * string concatenation of '=m' + the FbtImplicitParamNode's index in its siblings array.
   *
   * @example For string <fbt> hello <a>world</a></fbt>,
   *          the outer token alias of <a>world</a> will be '=m1'.
   */
  getOuterTokenAlias(): string {
    const index = nullthrows(
      this.parent,
      'Parent node must be defined',
    ).children.indexOf(this);
    invariant(
      index != -1,
      "Could not find current fbt node among the parent node's children",
    );
    return convertIndexInSiblingsArrayToOuterTokenAlias(index);
  }

  getArgsForStringVariationCalc(): $ReadOnlyArray<AnyStringVariationArg> {
    return FbtElementNode.getArgsForStringVariationCalcForFbtElement(
      this,
      // The implicit fbt string may depend on a subject, inferred from the top-level FbtElementNode
      this._getSubjectNode(),
    );
  }

  getText(argsMap: StringVariationArgsMap): string {
    try {
      FbtElementNode.beforeGetTextSanityCheck(this, argsMap);
      return getTextFromFbtNodeTree(
        this,
        argsMap,
        this._getSubjectNode(),
        this._getElementNode().options.preserveWhitespace,
        getChildNodeText,
      );
    } catch (error) {
      throw errorAt(this.node, error);
    }
  }

  getTextForDescription(
    argsMap: StringVariationArgsMap,
    targetFbtNode: FbtImplicitParamNode,
  ): string {
    return getTextFromFbtNodeTree(
      this,
      argsMap,
      this._getSubjectNode(),
      this._getElementNode().options.preserveWhitespace,
      getChildNodeTextForDescription.bind(null, targetFbtNode),
    );
  }

  /**
   * Returns the text of this FbtNode in a "token name" format.
   * Note: it's prefixed by `=` to differentiate normal token names from implicit param nodes.
   *
   * E.g. `=Hello [name]`
   */
  getTokenName(argsMap: StringVariationArgsMap): string {
    return convertToTokenName(
      getTextFromFbtNodeTree(
        this,
        argsMap,
        this._getSubjectNode(),
        this._getElementNode().options.preserveWhitespace,
        (_, child) => child.getText(argsMap),
      ),
    );
  }

  /**
   * Returns the string description which depends on the string variation factor values
   * from the whole fbt callsite.
   */
  getDescription(argsMap: StringVariationArgsMap): string {
    return `In the phrase: "${this._getElementNode().getTextForDescription(
      argsMap,
      this,
    )}"`;
  }

  getTokenAliases(argsMap: StringVariationArgsMap): ?TokenAliases {
    return getTokenAliasesFromFbtNodeTree(this, argsMap);
  }

  /**
   * Returns whether this implicit param node is an ancestor of a given `node`
   */
  isAncestorOf(node: AnyFbtNode): boolean {
    for (let {parent} = node; parent != null; parent = parent.parent) {
      if (parent === this) {
        return true;
      }
    }
    return false;
  }

  /**
   * The fbt._() call generated from an inner string surrounded by JSX tags would
   * inherit extra options specified on its ancestor fbt callsite. Consider this
   * example:
   *
   * <fbt desc='d' myOption='yes'>
   *  This is
   *  <b>
   *    an inner string and
   *    <b>
   *      another inner string
   *    </b>
   *  </b>
   * </fbt>
   *
   * We would generate `fbt._('another inner string', null, {eo: {myOption: 'yes'}})`
   * for the innermost string.
   */
  getExtraOptionsNode(): ?BabelNodeObjectExpression {
    const ancestorFbtElementNode = this.getFirstAncestorOfType(FbtElementNode);
    invariant(
      ancestorFbtElementNode != null,
      'Expect every `FbtImplicitParamNode` to have a `FbtElementNode` ancestor ' +
        'but could not find one for %s',
      varDump(this),
    );
    return ancestorFbtElementNode.getExtraOptionsNode();
  }

  /**
   * Create a new class instance given a BabelNode root node.
   * If that node is incompatible, we'll just return `null`.
   */
  static fromBabelNode({
    moduleName,
    node,
  }: FromBabelNodeFunctionArgs): ?FbtImplicitParamNode {
    if (!isJSXElement(node)) {
      return null;
    }
    const implicitParam = new FbtImplicitParamNode({
      moduleName,
      node,
    });

    const fbtChildren: Array<?FbtChildNode> = [];
    // The last BabelNode child converted to FbtChildNode and added to `fbtChildren`
    let lastAddedChild = null;
    // Keep track of the last whitespace that succeeds a non JSXText child,
    // and we will convert it to a FbtTextNode and add it to `fbtChildren`
    // ONLY IF the succeeding child is a JSXText.
    let unusedWhitespaceChild: ?BabelNodeJSXText = null;
    const firstChild = node.children[0];
    const lastChild = node.children[node.children.length - 1];
    for (const child of node.children) {
      switch (child.type) {
        case 'JSXText':
          // TODO: T38897324 (#32) Fix space normalization.
          // Here we voluntarily ignore white spaces that don't neighbor raw text
          // for the sake of being consistent with the logic in PHP
          if (child.value.trim() === '') {
            if (
              // Do not skip leading and trailing whitespaces
              firstChild !== child &&
              lastChild !== child &&
              lastAddedChild?.type !== 'JSXText'
            ) {
              unusedWhitespaceChild = child;
              break;
            }
          } else if (unusedWhitespaceChild != null) {
            fbtChildren.push(
              FbtTextNode.fromBabelNode({
                moduleName,
                node: unusedWhitespaceChild,
              }),
            );
            unusedWhitespaceChild = null;
          }
          fbtChildren.push(
            FbtTextNode.fromBabelNode({moduleName, node: child}),
          );
          lastAddedChild = child;
          break;

        case 'JSXExpressionContainer': {
          const {expression} = child;
          if (
            isBinaryExpression(expression) ||
            isStringLiteral(expression) ||
            isTemplateLiteral(expression)
          ) {
            const elements =
              convertToStringArrayNodeIfNeeded(moduleName, expression)
                .elements || ([]: Array<null>);

            elements.forEach(elem => {
              if (elem == null) {
                return;
              }
              if (elem.type !== 'StringLiteral') {
                throw errorAt(
                  child,
                  `${moduleName}: only string literals (or concatenations of string literals) ` +
                    `are supported inside JSX expressions, ` +
                    `but we found the node type "${elem.type}" instead.`,
                  {suggestOSSWebsite: true},
                );
              }
              fbtChildren.push(
                FbtElementNode.createChildNode({moduleName, node: elem}),
              );
            });
            unusedWhitespaceChild = null;
            lastAddedChild = child;
            continue;
          }

          if (expression.type === 'JSXEmptyExpression') {
            // usually, it's a comment inside a JSX expression
            continue;
          }

          fbtChildren.push(
            FbtElementNode.createChildNode({moduleName, node: expression}),
          );
          unusedWhitespaceChild = null;
          lastAddedChild = child;
          break;
        }

        case 'JSXElement': {
          fbtChildren.push(
            FbtElementNode.createChildNode({moduleName, node: child}),
          );
          unusedWhitespaceChild = null;
          lastAddedChild = child;
          break;
        }

        default:
          throw errorAt(
            child,
            `${moduleName}: unsupported babel node: ${child.type}`,
            {suggestOSSWebsite: true},
          );
      }
    }

    fbtChildren.forEach(child => implicitParam.appendChild(child));
    return implicitParam;
  }

  registerToken(name: string, source: AnyFbtNode): void {
    setUniqueToken(source.node, this.moduleName, name, this._tokenSet);
  }

  __toJSONForTestsOnly(): mixed {
    const ret = super.__toJSONForTestsOnly();
    return FbtElementNode.__compactTokenSet(ret);
  }

  toPlainFbtNode(): PlainFbtNode {
    const {
      node: {openingElement},
    } = this;
    const wrapperType = openingElement.name;
    invariant(
      isJSXIdentifier(wrapperType),
      'Expected a JSXIdentifier instead of `%s`',
      varDump(wrapperType),
    );

    const props: {[string]: string | number} = {};
    for (const attribute of openingElement.attributes) {
      // Only handling literal attributes. See PlainJSXNode.props flow definition.
      if (isJSXAttribute(attribute) && isJSXIdentifier(attribute.name)) {
        const {name, value} = attribute;
        if (isStringLiteral(value)) {
          props[name.name] = value.value;
        } else if (
          isJSXExpressionContainer(value) &&
          isNumericLiteral(value.expression)
        ) {
          props[name.name] = value.expression.value;
        }
      }
    }

    return {
      type: FbtImplicitParamNode.type,
      wrapperNode: {
        type: wrapperType.name,
        babelNode: openingElement,
        props,
      },
    };
  }
}

module.exports = FbtImplicitParamNode;
