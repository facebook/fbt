/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 * @noflow
 */

'use strict';

const {
  filterEmptyNodes,
  getAttributeByNameOrThrow,
  normalizeSpaces,
  validateNamespacedFbtElement,
} = require('./FbtUtil');
const FbtParamType = {
  IMPLICICT: 'implicit',
  EXPLICIT: 'explicit',
  NULL: 'null',
};

/**
 * Given a node that is a child of an <fbt> node and the phrase that the node
 * is within, the implicit node becomes the child of a new <fbt> node.
 *
 * WARNING: this method has side-effects because it alters the given `node` object
 * You shouldn't try to run this multiple times on the same `node`.
 */
function wrapImplicitFBTParam(moduleName, t, node) {
  const fbtJSXIdentifier = t.JSXIdentifier(moduleName);
  const openingElement = t.JSXOpeningElement(fbtJSXIdentifier, [
    createDescAttribute(t, node),
  ]);
  openingElement.selfClosing = false;
  const closingElement = t.JSXClosingElement(fbtJSXIdentifier);
  const fbtNode = t.JSXElement(openingElement, closingElement, []);
  fbtNode.loc = node.loc;
  fbtNode.implicitFbt = true;
  fbtNode.children = node.children;
  node.paramName = normalizeSpaces(collectRawString(moduleName, node)).trim();
  if (node.parentIndex !== undefined) {
    fbtNode.parentIndex = node.parentIndex;
  }
  node.children = [fbtNode];
  return node;
}

/**
 * Given a node, this function creates a JSXIdentifier with the the node's
 * implicit description as the description.
 */
function createDescAttribute(t, node) {
  var descIdentifier = t.JSXIdentifier('desc');
  var descString = t.StringLiteral(
    'In the phrase: "' + node.implicitDesc + '"',
  );
  return t.JSXAttribute(descIdentifier, descString);
}

/**
 * Returns either the string contained with a JSXText node.
 */
function getLeafNodeString(node) {
  return node.type === 'JSXText' ? normalizeSpaces(node.value) : '';
}

/**
 * Collects the raw strings below a given node. Explicit fbt param nodes
 * amend their 'name' attribute wrapped with [ ] only if they are the
 * child of the base node.
 * @param child - False initially, true when the function
 * recursively calls itself with children nodes so only explicit <fbt:param>
 * children are wrapped and not the base node.
 */
function collectRawString(
  moduleName,
  node /*: BabelNode */,
  child /*: boolean */,
) {
  if (!node.children) {
    return getLeafNodeString(node);
  } else if (
    getParamType(moduleName, node) === FbtParamType.EXPLICIT &&
    child
  ) {
    return '[' + getExplicitParamName(node) + ']';
  } else {
    var filteredChildren = filterEmptyNodes(node.children);
    const string = filteredChildren
      .map(_child => collectRawString(moduleName, _child, true))
      .join('');
    return normalizeSpaces(string.trim());
  }
}

function getExplicitParamName(node) {
  const nameAttr = getAttributeByNameOrThrow(
    node.openingElement.attributes,
    'name',
  );
  return nameAttr.value.value;
}

/**
 * Given a parent <fbt> node, calls createDescriptionsWithStack with an
 * empty stack to be filled
 */
function createImplicitDescriptions(moduleName, node) {
  createDescriptionsWithStack(moduleName, node, []);
}

/**
 * Creates the description for all children nodes that are implicitly
 * <fbt:param> nodes by creating the queue that is the path from the parent
 * fbt node to each node.
 */
function createDescriptionsWithStack(moduleName, node, stack) {
  stack.push(node);
  if (node.children) {
    var filteredChildren = filterEmptyNodes(node.children);
    for (let ii = 0; ii < filteredChildren.length; ++ii) {
      const child = filteredChildren[ii];
      const openingElement = child.openingElement;
      if (
        child.type === 'JSXElement' &&
        openingElement.name &&
        validateNamespacedFbtElement(moduleName, openingElement.name) ===
          'implicitParamMarker'
      ) {
        child.implicitDesc = collectTokenStringFromStack(moduleName, stack, 0);
      }
      createDescriptionsWithStack(moduleName, child, stack);
    }
  }
  stack.pop();
}

/**
 * Collects the token string from the stack by tokenizing the children of the
 * target implicit param, as well as other implicit or explicit <fbt:param>
 * nodes that do not contain the current implicit node.
 * The stack looks like:
 * [topLevelNode, ancestor1, ..., immediateParent, targetNode]
 */
function collectTokenStringFromStack(moduleName, nodeStack, index) {
  if (index >= nodeStack.length) {
    return '';
  }
  let tokenString = '';
  const currentNode = nodeStack[index];
  const nextNode = nodeStack[index + 1];
  const filteredChildren = filterEmptyNodes(currentNode.children);
  for (let i = 0; i < filteredChildren.length; ++i) {
    const child = filteredChildren[i];
    if (child === nextNode) {
      // If node is is on our ancestor path, descend recursively to
      // construct the string
      tokenString += collectTokenStringFromStack(
        moduleName,
        nodeStack,
        index + 1,
      );
    } else {
      let suffix = collectRawString(moduleName, child);
      if (
        child === currentNode ||
        isImplicitOrExplicitParam(moduleName, child)
      ) {
        suffix = tokenizeString(suffix);
      }
      tokenString += suffix;
    }
  }
  return tokenString.trim();
}

/**
 * Given a string, returns the same string wrapped with a token marker.
 */
function tokenizeString(s) {
  return '{=' + s + '}';
}

function isImplicitOrExplicitParam(moduleName, node) {
  return getParamType(moduleName, node) !== FbtParamType.NULL;
}

/**
 * Returns if the node is implicitly or explicitly a <fbt:param>
 */
function getParamType(moduleName, node) {
  if (node.type !== 'JSXElement') {
    return FbtParamType.NULL;
  }
  const nodeFBTElementType = validateNamespacedFbtElement(
    moduleName,
    node.openingElement.name,
  );
  switch (nodeFBTElementType) {
    case 'implicitParamMarker':
      return FbtParamType.IMPLICICT;
    case 'param':
    case 'FbtParam':
      return FbtParamType.EXPLICIT;
    default:
      return FbtParamType.NULL;
  }
}

module.exports = {
  wrapImplicitFBTParam,
  createImplicitDescriptions,
};
