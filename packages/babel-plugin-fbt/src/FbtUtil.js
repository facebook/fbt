/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow
 * @format
 * @oncall i18n_fbt_js
 */

/*eslint max-len: ["error", 100]*/
/* eslint-disable fb-www/no-new-error */ // disable www-only linter

'use strict';

import type {PatternString} from '../../../runtime/shared/FbtTable';
import type {AnyFbtNode} from './fbt-nodes/FbtNode';
import type {
  FbtOptionConfig,
  FbtOptionValue,
  FbtOptionValues,
  JSModuleNameType,
} from './FbtConstants';
import type {TokenAliases} from './index';
import typeof BabelTypes from '@babel/types';

const {JSModuleName, ModuleNameRegExp} = require('./FbtConstants');
const {
  arrayExpression,
  callExpression,
  identifier,
  isArgumentPlaceholder,
  isArrowFunctionExpression,
  isBinaryExpression,
  isBooleanLiteral,
  isCallExpression,
  isExpression,
  isIdentifier,
  isJSXAttribute,
  isJSXElement,
  isJSXEmptyExpression,
  isJSXExpressionContainer,
  isJSXIdentifier,
  isJSXNamespacedName,
  isJSXSpreadAttribute,
  isJSXText,
  isNode,
  isObjectExpression,
  isObjectProperty,
  isSpreadElement,
  isStringLiteral,
  isTemplateLiteral,
  memberExpression,
  stringLiteral,
} = require('@babel/types');
const {
  generateFormattedCodeFromAST,
} = require('fb-babel-plugin-utils/TestUtil');
const invariant = require('invariant');
const nullthrows = require('nullthrows');
const util = require('util');

type BabelNodeJSXAttributes = $ReadOnlyArray<
  $ElementType<$PropertyType<BabelNodeJSXOpeningElement, 'attributes'>, number>,
>;
export type BabelNodeCallExpressionArg =
  | BabelNodeExpression
  | BabelNodeSpreadElement
  | BabelNodeJSXNamespacedName
  | BabelNodeArgumentPlaceholder;
export type BabelNodeCallExpressionArgument = $ElementType<
  $PropertyType<BabelNodeCallExpression, 'arguments'>,
  number,
>;
export type ParamSet = {[parameterName: string]: ?BabelNode};
const {FBS, FBT} = JSModuleName;

function normalizeSpaces(
  value: string,
  // TODO(T56277500) set better types for Fbt options object to use `preserveWhitespace?: ?boolean`
  options: ?{preserveWhitespace?: ?FbtOptionValue},
): string {
  if (options && options.preserveWhitespace) {
    return value;
  }
  // We're  willingly preserving non-breaking space characters (\u00A0)
  // See D33402749 for more info.
  return value.replace(/[^\S\u00A0]+/g, ' ');
}

/**
 * Validates the type of fbt construct inside <fbt>.
 * Currently detected:
 *   <fbt:param>, <FbtParam>
 *   <fbt:enum>,  <FbtEnum>
 *   <fbt:name>,  <FbtName>
 *   etc...
 * @param node The node that may be a JSX fbt construct
 * @return Returns the name of a corresponding handler (fbt construct).
 * If a child is not valid, it is flagged as an Implicit Parameter (`implicitParamMarker`)
 */
function validateNamespacedFbtElement(
  moduleName: string,
  node: BabelNode,
): string {
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

function isBabelNodeCallExpressionArg(value: mixed): boolean %checks {
  return (
    isExpression(value) ||
    isSpreadElement(value) ||
    isJSXNamespacedName(value) ||
    isArgumentPlaceholder(value)
  );
}

function isTextualNode(node: mixed): boolean {
  if (isStringLiteral(node) || isJSXText(node)) {
    return true;
  } else if (isBinaryExpression(node) && node.operator === '+') {
    return isTextualNode(node.left) && isTextualNode(node.right);
  }
  return false;
}

function setUniqueToken(
  node: BabelNode,
  moduleName: string,
  name: string,
  paramSet: ParamSet,
): void {
  const cachedNode = paramSet[name];
  if (cachedNode && cachedNode != node) {
    throw errorAt(
      node,
      `There's already a token called "${name}" in this ${moduleName} call. ` +
        `Use ${moduleName}.sameParam if you want to reuse the same token name or ` +
        `give this token a different name`,
    );
  }
  paramSet[name] = node;
}

function checkOption<K: string>(
  option: string,
  validOptions: FbtOptionConfig<K>,
  value: ?BabelNode | string | boolean,
): K {
  // $FlowFixMe[incompatible-cast] consider
  const optionName = (option: K);

  const validValues = validOptions[optionName];
  if (!validOptions.hasOwnProperty(optionName) || validValues == null) {
    throw errorAt(
      isNode(value) ? value : null,
      `Invalid option "${optionName}". ` +
        `Only allowed: ${Object.keys(validOptions).join(', ')} `,
    );
  } else if (validValues !== true) {
    let valueStr;
    if (typeof value === 'string' || typeof value === 'boolean') {
      valueStr = value.toString();
    } else if (
      isNode(value) &&
      (isStringLiteral(value) || isBooleanLiteral(value))
    ) {
      valueStr = value && value.value.toString();
    } else {
      throw errorAt(
        isNode(value) ? value : null,
        `Option "${optionName}" has an invalid value. ` +
          `Expected a string literal but value is \`${varDump(
            value,
          )}\` (${typeof value})`,
      );
    }

    if (!validValues[valueStr]) {
      throw errorAt(
        isNode(value) ? value : null,
        `Option "${optionName}" has an invalid value: "${valueStr}". ` +
          `Only allowed: ${Object.keys(validValues).join(', ')}`,
      );
    }
  }
  return optionName;
}

const SHORT_BOOL_CANDIDATES = {
  common: 'common',
  doNotExtract: 'doNotExtract',
  number: 'number',
  preserveWhitespace: 'preserveWhitespace',
};

function canBeShortBoolAttr(name: string): %checks {
  return name in SHORT_BOOL_CANDIDATES;
}

/**
 * Build options list form corresponding attributes.
 */
function getOptionsFromAttributes(
  t: BabelTypes,
  attributesNode: $FlowFixMe,
  validOptions: $FlowFixMe,
  ignoredAttrs: $FlowFixMe,
): BabelNodeObjectExpression {
  const options = [];

  attributesNode.forEach(function (node) {
    const option = node.name.name;

    // Required attributes are passed as a separate argument in the fbt(...)
    // call, because they're required. They're not passed as options.
    // Ignored attributes are simply stripped from the function call entirely
    // and ignored.  By default, we ignore all "private" attributes with a
    // leading '__' like '__source' and '__self' as added by certain
    // babel/react plugins
    if (ignoredAttrs[option] || option.startsWith('__')) {
      return;
    }

    let value = node.value;
    const name = node.name.name;

    if (value === null && canBeShortBoolAttr(String(name))) {
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
        // $FlowFixMe[incompatible-call]
        value,
      ),
    );
  });

  return t.objectExpression(options);
}

type ErrorWithBabelNodeLocation = Error &
  interface {
    _hasBabelNodeLocation?: boolean,
  };

interface IBabelNodeWithLocation {
  loc: ?BabelNodeSourceLocation;
}

/**
 * Prepend Babel node debug info (location, source code) to an Error message.
 *
 * @param msgOrError If we're given an Error object, we'll prepend the babel node info
 * to its message (only once).
 * If it's a string, we'll create a new Error object ourselves.
 */
function errorAt(
  astNode: ?IBabelNodeWithLocation,
  msgOrError: string | ErrorWithBabelNodeLocation = '',
  options: {
    suggestOSSWebsite?: boolean,
  } = {},
): ErrorWithBabelNodeLocation {
  let error;
  if (typeof msgOrError === 'string') {
    const newError = new Error(
      createErrorMessageAtNode(astNode, msgOrError, options),
    );
    // $FlowExpectedError[incompatible-exact] Allow setting some internal props on Error object
    error = (newError: ErrorWithBabelNodeLocation);
    // $FlowExpectedError[prop-missing] Allow setting some internal props on Error object
    // $FlowExpectedError[incompatible-use]
    error._hasBabelNodeLocation = astNode?.loc != null;
  } else {
    error = msgOrError;
    if (error._hasBabelNodeLocation !== true) {
      error.message = createErrorMessageAtNode(astNode, error.message, options);
      // $FlowExpectedError[prop-missing] Allow setting some internal props on Error object
      // $FlowExpectedError[incompatible-use]
      error._hasBabelNodeLocation = astNode?.loc != null;
    }
  }
  return error;
}

function createErrorMessageAtNode(
  astNode: ?IBabelNodeWithLocation,
  msg: string = '',
  options: {
    suggestOSSWebsite?: boolean,
  } = {},
): string {
  const location = astNode && astNode.loc;
  const optionalMessage = options.suggestOSSWebsite
    ? 'See the docs at https://facebook.github.io/fbt/ for more info.'
    : null;

  return (
    (location != null
      ? `Line ${location.start.line} Column ${location.start.column + 1}: `
      : '') +
    msg +
    (optionalMessage ? `\n${optionalMessage}` : '') +
    (astNode != null
      ? `\n---\n${generateFormattedCodeFromAST(astNode)}\n---`
      : '')
  );
}

// Collects options from an fbt construct in functional form
function collectOptions<ValidOptions: FbtOptionConfig<string>>(
  moduleName: JSModuleNameType,
  options: ?BabelNodeObjectExpression,
  validOptions: ValidOptions,
): FbtOptionValues<$Keys<ValidOptions>> {
  const key2value: FbtOptionValues<$Keys<ValidOptions>> = {};
  if (options == null) {
    return key2value;
  }

  options.properties.forEach(option => {
    if (!isObjectProperty(option)) {
      throw errorAt(
        option,
        `options object must contain plain object properties. ` +
          `No method definitions or spread operators.`,
      );
    }

    const key = (option.key: BabelNode);
    let optionName;
    if (isIdentifier(key) && typeof key.name === 'string') {
      optionName = key.name;
    } else if (isStringLiteral(key)) {
      optionName = key.value;
    } else {
      throw errorAt(
        option,
        `Expected property name to be an identifier or a string literal.`,
      );
    }
    optionName = checkOption(optionName, validOptions, option.value);

    if (isArrowFunctionExpression(option.value)) {
      throw errorAt(
        option,
        `${moduleName}(...) does not allow an arrow function as an option value`,
      );
    }

    const value = ((option.value.expression ||
      option.value: // Flow can't refine to accurate BabelNode types for `option.value.expression`
    $FlowFixMe): BabelNode);

    // Append only default valid options excluding "extraOptions",
    // which are used only by specific runtimes.
    if (validOptions.hasOwnProperty(optionName)) {
      key2value[optionName] = isTextualNode(value)
        ? normalizeSpaces(expandStringConcat(moduleName, value).value)
        : value;
    }
  });
  return key2value;
}

// Collect options from an fbt construct in functional form only.
// TODO(T38926768): consolidate algorithm to get options from JSX fbt constructs
// See https://fburl.com/diff/1tr3z6l0
function collectOptionsFromFbtConstruct<ValidOptions: FbtOptionConfig<string>>(
  moduleName: JSModuleNameType,
  callsiteNode: ?BabelNodeCallExpression | BabelNodeJSXElement,
  validOptions: ValidOptions,
  booleanOptions: ?{[$Keys<ValidOptions>]: mixed} = null,
): FbtOptionValues<$Keys<ValidOptions>> {
  let optionsNode;
  let options = ({}: FbtOptionValues<$Keys<ValidOptions>>);
  if (isCallExpression(callsiteNode)) {
    optionsNode = getOptionsNodeFromCallExpression(moduleName, callsiteNode);
    options = collectOptions(moduleName, optionsNode, validOptions);
  } else if (isJSXElement(callsiteNode)) {
    throw errorAt(
      callsiteNode,
      'Collecting options from JSX element is not supported yet',
    );
  }

  Object.keys(options).forEach(key => {
    if (booleanOptions && booleanOptions.hasOwnProperty(key)) {
      options[key] = getOptionBooleanValue(
        options,
        key,
        optionsNode || callsiteNode,
      );
    } else if (isBooleanLiteral(options[key])) {
      options[key] = options[key].value;
    }
  });
  return options;
}

function getOptionsNodeFromCallExpression(
  moduleName: JSModuleNameType,
  node: BabelNodeCallExpression,
): ?BabelNodeObjectExpression {
  const optionsNode = node.arguments[2];
  if (optionsNode == null) {
    return null;
  }
  if (!isObjectExpression(optionsNode)) {
    throw errorAt(
      optionsNode,
      `${moduleName}(...) expects options as an ObjectExpression as its 3rd argument`,
    );
  }
  return optionsNode;
}

/**
 * Given a node that could be a recursive binary operation over string literals
 * (i.e. string concatenation), expand it into a string literal.
 */
function expandStringConcat(
  moduleName: string,
  node: BabelNode,
): BabelNodeStringLiteral | BabelNodeJSXText {
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
  moduleName: string,
  node: BabelNodeArrayExpression,
): BabelNodeStringLiteral {
  return stringLiteral(
    nullthrows(node.elements)
      .map(element => expandStringConcat(moduleName, nullthrows(element)).value)
      .join(''),
  );
}

// Check that the value of the given option name is a BabeNodeBooleanLiteral
// and return its value
function getOptionBooleanValue<K: string>(
  options: FbtOptionValues<K>,
  name: K,
  node: ?BabelNode,
): boolean {
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

/**
 * Utility for getting the first attribute by name from a list of attributes.
 */
function getAttributeByNameOrThrow(
  attributes: BabelNodeJSXAttributes,
  name: string,
  node: ?BabelNode = null,
): BabelNodeJSXAttribute {
  const attr = getAttributeByName(attributes, name);
  if (attr == undefined) {
    throw errorAt(node, `Unable to find attribute "${name}".`);
  }
  return attr;
}

function getAttributeByName(
  attributes: BabelNodeJSXAttributes,
  name: string,
): ?BabelNodeJSXAttribute {
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    if (isJSXAttribute(attr) && attr.name.name === name) {
      return attr;
    }
  }
  return undefined;
}

function getOpeningElementAttributes(
  node: BabelNodeJSXElement,
): $ReadOnlyArray<BabelNodeJSXAttribute> {
  return node.openingElement.attributes.map(attribute => {
    if (isJSXSpreadAttribute(attribute)) {
      throw errorAt(attribute, `Do no use the JSX spread attribute`);
    }
    return attribute;
  });
}

function extractEnumRange(node: BabelNodeObjectExpression): {
  [name: string]: BabelNodeStringLiteral,
} {
  return node.properties.reduce((acc, prop) => {
    if (!isObjectProperty(prop)) {
      throw new Error(
        `fbt enum range properties must be ObjectProperty, got ${prop.type}`,
      );
    }
    if (!isStringLiteral(prop.value)) {
      throw new Error(
        `fbt enum range property values must be StringLiteral, got ${prop.value.type}`,
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
function objMap<
  TKey: string | number,
  TValueIn,
  TValueOut,
  TObj: {+[key: TKey]: TValueIn},
>(object: TObj, fn: (value: TValueIn, TKey) => TValueOut): {[TKey]: TValueOut} {
  // A Lame, non-exhaustive runtime check, but oh well.
  if (
    !(object instanceof Object) ||
    // $FlowExpectedError "prototype" property might not exist
    object.prototype !== undefined
  ) {
    throw new Error('Only use on simple objects');
  }
  const toMap: {[TKey]: TValueOut} = {};
  for (const k in object) {
    // $FlowFixMe[incompatible-type]
    toMap[k] = fn(
      object[
        // `k` is normally a `string` but it is inferred to be TKey
        ((k: $FlowExpectedError): TKey)
      ],
      ((k: $FlowExpectedError): TKey),
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
function hasKeys(o: {...}): boolean {
  for (const k in o) {
    return true;
  }
  return false;
}

function getRawSource(src: string, node: BabelNode): string {
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
function filterEmptyNodes<B: BabelNode>(
  nodes: $ReadOnlyArray<B>,
): $ReadOnlyArray<B> {
  return nodes.filter(node => {
    // Filter whitespace and comment block
    return !(
      (isJSXText(node) && node.value.match(/^\s+$/)) ||
      (isJSXExpressionContainer(node) && isJSXEmptyExpression(node.expression))
    );
  });
}

function assertModuleName(moduleName: string): JSModuleNameType {
  if (moduleName === FBT || moduleName === FBS) {
    // $FlowExpectedError an exact string match should fulfill this function's output type
    return moduleName;
  }
  throw new Error(`Unsupported module name: "${moduleName}"`);
}

function textContainsFbtLikeModule(text: string): boolean {
  return ModuleNameRegExp.test(text);
}

function convertTemplateLiteralToArrayElements(
  moduleName: JSModuleNameType,
  node: BabelNodeTemplateLiteral,
): Array<
  BabelNodeStringLiteral | BabelNodeCallExpression | BabelNodeJSXElement,
> {
  const {expressions, quasis} = node;
  const nodes: Array<
    BabelNodeStringLiteral | BabelNodeCallExpression | BabelNodeJSXElement,
  > = [];

  let index = 0;
  // quasis items are the text literal portion of the template literal
  for (const item of quasis) {
    const text = item.value.cooked || '';
    if (text != '') {
      nodes.push(stringLiteral(text));
    }
    if (index < expressions.length) {
      const expression = expressions[index++];
      if (
        expression.type === 'StringLiteral' ||
        expression.type === 'CallExpression' ||
        expression.type === 'JSXElement'
      ) {
        nodes.push(expression);
      } else {
        throw errorAt(
          expression,
          `Unexpected node type: ${expression.type}. ${moduleName}() only supports ` +
            `the following syntax within template literals:` +
            `string literal, a construct like ${moduleName}.param() or a JSX element.`,
        );
      }
    }
  }
  return nodes;
}

function getBinaryExpressionOperands(
  moduleName: JSModuleNameType,
  node: BabelNodeExpression,
): Array<
  BabelNodeCallExpression | BabelNodeStringLiteral | BabelNodeTemplateLiteral,
> {
  switch (node.type) {
    case 'BinaryExpression':
      if (node.operator !== '+') {
        throw errorAt(node, 'Expected to see a string concatenation');
      }
      return [
        ...getBinaryExpressionOperands(moduleName, node.left),
        ...getBinaryExpressionOperands(moduleName, node.right),
      ];
    case 'CallExpression':
    case 'StringLiteral':
    case 'TemplateLiteral':
      return [node];
    default:
      throw errorAt(
        node,
        `Unexpected node type: ${node.type}. ` +
          `The ${moduleName}() string concatenation pattern only supports ` +
          ` string literals or constructs like ${moduleName}.param().`,
      );
  }
}

function convertToStringArrayNodeIfNeeded(
  moduleName: JSModuleNameType,
  node: $ElementType<
    $PropertyType<BabelNodeCallExpression, 'arguments'>,
    number,
  >,
): BabelNodeArrayExpression {
  let initialElements;
  let didStartWithArray = false;
  switch (node.type) {
    case 'ArrayExpression':
      initialElements = nullthrows(node.elements);
      didStartWithArray = true;
      break;
    case 'CallExpression':
    case 'StringLiteral':
      initialElements = [node];
      break;

    case 'BinaryExpression': {
      initialElements = getBinaryExpressionOperands(moduleName, node);
      break;
    }
    case 'TemplateLiteral': {
      initialElements = convertTemplateLiteralToArrayElements(moduleName, node);
      break;
    }

    default:
      throw errorAt(
        node,
        `Unexpected node type: ${node.type}. ` +
          `${moduleName}()'s first argument should be a string literal, ` +
          `a construct like ${moduleName}.param() or an array of those.`,
      );
  }

  // Let's also convert the 1st level of elements of the array
  // to process nested string concatenations and template literals one last time.
  // We're not making this fully recursive since, from a syntax POV,
  // it wouldn't be elegant to allow developers to nest lots of template literals.
  return arrayExpression(
    initialElements.reduce(
      (elements, element) => {
        if (element == null) {
          return elements;
        }
        if (
          didStartWithArray &&
          (element.type === 'BinaryExpression' ||
            (element.type === 'TemplateLiteral' && element.expressions.length))
        ) {
          throw errorAt(
            element,
            `${moduleName}(array) only supports items that are string literals, ` +
              `template literals without any expressions, or fbt constructs`,
          );
        }
        switch (element.type) {
          case 'BinaryExpression': {
            elements.push(...getBinaryExpressionOperands(moduleName, element));
            break;
          }
          case 'TemplateLiteral': {
            elements.push(
              ...convertTemplateLiteralToArrayElements(moduleName, element),
            );
            break;
          }
          default:
            elements.push(element);
        }
        return elements;
      },
      ([]: Array<null | BabelNodeExpression | BabelNodeSpreadElement>),
    ),
  );
}

/**
 * For a given object, replace any property that refers to a BabelNode with a string like
 * `'BabelNode[type=SomeBabelType]'`.
 * We'll also create a new property that'll contain the serialized JS code from the BabelNode.
 *
 * @example
 *   compactBabelNodeProps({
 *     node: t.stringLiteral('hello')
 *   })
 *
 *   // Output:
 *   {
 *     node: 'BabelNode[type=StringLiteral]'
 *     __nodeCode: "'hello'"
 *   }
 */
function compactBabelNodeProps(
  object: interface {},
  serializeSourceCode: boolean = true,
): {...} {
  // $FlowExpectedError[cannot-spread-interface] Force-cast `interface` to an `object` type
  const ret = {...object};
  for (const propName in ret) {
    if (ret.hasOwnProperty(propName)) {
      const propValue = ret[propName];
      if (!isNode(propValue)) {
        continue;
      }
      if (serializeSourceCode) {
        ret[`__${propName}Code`] = generateFormattedCodeFromAST(propValue);
      }
      // $FlowFixMe[incompatible-type]
      // $FlowFixMe[prop-missing]
      ret[propName] = `BabelNode[type=${propValue.type || ''}]`;
    }
  }
  return ret;
}

/**
 * Serialize a variable for debugging.
 * It's a variant of JSON.stringify() that supports `undefined`
 */
function varDump(value: mixed, depth: number = 1): string {
  return (
    util.inspect(value, {
      depth,
      // Disable colors due to T100307063
      colors: false,
    }) || 'undefined'
  );
}

function enforceString(value: mixed, valueDesc: ?string): string {
  invariant(
    typeof value === 'string',
    '%sExpected string value instead of %s (%s)',
    valueDesc ? valueDesc + ' - ' : '',
    varDump(value),
    typeof value,
  );
  return value;
}

function enforceBoolean(value: mixed, valueDesc: ?string): boolean {
  invariant(
    typeof value === 'boolean',
    '%sExpected boolean value instead of %s (%s)',
    valueDesc ? valueDesc + ' - ' : '',
    varDump(value),
    typeof value,
  );
  return value;
}

function enforceBabelNode(value: mixed, valueDesc: ?string): BabelNode {
  invariant(
    isNode(value),
    '%sExpected BabelNode value instead of %s (%s)',
    valueDesc ? valueDesc + ' - ' : '',
    varDump(value),
    typeof value,
  );
  return value;
}

function enforceBabelNodeExpression(
  value: mixed,
  valueDesc: ?string,
): BabelNodeExpression {
  invariant(
    isExpression(value),
    '%sExpected BabelNodeExpression value instead of %s (%s)',
    valueDesc ? valueDesc + ' - ' : '',
    varDump(value),
    typeof value,
  );
  return value;
}

function enforceBabelNodeCallExpressionArg(
  value: mixed,
  valueDesc: ?string,
): BabelNodeCallExpressionArg {
  invariant(
    isBabelNodeCallExpressionArg(value),
    '%sExpected BabelNodeCallExpressionArg value instead of %s (%s)',
    valueDesc ? valueDesc + ' - ' : '',
    varDump(value),
    typeof value,
  );
  return value;
}

function enforceStringEnum<K: string>(
  value: mixed,
  keys: {[K]: any},
  valueDesc: ?string,
): K {
  invariant(
    typeof value === 'string' && keys.hasOwnProperty(value),
    '%sExpected value to be one of [%s] but we got %s (%s) instead',
    valueDesc ? valueDesc + ' - ' : '',
    Object.keys(keys).join(', '),
    varDump(value),
    typeof value,
  );
  // $FlowFixMe[incompatible-return] Value has been refined with the above invariant check
  return value;
}

// Given a type enforcer function, make it also accept a nullable value
function nullableTypeCheckerFactory<
  ArgVal,
  Args: $ReadOnlyArray<ArgVal>,
  Ret,
  Val,
>(checker: (Val, ...args: Args) => Ret): (Val, ...args: Args) => ?Ret {
  return (value, ...args) => {
    return value == null ? null : checker(value, ...args);
  };
}

const enforceBabelNodeOrNull: (value: mixed, valueDesc: ?string) => ?BabelNode =
  nullableTypeCheckerFactory(enforceBabelNode);
enforceBabelNode.orNull = enforceBabelNodeOrNull;

const enforceBabelNodeExpressionOrNull: (
  value: mixed,
  valueDesc: ?string,
) => ?BabelNodeExpression = nullableTypeCheckerFactory(
  enforceBabelNodeExpression,
);
enforceBabelNodeExpression.orNull = enforceBabelNodeExpressionOrNull;

const enforceBabelNodeCallExpressionArgOrNull: (
  value: mixed,
  valueDesc: ?string,
) => ?BabelNodeCallExpressionArg = nullableTypeCheckerFactory(
  enforceBabelNodeCallExpressionArg,
);
enforceBabelNodeCallExpressionArg.orNull =
  enforceBabelNodeCallExpressionArgOrNull;

const enforceBooleanOrNull: (value: mixed, valueDesc: ?string) => ?boolean =
  nullableTypeCheckerFactory(enforceBoolean);
enforceBoolean.orNull = enforceBooleanOrNull;

const enforceStringOrNull: (value: mixed, valueDesc: ?string) => ?string =
  nullableTypeCheckerFactory(enforceString);
enforceString.orNull = enforceStringOrNull;

const enforceStringEnumOrNull: <K: string>(
  value: mixed,
  keys: {[K]: any},
  valueDesc: ?string,
) => ?K = nullableTypeCheckerFactory(enforceStringEnum);
enforceStringEnum.orNull = enforceStringEnumOrNull;

/**
 * Creates an `fbt._<<methodName>>(args)` runtime function call.
 * <<methodName>> is inferred from the given fbtNode
 * @param fbtNode This fbt FbtNode that created this function call
 * @param args Arguments of the function call
 * @param overrideMethodName Use this method name instead of the one from the fbtNode
 */
function createFbtRuntimeArgCallExpression(
  fbtNode: AnyFbtNode,
  args: Array<BabelNodeCallExpressionArg>,
  overrideMethodName?: string,
): BabelNodeCallExpression {
  return callExpression(
    memberExpression(
      identifier(fbtNode.moduleName),
      identifier(
        '_' +
          (overrideMethodName ||
            nullthrows(
              // $FlowExpectedError[prop-missing] using nullthrows() to detect if it's undefined
              fbtNode.constructor.type,
            )),
      ),
    ),
    args,
  );
}

/**
 * Clear token names in translations and runtime call texts need to be replaced
 * by their aliases in order for the runtime logic to work.
 */
function replaceClearTokensWithTokenAliases(
  textOrTranslation: PatternString,
  tokenAliases: ?TokenAliases,
): string {
  if (tokenAliases == null) {
    return textOrTranslation;
  }

  // avoid cyclic dependency
  const {tokenNameToTextPattern} = require('./fbt-nodes/FbtNodeUtil');
  return Object.keys(tokenAliases).reduce(
    (mangledText: string, clearToken: string) => {
      const clearTokenName = tokenNameToTextPattern(clearToken);
      const mangledTokenName = tokenNameToTextPattern(tokenAliases[clearToken]);
      // Since a string is not allowed to have implicit params with duplicated
      // token names, replacing the first and therefore the only occurence of
      // `clearTokenName` is sufficient.
      return mangledText.replace(clearTokenName, mangledTokenName);
    },
    textOrTranslation,
  );
}

module.exports = {
  assertModuleName,
  checkOption,
  collectOptions,
  collectOptionsFromFbtConstruct,
  compactBabelNodeProps,
  convertTemplateLiteralToArrayElements,
  convertToStringArrayNodeIfNeeded,
  createFbtRuntimeArgCallExpression,
  enforceBabelNode,
  enforceBabelNodeCallExpressionArg,
  enforceBabelNodeExpression,
  enforceBoolean,
  enforceString,
  enforceStringEnum,
  errorAt,
  expandStringArray,
  expandStringConcat,
  extractEnumRange,
  filterEmptyNodes,
  getAttributeByName,
  getAttributeByNameOrThrow,
  getBinaryExpressionOperands,
  getOpeningElementAttributes,
  getOptionBooleanValue,
  getOptionsFromAttributes,
  getOptionsNodeFromCallExpression,
  getRawSource,
  hasKeys,
  normalizeSpaces,
  objMap,
  replaceClearTokensWithTokenAliases,
  setUniqueToken,
  textContainsFbtLikeModule,
  validateNamespacedFbtElement,
  varDump,
};
