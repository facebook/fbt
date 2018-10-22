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

const {FBS, FBT, REACT_FBT} = require('./FbtConstants').JSModuleName;
const {assertModuleName, throwAt} = require('./FbtUtil');

class FbtNodeChecker {
  constructor(moduleName /*: 'fbt' | 'fbs' */) {
    this._moduleName = assertModuleName(moduleName);
  }

  isNameOfModule(name) {
    return this._moduleName === FBT
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
    const binding = path.context.scope.getBinding(this._moduleName);
    return !!(binding && binding.path.node);
  }

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
    const moduleName = this._moduleName;
    node.children.forEach(child => {
      if (fbtChecker.isJSXElement(child) || fbsChecker.isJSXElement(child)) {
        throwAt(
          child,
          `Don't put <${child.openingElement.name.name}> directly within <${
            node.openingElement.name.name
          }>. This is redundant. ` +
            `The text is already translated so you don't need to translate it again`,
        );
      } else {
        const otherChecker = moduleName === FBT ? fbsChecker : fbtChecker;
        if (otherChecker.isJSXNamespacedElement(child)) {
          const childOpeningElementNode = child.openingElement.name;
          throwAt(
            child,
            `Don't mix <fbt> and <fbs> JSX namespaces. ` +
              `Found a <${childOpeningElementNode.namespace.name}:${
                childOpeningElementNode.name.name
              }> directly within a <${moduleName}>`,
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
}
FbtNodeChecker.COMMON_STRING_METHOD_NAME = 'c';

const fbsChecker = new FbtNodeChecker(FBS);
const fbtChecker = new FbtNodeChecker(FBT);

module.exports = FbtNodeChecker;
