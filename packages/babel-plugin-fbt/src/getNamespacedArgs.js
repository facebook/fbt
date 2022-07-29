/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * Fbt JSX namespaced elements handler.
 *
 * Disabling typing since this file will be deprecated by the fbt-autoparam project
 *
 * @format
 * @noflow
 * @oncall i18n_fbt_js
 */
'use strict';

/* eslint fb-www/comma-dangle: "off" */
// See explanation in ./index.js

const {
  PluralOptions,
  PluralRequiredAttributes,
  PronounRequiredAttributes,
  RequiredParamOptions,
  ValidParamOptions,
  ValidPronounOptions,
  ValidPronounUsages,
} = require('./FbtConstants');
const {
  errorAt,
  expandStringConcat,
  filterEmptyNodes,
  getAttributeByNameOrThrow,
  getOptionsFromAttributes,
  normalizeSpaces,
} = require('./FbtUtil');
const t = require('@babel/types');
const {jsxExpressionContainer, stringLiteral} = t;

const getNamespacedArgs = function (moduleName) {
  return {
    /**
     * <fbt:param> or <FbtParam>
     */
    param(node) {
      const attributes = node.openingElement.attributes;
      const nameAttr = getAttributeByNameOrThrow(attributes, 'name');
      const options = getOptionsFromAttributes(
        t,
        attributes,
        ValidParamOptions,
        RequiredParamOptions,
      );

      let paramChildren = filterEmptyNodes(node.children).filter(function (
        child,
      ) {
        return (
          child.type === 'JSXExpressionContainer' || child.type === 'JSXElement'
        );
      });

      // <fbt:param> </fbt:param>
      // should be the equivalent of
      // <fbt:param>{' '}</fbt:param>
      if (
        paramChildren.length === 0 &&
        node.children.length === 1 &&
        node.children[0].type === 'JSXText' &&
        node.children[0].value === ' '
      ) {
        paramChildren = [
          jsxExpressionContainer(stringLiteral(node.children[0].value)),
        ];
      }

      if (paramChildren.length !== 1) {
        throw errorAt(
          node,
          `${moduleName}:param expects an {expression} or JSX element, and only one`,
        );
      }

      const nameAttrValue = nameAttr.value;
      if (nameAttrValue.loc.end.line > nameAttrValue.loc.start.line) {
        nameAttrValue.value = normalizeSpaces(nameAttrValue.value);
      }
      const paramArgs = [
        nameAttrValue,
        paramChildren[0].expression || paramChildren[0],
      ];

      if (options.properties.length > 0) {
        paramArgs.push(options);
      }

      return paramArgs;
    },

    /**
     * <fbt:plural> or <FbtPlural>
     */
    plural(node) {
      const attributes = node.openingElement.attributes;
      const options = getOptionsFromAttributes(
        t,
        attributes,
        PluralOptions,
        PluralRequiredAttributes,
      );
      const countAttr = getAttributeByNameOrThrow(attributes, 'count').value;
      const children = filterEmptyNodes(node.children);
      const pluralChildren = children.filter(function (child) {
        return (
          child.type === 'JSXText' || child.type === 'JSXExpressionContainer'
        );
      });
      if (pluralChildren.length !== 1) {
        throw errorAt(
          node,
          `${moduleName}:plural expects text or an expression, and only one`,
        );
      }
      const singularNode = pluralChildren[0];
      const singularText = expandStringConcat(
        moduleName,
        singularNode.expression || singularNode,
      );
      const singularArg = stringLiteral(
        normalizeSpaces(singularText.value).trimRight(),
      );
      return [singularArg, countAttr.expression, options];
    },

    /**
     * <fbt:pronoun> or <FbtPronoun>
     */
    pronoun(node) {
      if (!node.openingElement.selfClosing) {
        throw errorAt(
          node,
          `${moduleName}:pronoun must be a self-closing element`,
        );
      }

      const attributes = node.openingElement.attributes;

      const typeAttr = getAttributeByNameOrThrow(attributes, 'type').value;
      if (typeAttr.type !== 'StringLiteral') {
        throw errorAt(
          node,
          `${moduleName}:pronoun attribute "type" must have StringLiteral content`,
        );
      }
      if (!ValidPronounUsages.hasOwnProperty(typeAttr.value)) {
        throw errorAt(
          node,
          `${moduleName}:pronoun attribute "type" must be one of [` +
            Object.keys(ValidPronounUsages) +
            ']',
        );
      }
      const result = [stringLiteral(typeAttr.value)];

      const genderExpr = getAttributeByNameOrThrow(attributes, 'gender').value;
      result.push(genderExpr.expression);

      const options = getOptionsFromAttributes(
        t,
        attributes,
        ValidPronounOptions,
        PronounRequiredAttributes,
      );
      if (0 < options.properties.length) {
        result.push(options);
      }

      return result;
    },

    /**
     * <fbt:name> or <FbtName>
     */
    name(node) {
      const attributes = node.openingElement.attributes;
      const nameAttribute = getAttributeByNameOrThrow(attributes, 'name').value;
      const genderAttribute = getAttributeByNameOrThrow(
        attributes,
        'gender',
      ).value;

      const children = filterEmptyNodes(node.children);
      const nameChildren = children.filter(function (child) {
        return (
          child.type === 'JSXText' || child.type === 'JSXExpressionContainer'
        );
      });
      if (nameChildren.length !== 1) {
        throw errorAt(
          node,
          `${moduleName}:name expects text or an expression, and only one`,
        );
      }

      let singularArg = nameChildren[0].expression || nameChildren[0];
      if (singularArg.type === 'JSXText') {
        singularArg = stringLiteral(normalizeSpaces(singularArg.value));
      }

      return [nameAttribute, singularArg, genderAttribute.expression];
    },

    /**
     * <fbt:same-param> or <FbtSameParam>
     */
    sameParam(node) {
      if (!node.openingElement.selfClosing) {
        throw errorAt(
          node,
          `Expected ${moduleName}:same-param to be selfClosing.`,
        );
      }

      const nameAttr = getAttributeByNameOrThrow(
        node.openingElement.attributes,
        'name',
      );

      return [nameAttr.value];
    },

    /**
     * <fbt:enum> or <FbtEnum>
     */
    enum(node) {
      if (!node.openingElement.selfClosing) {
        throw errorAt(node, `Expected ${moduleName}:enum to be selfClosing.`);
      }

      const rangeAttr = getAttributeByNameOrThrow(
        node.openingElement.attributes,
        'enum-range',
      );

      if (rangeAttr.value.type !== 'JSXExpressionContainer') {
        throw errorAt(
          node,
          'Expected JSX Expression for enum-range attribute but got ' +
            rangeAttr.value.type,
        );
      }

      const valueAttr = getAttributeByNameOrThrow(
        node.openingElement.attributes,
        'value',
      );

      if (valueAttr.value.type === 'JSXExpressionContainer') {
        return [valueAttr.value.expression, rangeAttr.value.expression];
      } else if (valueAttr.value.type === 'StringLiteral') {
        return [valueAttr.value, rangeAttr.value.expression];
      }

      throw errorAt(
        node,
        `Expected value attribute of <${moduleName}:enum> to be an expression ` +
          `but got ${valueAttr.value.type}`,
      );
    },
  };
};

module.exports = getNamespacedArgs;
