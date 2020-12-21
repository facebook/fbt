/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/
/* eslint-disable fb-www/no-new-error */ // disable www-only linter

'use strict';

/*::
import type {
  FbtOptionValue,
  JSModuleNameType,
} from './FbtConstants';
import typeof BabelTypes from '@babel/types';
type BabelNodeJSXAttributes = $ReadOnlyArray<
  $ElementType<$PropertyType<BabelNodeJSXOpeningElement, 'attributes'>, number>,
>;
type BabelNodeCallExpressionArgument = $ElementType<
  $PropertyType<BabelNodeCallExpression, 'arguments'>,
  number,
>;
export type ParamSet = {[parameterName: string]: ?true};
*/

const {JSModuleName, ModuleNameRegExp} = require('./FbtConstants');
const invariant = require('invariant');
const nullthrows = require('nullthrows');
const {FBS, FBT} = JSModuleName;
const {
  isArrowFunctionExpression,
  isBinaryExpression,
  isBooleanLiteral,
  isJSXAttribute,
  isJSXEmptyExpression,
  isJSXExpressionContainer,
  isJSXIdentifier,
  isJSXNamespacedName,
  isJSXText,
  isObjectProperty,
  isStringLiteral,
  isTemplateLiteral,
  stringLiteral,
} = require('@babel/types');
const {generateFormattedCodeFromAST} = require('fb-babel-plugin-utils/TestUtil');

function normalizeSpaces(
  value /*: string */,
  // TODO(T56277500) set better types for Fbt options object to use `preserveWhitespace?: ?boolean`
  options /*: ?{preserveWhitespace?: ?FbtOptionValue} */,
) /*: string */ {
  if (options && options.preserveWhitespace) {
    return value;
  }
  return value.replace(/\s+/g, ' ');
}

/**
 * Validates allowed children inside <fbt>.
 * Currently allowed:
 *   <fbt:param>, <FbtParam>
 *   <fbt:enum>,  <FbtEnum>
 *   <fbt:name>,  <FbtName>
 * And returns a name of a corresponding handler.
 * If a child is not valid, it is flagged as an Implicit Parameter and is
 * automatically wrapped with <fbt:param>
 * @param node The node that contains the name of any parent node. For
 * example, for a JSXElement, the containing name is the openingElement's name.
 */
function validateNamespacedFbtElement(
  moduleName /*: string */,
  node /*: BabelNode */,
) /*: string */ {
  let valid = false;
  let handlerName;

  // Actual namespaced version, e.g. <fbt:param>
  if (isJSXNamespacedName(node)) {
    handlerName = node.name.name;
    valid =
      isJSXIdentifier(node.namespace) &&
      node.namespace.name === moduleName &&
      (handlerName === 'enum' ||
        handlerName === 'param' ||
        handlerName === 'plural' ||
        handlerName === 'pronoun' ||
        handlerName === 'name' ||
        handlerName === 'same-param');
    // React's version, e.g. <FbtParam>, or <FbtEnum>
  } else if (isJSXIdentifier(node)) {
    handlerName = node.name.substr(3).toLowerCase();
    valid =
      node.name === 'FbtEnum' ||
      node.name === 'FbtParam' ||
      node.name === 'FbtPlural' ||
      node.name === 'FbtPronoun' ||
      node.name === 'FbtName' ||
      node.name === 'FbtSameParam';
  }

  if (!valid) {
    handlerName = 'implicitParamMarker';
  }

  if (handlerName === 'same-param' || handlerName === 'sameparam') {
    handlerName = 'sameParam';
  }

  invariant(handlerName != null, 'handlerName must not be null');
  return handlerName;
}

function isTextualNode(node) {
  if (isStringLiteral(node) || isJSXText(node)) {
    return true;
  } else if (isBinaryExpression(node) && node.operator === '+') {
    return isTextualNode(node.left) && isTextualNode(node.right);
  }
  return false;
}

function setUniqueToken(
  node /*: BabelNode */,
  moduleName /*: string */,
  name /*: string */,
  paramSet /*: ParamSet */,
) /*: void */ {
  if (paramSet[name]) {
    throw errorAt(
      node,
      `There's already a token called "${name}" in this ${moduleName} call. ` +
        `Use ${moduleName}.sameParam if you want to reuse the same token name or ` +
        `give this token a different name`,
    );
  }
  paramSet[name] = true;
}

// TODO(T55535920) type this function
function checkOption(
  option /*: $FlowFixMe */,
  validOptions /*: $FlowFixMe */,
  value /*: $FlowFixMe */,
) /*: $FlowFixMe */ {
  const validValues = validOptions[option];
  if (!validOptions.hasOwnProperty(option) || validValues === undefined) {
    throw errorAt(
      value,
      `Invalid option "${option}". ` +
        `Only allowed: ${Object.keys(validOptions).join(', ')} `,
    );
  } else if (validValues !== true) {
    const valueStr = value && value.value;
    if (!validValues[valueStr]) {
      throw new Error(
        `Invalid value, "${valueStr}" for "${option}". ` +
          `Only allowed: ${Object.keys(validValues).join(', ')}`,
      );
    }
  }
  return option;
}

const SHORT_BOOL_CANDIDATES = {
  common: 'common',
  doNotExtract: 'doNotExtract',
  number: 'number',
  preserveWhitespace: 'preserveWhitespace',
};

function canBeShortBoolAttr(name) {
  return name in SHORT_BOOL_CANDIDATES;
}

/**
 * Build options list form corresponding attributes.
 * TODO(T55535920) type this function
 */
function getOptionsFromAttributes(
  t /*: BabelTypes */,
  attributesNode /*: $FlowFixMe */,
  validOptions /*: $FlowFixMe */,
  ignoredAttrs /*: $FlowFixMe */,
) /*: $FlowFixMe */ {
  const options = [];

  attributesNode.forEach(function(node) {
    const option = node.name.name;

    // Ignored attributes are passed as a separate argument in the fbt(...)
    // call, because they're required. They're not passed as options.
    if (ignoredAttrs[option]) {
      return;
    }

    let value = node.value;
    const name = node.name.name;

    if (canBeShortBoolAttr(name) && value === null) {
      value = t.booleanLiteral(true);
    } else if (isJSXExpressionContainer(value)) {
      value = value.expression;
    } else if (
      isStringLiteral(value) &&
      (value.value === 'true' || value.value === 'false')
    ) {
      value = t.booleanLiteral(value.value === 'true');
    }

    options.push(
      t.objectProperty(
        t.stringLiteral(checkOption(option, validOptions, value)),
        value,
      ),
    );
  });

  return t.objectExpression(options);
}

function errorAt(
  astNode /*: {
    loc: ?BabelNodeSourceLocation,
  } */,
  msg /*: string */,
) /*: Error */ {
  const location = astNode.loc;
  const errorMsg =
    (location != null
      ? `Line ${location.start.line} Column ${location.start.column + 1}: `
      : '') +
    `${msg}\n---\n${generateFormattedCodeFromAST(astNode)}\n---`;
  return new Error(errorMsg);
}

function checkOptions(properties, validOptions) /*: Array<BabelNodeObjectProperty> */ {
  return properties.map(node => {
    if (!isObjectProperty(node)) {
      throw errorAt(node, `options object must contain plain object properties. ` +
        `No method defintions or spread operators.`);
    }
    const {key} = node;
    checkOption(key.name || key.value, validOptions, node.value);
    return node;
  });
}

function collectOptions /*:: <ValidOptions: {}> */(
  moduleName /*: string */,
  options /*: ?BabelNodeObjectExpression */,
  validOptions /*: ValidOptions */,
) /*: {|[$Keys<ValidOptions>]: ?FbtOptionValue|} */ {
  const key2value = {};
  if (options == null) {
    // $FlowFixMe Pretend that the empty object matches this function output type
    return key2value;
  }
  checkOptions(
    options.properties,
    // $FlowFixMe[escaped-generic]
    validOptions,
  ).forEach(option => {
    if (isArrowFunctionExpression(option.value)) {
      throw errorAt(
        option,
        `${moduleName}(...) does not allow an arrow function as an option value`,
      );
    }

    const value = /*:: ((( */
      option.value.expression || option.value
      // Flow can't refine to accurate BabelNode types for `option.value.expression`
    /*:: ): $FlowFixMe): BabelNode) */;

    const name = option.key.name || option.key.value;
    // Append only default valid options excluding "extraOptions",
    // which are used only by specific runtimes.
    if (validOptions.hasOwnProperty(name)) {
      key2value[name] = isTextualNode(value)
        ? normalizeSpaces(expandStringConcat(moduleName, value).value)
        : value;
    }
  });
  // $FlowFixMe Need to refactor code to convince Flow that key2value is an "exact" object
  return key2value;
}

/**
 * Given a node that could be a recursive binary operation over string literals
 * (i.e. string concatenation), expand it into a string literal.
 */
function expandStringConcat(
  moduleName /*: string */,
  node /*: BabelNode */,
) /*: BabelNodeStringLiteral | BabelNodeJSXText */ {
  if (isBinaryExpression(node)) {
    if (node.operator !== '+') {
      throw errorAt(
        node,
        `Expected concatenation operator (+) but got ${node.operator}`,
      );
    }
    return stringLiteral(
      expandStringConcat(moduleName, node.left).value +
        expandStringConcat(moduleName, node.right).value,
    );
  } else if (isStringLiteral(node)) {
    return node;
  } else if (isJSXText(node)) {
    return node;
  } else if (isTemplateLiteral(node)) {
    let string = '';
    const expressions = node.expressions;

    let index = 0;
    for (const elem of node.quasis) {
      if (elem.value.cooked) {
        string += elem.value.cooked;
      }

      if (index < expressions.length) {
        const expr = expressions[index++];
        // fbt.param expressions are already transformed to StringLiteral
        if (!isStringLiteral(expr)) {
          throw errorAt(
            node,
            `${moduleName} template placeholders only accept params wrapped in ` +
            `${moduleName}.param. Expected StringLiteral got ${expr.type}`,
          );
        }
        string += expr.value;
      }
    }

    return stringLiteral(string);
  }

  throw errorAt(
    node,
    `${moduleName} only accepts plain strings with params wrapped in ${moduleName}.param(...). ` +
      `See the docs at https://facebook.github.io/fbt/ for more info. ` +
      `Expected StringLiteral, TemplateLiteral, or concatenation; ` +
      // $FlowExpectedError This BabelNode is unsupported so it may not even have a type property
      `got "${node.type}"`,
  );
}

function expandStringArray(
  moduleName /*: string */,
  node /*: BabelNodeArrayExpression */,
) /*: BabelNodeStringLiteral */ {
  return stringLiteral(
    nullthrows(node.elements).map(element =>
      expandStringConcat(
        moduleName,
        nullthrows(element),
      ).value
    ).join('')
  );
}

function getOptionBooleanValue /*:: <Options: {}> */(
  options /*: Options */,
  name /*: string */,
  node /*: BabelNode */,
) /*: boolean */ {
  if (!options.hasOwnProperty(name)) {
    return false;
  }
  const value = options[name];
  if (isBooleanLiteral(value)) {
    return value.value;
  }
  // $FlowFixMe `expression` property might be undefined
  if (value.expression) {
    throw errorAt(node, `Expression not permitted for option "${name}".`);
  } else {
    throw errorAt(
      node,
      `Value for option "${name}" must be Boolean literal 'true' or 'false'.`,
    );
  }
}

function getVariationValue(
  moduleName /*: string */,
  variationName /*: 'number' | 'gender' */,
  variationInfo /*: BabelNode */,
) /*: ?BabelNode */ {
  // Numbers allow only `true` or expression.
  if (
    variationName === 'number' &&
    // $FlowFixMe Need to figure out what kind of BabelNode variationInfo is
    isBooleanLiteral(variationInfo.value)
  ) {
    if (variationInfo.value.value !== true) {
      throw errorAt(
        variationInfo,
        `${moduleName}.param's number option should be an expression or 'true'`,
      );
    }
    // For number="true" we don't pass additional value.
    return null;
  }

  // $FlowFixMe Need to figure out what kind of BabelNode variationInfo is
  return variationInfo.value;
}

/**
 * Utility for getting the first attribute by name from a list of attributes.
 */
function getAttributeByNameOrThrow(
  attributes /*: BabelNodeJSXAttributes */,
  name /*: string */,
) /*: ?BabelNodeJSXAttribute */ {
  const attr = getAttributeByName(attributes, name);
  if (attr === undefined) {
    throw new Error(`Unable to find attribute "${name}".`);
  }
  return attr;
}

function getAttributeByName(
  attributes /*: BabelNodeJSXAttributes */,
  name /*: string */,
) /*: ?BabelNodeJSXAttribute */ {
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    if (isJSXAttribute(attr) && attr.name.name === name) {
      return attr;
    }
  }
  return undefined;
}

function extractEnumRange(
  node /*: BabelNodeObjectExpression */,
) /*: {[name: string]: BabelNodeStringLiteral} */ {
  return node.properties.reduce((acc, prop) => {
    if (!isObjectProperty(prop)) {
      throw new Error(
        `fbt enum range values must be StringLiteral, got ${prop.type}`,
      );
    }
    if (!isStringLiteral(prop.value)) {
      throw new Error(
        `fbt enum range values must be StringLiteral, got ${prop.value.type}`,
      );
    }
    acc[prop.key.name || prop.key.value] = prop.value.value;
    return acc;
  }, {});
}

/**
 * There exists no Object.map in JS.  We don't have Map available in transforms.
 * Just use our own native Object iteration since we know we're dealing with
 * simple objects (and dont' run the risk of iterating prototype-inherited
 * functions or keys).
 */
function objMap/*:: <
  TKey: string,
  TValueIn,
  TValueOut,
  TObj: {+[key: TKey]: TValueIn},
> */(
  object /*: TObj */,
  fn /*: (value: TValueIn, TKey) => TValueOut */,
) /*: {[TKey]: TValueOut} */ {
  // A Lame, non-exhaustive runtime check, but oh well.
  if (
    !(object instanceof Object) ||
    // $FlowExpectedError "prototype" property might not exist
    object.prototype !== undefined
  ) {
    throw new Error('Only use on simple objects');
  }
  const toMap = {};
  for (const k in object) {
    toMap[k] = fn(
      object[
        // `k` is normally a `string` but it is inferred to be TKey
        /*:: (( */
        k
        /*:: : $FlowExpectedError): TKey) */
      ],
      /*:: (( */
      k
      /*:: : $FlowExpectedError): TKey) */,
    );
  }
  return toMap;
}

/**
 * Does this object have keys?
 *
 * Note: this breaks on any actual "class" object with prototype
 * members
 *
 * The micro-optimized equivalent of `Object.keys(o).length > 0` but
 * without the throw-away array
 */
function hasKeys(o /*: {...} */) /*: boolean */ {
  for (const k in o) {
    return true;
  }
  return false;
}

function getRawSource(src /*: string */, node /*: BabelNode */) /*: string */ {
  return src.substring(
    // $FlowFixMe node.start might be undefined
    node.start,
    // $FlowFixMe node.end might be undefined
    node.end,
  );
}

/**
 * Filter whitespace-only nodes from a list of nodes.
 */
function filterEmptyNodes/*:: <B: BabelNode> */(
  nodes /*: $ReadOnlyArray<B> */,
) /*: $ReadOnlyArray<B> */ {
  return nodes.filter(node => {
    // Filter whitespace and comment block
    return !(
      (isJSXText(node) && node.value.match(/^\s+$/)) ||
      (isJSXExpressionContainer(node) && isJSXEmptyExpression(node.expression))
    );
  });
}

function assertModuleName(
  moduleName /*: string */,
) /*: JSModuleNameType */ {
  if (moduleName === FBT || moduleName === FBS) {
    // $FlowExpectedError an exact string match should fulfill this function's output type
    return moduleName;
  }
  throw new Error(`Unsupported module name: "${moduleName}"`);
}

function textContainsFbtLikeModule(text /*: string */) /*: boolean */ {
  return ModuleNameRegExp.test(text);
}

module.exports = {
  assertModuleName,
  checkOption,
  collectOptions,
  errorAt,
  expandStringArray,
  expandStringConcat,
  extractEnumRange,
  filterEmptyNodes,
  getAttributeByName,
  getAttributeByNameOrThrow,
  getOptionBooleanValue,
  getOptionsFromAttributes,
  getRawSource,
  getVariationValue,
  hasKeys,
  normalizeSpaces,
  objMap,
  setUniqueToken,
  textContainsFbtLikeModule,
  validateNamespacedFbtElement,
};
