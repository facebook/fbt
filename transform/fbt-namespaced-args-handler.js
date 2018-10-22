/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Fbt JSX namespaced elements handler.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p babel_plugin_fbt --remote localhost:~/www
 *
 * @emails oncall+internationalization
 * @format
 */
'use strict';

/* eslint fb-www/comma-dangle: "off" */
// See explaination in /js/fb-transforms/babel-7/babel-plugin-fbt/index.js

const autoWrap = require('./fbt-auto-wrap');
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
  expandStringConcat,
  filterEmptyNodes,
  getAttributeByNameOrThrow,
  getOptionsFromAttributes,
  normalizeSpaces,
  throwAt,
} = require('./FbtUtil');

const getArgs = function(moduleName, t) {
  return {
    /**
     * Node that is a child of a <fbt> node that should be handled as
     * <fbt:param>
     */
    implicitParamMarker(node) {
      const newNode = autoWrap.wrapImplicitFBTParam(moduleName, t, node);
      return [t.stringLiteral('=' + newNode.paramName), newNode];
    },

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

      let paramChildren = filterEmptyNodes(node.children).filter(function(
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
          t.jsxExpressionContainer(t.stringLiteral(node.children[0].value)),
        ];
      }

      if (paramChildren.length !== 1) {
        throwAt(
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
      const pluralChildren = children.filter(function(child) {
        return (
          child.type === 'JSXText' || child.type === 'JSXExpressionContainer'
        );
      });
      if (pluralChildren.length !== 1) {
        throwAt(
          node,
          `${moduleName}:plural expects text or an expression, and only one`,
        );
      }
      const singularNode = pluralChildren[0];
      const singularText = expandStringConcat(
        moduleName,
        t,
        singularNode.expression || singularNode,
      );
      const singularArg = t.stringLiteral(
        normalizeSpaces(singularText.value).trimRight(),
      );
      return [singularArg, countAttr.expression, options];
    },

    /**
     * <fbt:pronoun> or <FbtPronoun>
     */
    pronoun(node) {
      if (!node.openingElement.selfClosing) {
        throwAt(node, `${moduleName}:pronoun must be a self-closing element`);
      }

      const attributes = node.openingElement.attributes;

      const typeAttr = getAttributeByNameOrThrow(attributes, 'type').value;
      if (typeAttr.type !== 'StringLiteral') {
        throwAt(
          node,
          `${moduleName}:pronoun attribute "type" must have StringLiteral content`,
        );
      }
      if (!ValidPronounUsages.hasOwnProperty(typeAttr.value)) {
        throwAt(
          node,
          `${moduleName}:pronoun attribute "type" must be one of [` +
            Object.keys(ValidPronounUsages) +
            ']',
        );
      }
      const result = [t.stringLiteral(typeAttr.value)];

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
      const genderAttribute = getAttributeByNameOrThrow(attributes, 'gender')
        .value;

      const children = filterEmptyNodes(node.children);
      const nameChildren = children.filter(function(child) {
        return (
          child.type === 'JSXText' || child.type === 'JSXExpressionContainer'
        );
      });
      if (nameChildren.length !== 1) {
        throwAt(
          node,
          `${moduleName}:name expects text or an expression, and only one`,
        );
      }

      let singularArg = nameChildren[0].expression || nameChildren[0];
      if (singularArg.type === 'JSXText') {
        singularArg = t.stringLiteral(normalizeSpaces(singularArg.value));
      }

      return [nameAttribute, singularArg, genderAttribute.expression];
    },

    /**
     * <fbt:same-param> or <FbtSameParam>
     */
    sameParam(node) {
      if (!node.openingElement.selfClosing) {
        throwAt(node, `Expected ${moduleName}:same-param to be selfClosing.`);
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
        throwAt(node, `Expected ${moduleName}:enum to be selfClosing.`);
      }

      const rangeAttr = getAttributeByNameOrThrow(
        node.openingElement.attributes,
        'enum-range',
      );

      if (rangeAttr.value.type !== 'JSXExpressionContainer') {
        throwAt(
          node,
          'Expected JSX Expression for enum-range attribute but got ' +
            rangeAttr.value.type,
        );
      }

      const valueAttr = getAttributeByNameOrThrow(
        node.openingElement.attributes,
        'value',
      );

      if (valueAttr.value.type !== 'JSXExpressionContainer') {
        throwAt(
          node,
          `Expected value attribute of <${moduleName}:enum> to be an expression ` +
            `but got ${valueAttr.value.type}`,
        );
      }

      return [valueAttr.value.expression, rangeAttr.value.expression];
    },
  };
};

module.exports.getArgs = getArgs;
