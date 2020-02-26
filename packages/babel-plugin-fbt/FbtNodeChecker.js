/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 */

'use strict';

const {FBS, FBT, REACT_FBT} = require('./FbtConstants').JSModuleName;
const {assertModuleName, errorAt} = require('./FbtUtil');

class FbtNodeChecker {
  constructor(moduleName /*: 'fbt' | 'fbs' */) {
    this.moduleName = assertModuleName(moduleName);
  }

  isNameOfModule(name) {
    return this.moduleName === FBT
      ? FbtNodeChecker.isFbtName(name)
      : FbtNodeChecker.isFbsName(name);
  }

  isJSXElement(node) {
    if (node.type !== 'JSXElement') {
      return false;
    }
    const nameNode = node.openingElement.name;
    return (
      nameNode.type === 'JSXIdentifier' && this.isNameOfModule(nameNode.name)
    );
  }

  isJSXNamespacedElement(node) {
    if (node.type !== 'JSXElement') {
      return false;
    }
    const nameNode = node.openingElement.name;
    return (
      nameNode.type === 'JSXNamespacedName' &&
      this.isNameOfModule(nameNode.namespace.name)
    );
  }

  // Detects this pattern: `fbt(...)`
  isModuleCall(node) {
    return (
      node.callee.type === 'Identifier' && this.isNameOfModule(node.callee.name)
    );
  }

  isMemberExpression(node) {
    return (
      node.type === 'MemberExpression' && this.isNameOfModule(node.object.name)
    );
  }

  isJSModuleBound(path) {
    const binding = path.context.scope.getBinding(this.moduleName);
    return !!(binding && binding.path.node);
  }

  // Detects this pattern: `fbt.c(...)`
  isCommonStringCall(node) {
    return (
      this.isMemberExpression(node.callee) &&
      !node.callee.computed &&
      node.callee.property.name === FbtNodeChecker.COMMON_STRING_METHOD_NAME
    );
  }

  /**
   * Ensure that, given an <fbt/fbs> JSXElement, we don't have any nested <fbt/fbs> element.
   * And also checks that all "parameter" child elements follow the same namespace.
   * E.g.
   * Inside <fbt>, don't allow <fbs:param>.
   * Inside <fbs>, don't allow <fbt:param>.
   */
  assertNoNestedFbts(node) {
    const moduleName = this.moduleName;
    node.children.forEach(child => {
      if (fbtChecker.isJSXElement(child) || fbsChecker.isJSXElement(child)) {
        throw errorAt(
          child,
          `Don't put <${child.openingElement.name.name}> directly within <${node.openingElement.name.name}>. This is redundant. ` +
            `The text is already translated so you don't need to translate it again`,
        );
      } else {
        const otherChecker = moduleName === FBT ? fbsChecker : fbtChecker;
        if (otherChecker.isJSXNamespacedElement(child)) {
          const childOpeningElementNode = child.openingElement.name;
          throw errorAt(
            child,
            `Don't mix <fbt> and <fbs> JSX namespaces. ` +
              `Found a <${childOpeningElementNode.namespace.name}:${childOpeningElementNode.name.name}> directly within a <${moduleName}>`,
          );
        }
      }
    });
  }

  static forModule(moduleName /*: string */) /*: this */ {
    return assertModuleName(moduleName) === FBT ? fbtChecker : fbsChecker;
  }

  static isFbtName(name) {
    return name === FBT || name === REACT_FBT;
  }

  static isFbsName(name) {
    return name === FBS;
  }

  static forFbtCommonFunctionCall(path /*: NodePath */) /*: ?this */ {
    if (fbtChecker.isCommonStringCall(path.node)) {
      return fbtChecker;
    } else if (fbsChecker.isCommonStringCall(path.node)) {
      return fbsChecker;
    }
    return null;
  }

  static forFbtFunctionCall(path /*: NodePath */) /*: ?this */ {
    if (fbtChecker.isModuleCall(path.node)) {
      return fbtChecker;
    } else if (fbsChecker.isModuleCall(path.node)) {
      return fbsChecker;
    }
    return null;
  }

  static forJSXFbt(path /*: NodePath */) /*: ?this */ {
    if (fbtChecker.isJSXElement(path.node)) {
      return fbtChecker;
    } else if (fbsChecker.isJSXElement(path.node)) {
      return fbsChecker;
    }
    return null;
  }
}

FbtNodeChecker.COMMON_STRING_METHOD_NAME = 'c';
const fbsChecker = new FbtNodeChecker(FBS);
const fbtChecker = new FbtNodeChecker(FBT);

module.exports = FbtNodeChecker;
