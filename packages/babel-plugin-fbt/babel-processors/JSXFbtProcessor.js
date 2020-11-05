/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/

'use strict';

/*::
import type {
  JSModuleNameType,
} from '../FbtConstants';
import type {
  FbtBabelNodeCallExpression,
  FbtBabelNodeJSXElement,
  FbtBabelNodeShape,
} from '../index.js';
import type {NodePathOf} from '@babel/core';
import typeof BabelTypes from '@babel/types';

type NodePath = NodePathOf<FbtBabelNodeJSXElement>;
type FbtBabelNodeJSXElementChild = $ElementType<
  $PropertyType<FbtBabelNodeJSXElement, 'children'>,
  number,
>;
*/

const FbtAutoWrap = require('../FbtAutoWrap');
const FbtCommon = require('../FbtCommon');
const {
  FbtCallMustHaveAtLeastOneOfTheseAttributes,
  FbtRequiredAttributes,
  ValidFbtOptions,
} = require('../FbtConstants');
const FbtNodeChecker = require('../FbtNodeChecker');
const {
  errorAt,
  expandStringConcat,
  filterEmptyNodes,
  getAttributeByName,
  getAttributeByNameOrThrow,
  getOptionsFromAttributes,
  normalizeSpaces,
  validateNamespacedFbtElement,
} = require('../FbtUtil');
const getNamespacedArgs = require('../getNamespacedArgs');
const {
  binaryExpression,
  callExpression,
  identifier,
  isJSXElement,
  jsxExpressionContainer,
  memberExpression,
  stringLiteral,
} = require('@babel/types');
const invariant = require('invariant');

class JSXFbtProcessor {
  /*:: moduleName: JSModuleNameType; */
  /*:: node: $PropertyType<NodePath, 'node'>; */
  /*:: nodeChecker: FbtNodeChecker; */
  /*:: path: NodePath; */
  /*:: t: BabelTypes; */
  /*:: _openingElementAttributes: ?$ReadOnlyArray<BabelNodeJSXAttribute>; */

  constructor({
    babelTypes,
    nodeChecker,
    path,
  } /*: {
    babelTypes: BabelTypes,
    nodeChecker: FbtNodeChecker,
    path: NodePath,
  }*/) /*: void */ {
    this.moduleName = nodeChecker.moduleName;
    this.node = path.node;
    this.nodeChecker = nodeChecker;
    this.path = path;
    this.t = babelTypes;
  }

  static create({
    babelTypes,
    path,
  } /*: {
    babelTypes: BabelTypes,
    path: NodePath,
  } */) /*: ?JSXFbtProcessor */ {
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
    childNodes /*: $ReadOnlyArray<BabelNodeStringLiteral | BabelNodeCallExpression> */
  ) /*: BabelNodeBinaryExpression | BabelNodeStringLiteral | BabelNodeCallExpression */ {
    return childNodes.length > 1
      ? this._createConcatFromExpressions(childNodes)
      : childNodes[0];
  }

  _getDescription(text) {
    const {moduleName, node} = this;
    const commonAttributeValue = this._getCommonAttributeValue();
    let desc;
    if (commonAttributeValue && commonAttributeValue.value) {
      const textValue = normalizeSpaces(
        expandStringConcat(moduleName, text).value.trim(),
      );
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

  _getOpeningElementAttributes() /*: $ReadOnlyArray<BabelNodeJSXAttribute> */ {
    if (this._openingElementAttributes != null) {
      return this._openingElementAttributes;
    }

    const {node} = this;
    this._openingElementAttributes = node.openingElement.attributes.map(attribute => {
      if (attribute.type === 'JSXSpreadAttribute') {
        throw errorAt(node, `<${this.moduleName}> does not support JSX spread attribute`);
      }
      return attribute;
    });
    return this._openingElementAttributes;
  }

  _assertHasMandatoryAttributes() {
    if (this._getOpeningElementAttributes().find(
      attribute => FbtCallMustHaveAtLeastOneOfTheseAttributes.includes(attribute.name.name)
    ) == null) {
      throw errorAt(this.node,
        `<${this.moduleName}> must have at least one of these attributes: ${
          FbtCallMustHaveAtLeastOneOfTheseAttributes.join(', ')
        }`);
    }
  }

  _createFbtFunctionCallNode({text, desc, options}) {
    const {
      moduleName,
      node,
      path,
    } = this;
    invariant(text != null, 'text cannot be null');
    invariant(desc != null, 'desc cannot be null');
    const args = [text, desc];

    if (options != null) {
      args.push(options);
    }

    // callExpression() only returns a BabelNodeCallExpression but we need to
    // customize it as an FbtBabelNodeCallExpression
    const callNode = ((callExpression(
      identifier(moduleName),
      args,
    ) /*: $FlowExpectedError */) /*: FbtBabelNodeCallExpression */);

    callNode.loc = node.loc;
    callNode.parentIndex = node.parentIndex;

    if (isJSXElement(path.parent)) {
      // jsxExpressionContainer() only returns a BabelNodeJSXElement but we need to
      // customize it as an FbtBabelNodeJSXElement
      const ret = ((jsxExpressionContainer(
        callNode,
      ) /*: $FlowExpectedError */) /*: FbtBabelNodeJSXElement */);

      ret.loc = node.loc;
      ret.parentIndex = node.parentIndex;
      return ret;
    }
    return callNode;
  }

  _assertNoNestedFbts() {
    this.nodeChecker.assertNoNestedFbts(this.node);
  }

  _isImplicitFbt() {
    return !!this.node.implicitFbt;
  }

  _addImplicitDescriptionsToChildrenRecursively() {
    FbtAutoWrap.createImplicitDescriptions(this.moduleName, this.node);
    return this;
  }

  /**
   * Given a node, and its index location in phrases, any children of the given
   * node that are implicit are given their parent's location. This can then
   * be used to link the inner strings with their enclosing string.
   */
  _setPhraseIndexOnImplicitChildren(phraseIndex /*: number */) /*: this */ {
    const children = this.node.children;
    // Flow checks fail when using the syntax below. See P129890692
    // const {children} = this.node;
    if (!children) {
      return this;
    }
    for (let i = 0; i < children.length; ++i) {
      // $FlowFixMe fbt BabelNode custom property
      const child /*: FbtBabelNodeShape */ = children[i];
      if (child.implicitDesc != null && child.implicitDesc !== '') {
        child.parentIndex = phraseIndex;
      }
    }
    return this;
  }

  _transformChildrenToFbtCalls() /*: Array<BabelNodeStringLiteral | BabelNodeCallExpression> */ {
    return (
      filterEmptyNodes(this.node.children) /*: $ReadOnlyArray<FbtBabelNodeJSXElementChild> */
    ).map(
      node => this._transformNamespacedFbtElement(node)
    );
  }

  /**
   * Transform a namespaced fbt JSXElement (or its React equivalent) into a
   * method call. E.g. `<fbt:param>` or <FbtParam> to `fbt.param()`
   */
  _transformNamespacedFbtElement(node) {
    switch (node.type) {
      case 'JSXElement':
        return this._toFbtNamespacedCall(node);
      case 'JSXText':
        return stringLiteral(normalizeSpaces(node.value));
      case 'JSXExpressionContainer':
        return stringLiteral(
          normalizeSpaces(
            expandStringConcat(this.moduleName, node.expression).value,
          ),
        );
      default:
        throw errorAt(node, `Unknown namespace fbt type ${node.type}`);
    }
  }

  // WARNING: this method has side-effects because it alters the given `node` object
  // You shouldn't try to run this multiple times on the same `node`.
  _toFbtNamespacedCall(node) {
    const {moduleName} = this;

    let name = validateNamespacedFbtElement(
      moduleName,
      node.openingElement.name,
    );
    const args = getNamespacedArgs(moduleName)[name](node);
    if (name == 'implicitParamMarker') {
      name = 'param';
    }
    return callExpression(
      memberExpression(identifier(moduleName), identifier(name), false),
      args,
    );
  }

  /**
   * Given an array of nodes, recursively construct a concatenation of all these nodes.
   */
  _createConcatFromExpressions(
    nodes /*: $ReadOnlyArray<BabelNodeStringLiteral | BabelNodeCallExpression> */
  ) /*: BabelNodeBinaryExpression */ {
    invariant(nodes.length > 1, 'Cannot create an expression without nodes.');

    // Flow's native type for the array#reduceRight method is incorrect
    // when the array has more than one item AND the callback function returns
    // a different type from the array items' type.
    // See https://fburl.com/07z4y180
    // $FlowExpectedError
    return (nodes.reduceRight(
      // $FlowExpectedError Same reason as above
      (rest, node) => binaryExpression('+', node, rest)
    ) /*: BabelNodeBinaryExpression */);
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
        invariant(descAttr.value.expression.type !== 'JSXEmptyExpression', 'unexpected');
        return descAttr.value.expression;
      case 'StringLiteral':
        return descAttr.value;
    }
    throw errorAt(node, `<${moduleName}> "desc" attribute must be a string literal ` +
      `or a non-empty JSX expression`);
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

  convertToFbtFunctionCallNode(
    phraseIndex /*: number */,
  ) /*: FbtBabelNodeCallExpression | FbtBabelNodeJSXElement */ {
    this._assertNoNestedFbts();
    if (!this._isImplicitFbt()) {
      this._addImplicitDescriptionsToChildrenRecursively();
    }
    this._setPhraseIndexOnImplicitChildren(phraseIndex);
    const children = this._transformChildrenToFbtCalls();
    const text = this._getText(children);
    const description = this._getDescription(text);

    return this._createFbtFunctionCallNode({
      text,
      desc: description,
      options: this._getOptions(),
    });
  }
}

module.exports = JSXFbtProcessor;
