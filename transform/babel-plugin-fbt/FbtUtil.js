/**
 * Copyright 2004-present Facebook. All Rights Reserved.
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

const {JSModuleName, ModuleNameRegExp} = require('./FbtConstants');
const {FBS, FBT} = JSModuleName;

function normalizeSpaces(value, options) {
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
 * @param node - The node that contains the name of any parent node. For
 * example, for a JSXElement, the containing name is the openingElement's name.
 */
function validateNamespacedFbtElement(moduleName, node) {
  let valid = false;
  let handlerName;

  // Actual namespaced version, e.g. <fbt:param>
  if (node.type === 'JSXNamespacedName') {
    handlerName = node.name.name;
    valid =
      node.namespace.type === 'JSXIdentifier' &&
      node.namespace.name === moduleName &&
      (handlerName === 'enum' ||
        handlerName === 'param' ||
        handlerName === 'plural' ||
        handlerName === 'pronoun' ||
        handlerName === 'name' ||
        handlerName === 'same-param');
    // React's version, e.g. <FbtParam>, or <FbtEnum>
  } else if (node.type === 'JSXIdentifier') {
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

  return handlerName;
}

function isTextualNode(node) {
  if (node.type === 'StringLiteral' || node.type === 'JSXText') {
    return true;
  } else if (node.type === 'BinaryExpression' && node.operator === '+') {
    return isTextualNode(node.left) && isTextualNode(node.right);
  }
  return false;
}

function verifyUniqueToken(moduleName, name, paramSet) {
  if (paramSet[name]) {
    throw new Error(
      `There's already a token with the same name, '${name}' in this ${moduleName} call. ` +
        `Use ${moduleName}.sameParam if you want to reuse the same token value or ` +
        `give this token a different name`,
    );
  }
  paramSet[name] = true;
}

function checkOption(option, validOptions, value) {
  const validValues = validOptions[option];
  if (!validOptions.hasOwnProperty(option) || validValues === undefined) {
    throwAt(
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

/**
 * Build options list form corresponding attributes.
 */
function getOptionsFromAttributes(
  t,
  attributesNode,
  validOptions,
  ignoredAttrs,
) {
  const options = [];

  attributesNode.forEach(function(node) {
    const option = node.name.name;

    // Ignored attributes are passed as a separate argument in the fbt(...)
    // call, because they're required. They're not passed as options.
    if (ignoredAttrs[option]) {
      return;
    }

    let value = node.value;
    if (value.type === 'JSXExpressionContainer') {
      value = value.expression;
    } else if (
      value.type === 'StringLiteral' &&
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

function throwAt(astNode, msg) {
  const startPosition = astNode.loc.start;
  throw new Error(
    `Line ${startPosition.line} Column ${startPosition.column + 1}: ${msg}`,
  );
}

function checkOptions(properties, validOptions) {
  properties.forEach(function(node) {
    const key = node.key;
    checkOption(key.name || key.value, validOptions, node.value);
  });
  return properties;
}

function collectOptions(moduleName, t, options, validOptions) {
  if (options && options.type !== 'ObjectExpression') {
    throwAt(
      options,
      `${moduleName}(...) expects an ObjectExpression as its 3rd argument`,
    );
  }
  const key2value = {};
  const props = (options && options.properties) || [];
  checkOptions(props, validOptions).forEach(option => {
    const value = option.value.expression || option.value;
    const name = option.key.name || option.key.value;
    // Append only default valid options excluding "extraOptions",
    // which are used only by specific runtimes.
    if (validOptions.hasOwnProperty(name)) {
      key2value[name] = isTextualNode(value)
        ? normalizeSpaces(expandStringConcat(moduleName, t, value).value)
        : value;
    }
  });
  return key2value;
}

/**
 * Given a node that could be a recursive binary operation over string literals
 * (i.e. string concatenation), expand it into a string literal.
 */
function expandStringConcat(moduleName, t, node) {
  if (node.type === 'BinaryExpression') {
    if (node.operator !== '+') {
      throwAt(
        node,
        `Expected concatenation operator (+) but got ${node.operator}`,
      );
    }
    return t.stringLiteral(
      expandStringConcat(moduleName, t, node.left).value +
        expandStringConcat(moduleName, t, node.right).value,
    );
  } else if (node.type === 'StringLiteral') {
    return node;
  } else if (node.type === 'JSXText') {
    return node;
  } else if (node.type === 'TemplateLiteral') {
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
        if (expr.type !== 'StringLiteral') {
          throwAt(
            node,
            `${moduleName} template placeholders only accept params wrapped in ${moduleName}.param. ` +
              `Expected StringLiteral got ${expr.type}`,
          );
        }
        string += expr.value;
      }
    }

    return t.stringLiteral(string);
  }

  throwAt(
    node,
    `${moduleName} only accepts plain strings with params wrapped in ${moduleName}.param. ` +
      `See the docs at https://fburl.com/fbt-children for more info. ` +
      `Expected StringLiteral, TemplateLiteral, or concatenation; got ${
        node.type
      }`,
  );
}

function getOptionBooleanValue(t, options, name, node) {
  if (!options.hasOwnProperty(name)) {
    return false;
  }
  const value = options[name];
  if (t.isBooleanLiteral(value)) {
    return value.value;
  }
  if (value.expression) {
    throwAt(node, `Expression not permitted for option "${name}".`);
  } else {
    throwAt(
      node,
      `Value for option "${name}" must be Boolean literal 'true' or 'false'.`,
    );
  }
}

function getVariationValue(moduleName, variationName, variationInfo) {
  // Numbers allow only `true` or expression.
  if (
    variationName === 'number' &&
    variationInfo.value.type === 'BooleanLiteral'
  ) {
    if (variationInfo.value.value !== true) {
      throwAt(
        variationInfo,
        `${moduleName}.param's number option should be an expression or 'true'`,
      );
    }
    // For number="true" we don't pass additional value.
    return null;
  }

  return variationInfo.value;
}

/**
 * Utility for getting the first attribute by name from a list of attributes.
 */
function getAttributeByNameOrThrow(attributes, name) {
  const attr = getAttributeByName(attributes, name);
  if (attr === undefined) {
    throw new Error(`Unable to find attribute ${name}.`);
  }
  return attr;
}

function getAttributeByName(attributes, name) {
  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    if (attr.type === 'JSXAttribute' && attr.name.name === name) {
      return attr;
    }
  }
  return undefined;
}

function extractEnumRange(node) {
  return node.properties.reduce(function(acc, prop) {
    if (prop.value.type !== 'StringLiteral') {
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
function objMap(object, fn) {
  // A Lame, non-exhaustive runtime check, but oh well.
  if (!object instanceof Object || object.prototype !== undefined) {
    throw new Error('Only use on simple objects');
  }
  const toMap = {};
  for (const k in object) {
    toMap[k] = fn(object[k], k);
  }
  return toMap;
}

/**
 * Think of this as autovivification for JS object maps.  Returns the last level
 * created.  So you can call:
 *
 *   let x = {};
 *   nest(x, 'key1', 'key2')['key3'] = 123
 *   x is now: { key1: { key2: { key3: 123 } } }
 */
function nest(object, ...keys) {
  return keys.reduce((agg, key) => {
    return agg[key] === undefined ? (agg[key] = {}) : agg[key];
  }, object);
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
function hasKeys(o) {
  for (const k in o) {
    return true;
  }
  return false;
}

function getRawSource(src, node) {
  return src.substring(node.start, node.end);
}

/**
 * Filter whitespace-only nodes from a list of nodes.
 */
function filterEmptyNodes(nodes) {
  return nodes.filter(function(node) {
    // Filter whitespace and comment block
    return !(
      (node.type === 'JSXText' && node.value.match(/^\s+$/)) ||
      (node.type === 'JSXExpressionContainer' &&
        node.expression.type === 'JSXEmptyExpression')
    );
  });
}

function assertModuleName(moduleName /*: string */) /*: 'fbt' | 'fbs' */ {
  if (moduleName === FBT || moduleName === FBS) {
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
  nest,
  normalizeSpaces,
  objMap,
  textContainsFbtLikeModule,
  throwAt,
  validateNamespacedFbtElement,
  verifyUniqueToken,
};
