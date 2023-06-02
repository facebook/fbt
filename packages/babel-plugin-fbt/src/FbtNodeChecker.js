/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow
 * @format
 * @oncall i18n_fbt_js
 */

/*eslint max-len: ["error", 100]*/

'use strict';

import type {JSModuleNameType} from './FbtConstants';
import type {NodePathOf} from '@babel/core';

const FbtNodeType = require('./fbt-nodes/FbtNodeType');
const {
  JSModuleName: {FBS, FBT, REACT_FBT},
} = require('./FbtConstants');
const {assertModuleName, errorAt} = require('./FbtUtil');
const {
  isCallExpression,
  isIdentifier,
  isJSXElement,
  isJSXNamespacedName,
  isMemberExpression,
} = require('@babel/types');

class FbtNodeChecker {
  moduleName: JSModuleNameType;

  constructor(moduleName: JSModuleNameType) {
    this.moduleName = assertModuleName(moduleName);
  }

  isNameOfModule(name: string): boolean {
    return this.moduleName === FBT
      ? FbtNodeChecker.isFbtName(name)
      : FbtNodeChecker.isFbsName(name);
  }

  isJSXElement(node: BabelNode): boolean {
    if (!isJSXElement(node)) {
      return false;
    }
    const nameNode = node.openingElement.name;
    return (
      nameNode.type === 'JSXIdentifier' && this.isNameOfModule(nameNode.name)
    );
  }

  isJSXNamespacedElement(node: BabelNode): boolean {
    if (!isJSXElement(node)) {
      return false;
    }
    const nameNode = node.openingElement.name;
    return (
      isJSXNamespacedName(nameNode) &&
      this.isNameOfModule(nameNode.namespace.name)
    );
  }

  // Detects this pattern: `fbt(...)`
  isModuleCall(node: BabelNode): boolean {
    return (
      isCallExpression(node) &&
      isIdentifier(node.callee) &&
      this.isNameOfModule(node.callee.name)
    );
  }

  getFbtConstructNameFromFunctionCall(node: BabelNode): ?FbtNodeType {
    return (
      (isCallExpression(node) &&
        isMemberExpression(node.callee) &&
        isIdentifier(node.callee.object) &&
        this.isNameOfModule(node.callee.object.name) &&
        // $FlowFixMe[prop-missing]
        isIdentifier(node.callee.property) &&
        typeof node.callee.property.name === 'string' &&
        FbtNodeType.cast(node.callee.property.name)) ||
      null
    );
  }

  isMemberExpression(node: BabelNode): boolean {
    return (
      isMemberExpression(node) &&
      isIdentifier(node.object) &&
      this.isNameOfModule(node.object.name)
    );
  }

  isJSModuleBound<B: BabelNode>(path: NodePathOf<B>): boolean {
    const binding = path.context.scope.getBinding(this.moduleName);
    return !!(binding && binding.path.node);
  }

  // Detects this pattern: `fbt.c(...)`
  isCommonStringCall(node: BabelNode): boolean {
    return (
      isCallExpression(node) &&
      isMemberExpression(node.callee) &&
      this.isMemberExpression(node.callee) &&
      !node.callee.computed &&
      // $FlowFixMe[prop-missing]
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
  assertNoNestedFbts(node: BabelNodeJSXElement): void {
    const moduleName = this.moduleName;
    node.children.forEach(child => {
      if (
        isJSXElement(child) &&
        (fbtChecker.isJSXElement(child) || fbsChecker.isJSXElement(child))
      ) {
        // $FlowFixMe[incompatible-cast] this should be a JSXIdentifier's name
        // $FlowFixMe[prop-missing]
        const nestedJSXElementName = (child.openingElement.name.name: string);
        // $FlowFixMe[incompatible-cast] this should be a JSXIdentifier's name
        // $FlowFixMe[prop-missing]
        const rootJSXElementName = (node.openingElement.name.name: string);

        throw errorAt(
          child,
          `Don't put <${nestedJSXElementName}> directly within <${rootJSXElementName}>. ` +
            `This is redundant. The text is already translated so you don't need ` +
            `to translate it again`,
        );
      } else {
        const otherChecker = moduleName === FBT ? fbsChecker : fbtChecker;
        if (otherChecker.isJSXNamespacedElement(child)) {
          // $FlowFixMe[incompatible-cast] this should be a BabelNodeJSXNamespacedName
          // $FlowFixMe[prop-missing]
          const jsxNamespacedName = (child.openingElement
            .name: BabelNodeJSXNamespacedName);
          throw errorAt(
            child,
            `Don't mix <fbt> and <fbs> JSX namespaces. ` +
              `Found a <${jsxNamespacedName.namespace.name}:${jsxNamespacedName.name.name}> ` +
              `directly within a <${moduleName}>`,
          );
        }
      }
    });
  }

  static forModule(moduleName: string): FbtNodeChecker {
    return assertModuleName(moduleName) === FBT ? fbtChecker : fbsChecker;
  }

  static isFbtName(name: string): boolean {
    return name === FBT || name === REACT_FBT;
  }

  static isFbsName(name: string): boolean {
    return name === FBS;
  }

  static forFbtCommonFunctionCall(node: BabelNode): ?FbtNodeChecker {
    if (fbtChecker.isCommonStringCall(node)) {
      return fbtChecker;
    } else if (fbsChecker.isCommonStringCall(node)) {
      return fbsChecker;
    }
    return null;
  }

  static forFbtFunctionCall(node: BabelNode): ?FbtNodeChecker {
    if (fbtChecker.isModuleCall(node)) {
      return fbtChecker;
    } else if (fbsChecker.isModuleCall(node)) {
      return fbsChecker;
    }
    return null;
  }

  static forJSXFbt(node: BabelNode): ?FbtNodeChecker {
    if (fbtChecker.isJSXElement(node)) {
      return fbtChecker;
    } else if (fbsChecker.isJSXElement(node)) {
      return fbsChecker;
    }
    return null;
  }

  /**
   * This is same as the non-static getFbtConstructNameFromFunctionCall except
   * it accepts any of the three fbt modules (`FBT`, `FBS` or `REACT_FBT`).
   */
  static getFbtConstructNameFromFunctionCall(node: BabelNode): ?FbtNodeType {
    return (
      (isCallExpression(node) &&
        isMemberExpression(node.callee) &&
        isIdentifier(node.callee.object) &&
        // $FlowFixMe[prop-missing]
        isIdentifier(node.callee.property) &&
        // $FlowFixMe[prop-missing]
        [FBT, FBS, REACT_FBT].includes(node.callee.object.name) &&
        // $FlowFixMe[prop-missing]
        typeof node.callee.property.name === 'string' &&
        // $FlowFixMe[prop-missing]
        FbtNodeType.cast(node.callee.property.name)) ||
      null
    );
  }

  // Not defining the static value here because of JS syntax compatibility issues in node.js v10.x
  static COMMON_STRING_METHOD_NAME: 'c' = 'c';
}

const fbsChecker = new FbtNodeChecker(FBS);
const fbtChecker = new FbtNodeChecker(FBT);

module.exports = FbtNodeChecker;
