/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+i18n_fbt_js
 * @flow
 */

/*eslint max-len: ["error", 100]*/

'use strict';

import type {JSModuleNameType} from '../FbtConstants';
import type {NodePathOf} from '@babel/core';
import typeof BabelTypes from '@babel/types';

type NodePath = NodePathOf<BabelNodeJSXElement>;
type BabelNodeJSXElementChild = $ElementType<
  $PropertyType<BabelNodeJSXElement, 'children'>,
  number,
>;

const FbtCommon = require('../FbtCommon');
const {
  FbtCallMustHaveAtLeastOneOfTheseAttributes,
  FbtRequiredAttributes,
  ValidFbtOptions,
} = require('../FbtConstants');
const FbtNodeChecker = require('../FbtNodeChecker');
const {
  convertToStringArrayNodeIfNeeded,
  errorAt,
  expandStringConcat,
  filterEmptyNodes,
  getAttributeByName,
  getAttributeByNameOrThrow,
  getOptionsFromAttributes,
  normalizeSpaces,
  validateNamespacedFbtElement,
  varDump,
} = require('../FbtUtil');
const getNamespacedArgs = require('../getNamespacedArgs');
const {
  arrayExpression,
  callExpression,
  identifier,
  isCallExpression,
  isJSXElement,
  isStringLiteral,
  jsxExpressionContainer,
  memberExpression,
  stringLiteral,
} = require('@babel/types');
const invariant = require('invariant');

class JSXFbtProcessor {
  moduleName: JSModuleNameType;
  node: $PropertyType<NodePath, 'node'>;
  nodeChecker: FbtNodeChecker;
  path: NodePath;
  t: BabelTypes;
  _openingElementAttributes: ?$ReadOnlyArray<BabelNodeJSXAttribute>;

  constructor({
    babelTypes,
    nodeChecker,
    path,
  }: {
    babelTypes: BabelTypes,
    nodeChecker: FbtNodeChecker,
    path: NodePath,
  }): void {
    this.moduleName = nodeChecker.moduleName;
    this.node = path.node;
    this.nodeChecker = nodeChecker;
    this.path = path;
    this.t = babelTypes;
  }

  static create({
    babelTypes,
    path,
  }: {
    babelTypes: BabelTypes,
    path: NodePath,
  }): ?JSXFbtProcessor {
    const nodeChecker = FbtNodeChecker.forJSXFbt(path.node);
    return nodeChecker != null
      ? new JSXFbtProcessor({
          babelTypes,
          nodeChecker,
          path,
        })
      : null;
  }

  _getText(
    childNodes: $ReadOnlyArray<
      BabelNodeCallExpression | BabelNodeJSXElement | BabelNodeStringLiteral,
    >,
  ): BabelNodeArrayExpression {
    return convertToStringArrayNodeIfNeeded(
      this.moduleName,
      arrayExpression(childNodes),
    );
  }

  _getDescription(texts: BabelNodeArrayExpression) {
    const {moduleName, node} = this;
    const commonAttributeValue = this._getCommonAttributeValue();
    let desc;

    // TODO(T83043301) create an <fbt common={true}> test case in the JSX fbt test suite
    if (commonAttributeValue && commonAttributeValue.value) {
      const rawTextValue = (texts.elements || [])
        .map(stringNode => {
          try {
            invariant(
              isStringLiteral(stringNode),
              'Expected a StringLiteral but found `%s` instead',
              stringNode?.type || 'unknown',
            );
            return stringNode.value;
          } catch (error) {
            throw errorAt(stringNode, error.message);
          }
        })
        .join('');

      const textValue = normalizeSpaces(rawTextValue).trim();
      const descValue = FbtCommon.getDesc(textValue);
      if (descValue == null || descValue === '') {
        throw errorAt(
          node,
          FbtCommon.getUnknownCommonStringErrorMessage(moduleName, textValue),
        );
      }
      if (getAttributeByName(this._getOpeningElementAttributes(), 'desc')) {
        throw errorAt(
          node,
          `<${moduleName} common={true}> must not have "desc" attribute`,
        );
      }
      desc = stringLiteral(descValue);
    } else {
      desc = this._getDescAttributeValue();
    }
    return desc;
  }

  _getOptions() {
    // Optional attributes to be passed as options.
    const attrs = this._getOpeningElementAttributes();
    this._assertHasMandatoryAttributes();
    return attrs.length > 1
      ? getOptionsFromAttributes(
          this.t,
          attrs,
          ValidFbtOptions,
          FbtRequiredAttributes,
        )
      : null;
  }

  _getOpeningElementAttributes(): $ReadOnlyArray<BabelNodeJSXAttribute> {
    if (this._openingElementAttributes != null) {
      return this._openingElementAttributes;
    }

    const {node} = this;
    this._openingElementAttributes = node.openingElement.attributes.map(
      attribute => {
        if (attribute.type === 'JSXSpreadAttribute') {
          throw errorAt(
            node,
            `<${this.moduleName}> does not support JSX spread attribute`,
          );
        }
        return attribute;
      },
    );
    return this._openingElementAttributes;
  }

  _assertHasMandatoryAttributes() {
    if (
      this._getOpeningElementAttributes().find(attribute =>
        FbtCallMustHaveAtLeastOneOfTheseAttributes.includes(
          attribute.name.name,
        ),
      ) == null
    ) {
      throw errorAt(
        this.node,
        `<${this.moduleName}> must have at least ` +
          `one of these attributes: ${FbtCallMustHaveAtLeastOneOfTheseAttributes.join(
            ', ',
          )}`,
      );
    }
  }

  _createFbtFunctionCallNode({text, desc, options}) {
    const {moduleName, node, path} = this;
    invariant(text != null, 'text cannot be null');
    invariant(desc != null, 'desc cannot be null');
    const args = [text, desc];

    if (options != null) {
      args.push(options);
    }

    const callNode = callExpression(identifier(moduleName), args);
    callNode.loc = node.loc;

    if (isJSXElement(path.parent)) {
      const ret = jsxExpressionContainer(callNode);
      ret.loc = node.loc;
      return ret;
    }
    return callNode;
  }

  _assertNoNestedFbts() {
    this.nodeChecker.assertNoNestedFbts(this.node);
  }

  _transformChildrenForFbtCallSyntax(): Array<
    BabelNodeCallExpression | BabelNodeJSXElement | BabelNodeStringLiteral,
  > {
    this.path.traverse(jsxFbtConstructToFunctionalFormTransform, {
      moduleName: this.moduleName,
    });
    return (filterEmptyNodes(
      this.node.children,
    ): $ReadOnlyArray<BabelNodeJSXElementChild>).map(node => {
      try {
        switch (node.type) {
          case 'JSXElement':
            // This should already be a simple JSX element (non-fbt construct)
            return node;
          case 'JSXText':
            return stringLiteral(normalizeSpaces(node.value));
          case 'JSXExpressionContainer': {
            const {expression} = node;

            if (
              this.nodeChecker.getFbtConstructNameFromFunctionCall(
                expression,
              ) != null
            ) {
              // preserve fbt construct's function calls intact
              invariant(
                isCallExpression(expression),
                'Expected BabelNodeCallExpression value but received `%s` (%s)',
                varDump(expression),
                typeof expression,
              );
              return expression;
            }

            // otherwise, assume that we have textual nodes to return
            return stringLiteral(
              normalizeSpaces(
                expandStringConcat(this.moduleName, node.expression).value,
              ),
            );
          }
          default:
            throw errorAt(
              node,
              `Unsupported JSX element child type '${node.type}'`,
            );
        }
      } catch (error) {
        throw errorAt(node, error.message);
      }
    });
  }

  _getDescAttributeValue() {
    const {moduleName} = this;
    const descAttr = getAttributeByNameOrThrow(
      this._getOpeningElementAttributes(),
      'desc',
    );
    const {node} = this;
    if (!descAttr || descAttr.value == null) {
      throw errorAt(node, `<${moduleName}> requires a "desc" attribute`);
    }
    switch (descAttr.value.type) {
      case 'JSXExpressionContainer':
        // @babel/parser should not allow this scenario normally
        invariant(
          descAttr.value.expression.type !== 'JSXEmptyExpression',
          'unexpected',
        );
        return descAttr.value.expression;
      case 'StringLiteral':
        return descAttr.value;
    }
    throw errorAt(
      node,
      `<${moduleName}> "desc" attribute must be a string literal ` +
        `or a non-empty JSX expression`,
    );
  }

  _getCommonAttributeValue() {
    const commonAttr = getAttributeByName(
      this._getOpeningElementAttributes(),
      'common',
    );
    const commonAttrValue = commonAttr && commonAttr.value;
    if (!commonAttrValue) {
      return null;
    }
    if (commonAttrValue.type === 'JSXExpressionContainer') {
      const expression = commonAttrValue.expression;
      if (expression.type === 'BooleanLiteral') {
        return expression;
      }
    }

    throw new Error(
      `\`common\` attribute for <${this.moduleName}> requires boolean literal`,
    );
  }

  /**
   * This method mutates the current Babel node
   */
  convertToFbtFunctionCallNode(_phraseIndex: number): void {
    this._assertNoNestedFbts();
    const children = this._transformChildrenForFbtCallSyntax();
    const text = this._getText(children);
    const description = this._getDescription(text);

    this.path.replaceWith(
      this._createFbtFunctionCallNode({
        text,
        desc: description,
        options: this._getOptions(),
      }),
    );
  }
}

/**
 * Traverse all JSXElements, replace those that are JSX fbt constructs (e.g. <fbt:param>)
 * to their functional form equivalents (e.g. fbt.param()).
 */
const jsxFbtConstructToFunctionalFormTransform = {
  JSXElement(path: NodePathOf<BabelNodeJSXElement>) {
    const {node} = path;
    const moduleName = (this.moduleName: JSModuleNameType);
    const name = validateNamespacedFbtElement(
      moduleName,
      node.openingElement.name,
    );
    if (name !== 'implicitParamMarker') {
      const args = getNamespacedArgs(moduleName)[name](node);
      let fbtConstructCall = callExpression(
        memberExpression(identifier(moduleName), identifier(name), false),
        args,
      );
      if (isJSXElement(path.parent)) {
        fbtConstructCall = jsxExpressionContainer(fbtConstructCall);
      }
      path.replaceWith(fbtConstructCall);
    }
  },
};

module.exports = JSXFbtProcessor;
