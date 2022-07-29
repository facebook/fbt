/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

import type {NodePathOf} from '@babel/core';

const {FBT_ENUM_MODULE_SUFFIX} = require('./FbtConstants');
const t = require('@babel/types');
const path = require('path');

type NodeCallExpression = NodePathOf<BabelNodeCallExpression>;
type NodeImportDeclaration = NodePathOf<BabelNodeImportDeclaration>;
export type EnumKey = string;
type EnumValue = string;
export type EnumModule = {|+[EnumKey]: EnumValue|};
export type EnumManifest = {+[enumModuleName: string]: ?EnumModule};

const fbtEnumMapping: {[enumAlias: string]: ?string} = {};

let enumManifest: ?EnumManifest;

class FbtEnumRegistrar {
  /**
   * Set the enum manifest. I.e. a mapping of enum module names -> enum entries
   */
  setEnumManifest(manifest: ?EnumManifest): void {
    enumManifest = manifest;
  }

  /**
   * Associate a JS variable name to an Fbt enum module name
   * If the module name is invalid, then it's a no-op.
   */
  setModuleAlias(alias: string, modulePath: string): void {
    const moduleName = path.parse(modulePath).name;
    if (!moduleName.endsWith(FBT_ENUM_MODULE_SUFFIX)) {
      return;
    }
    fbtEnumMapping[alias] = moduleName;
  }

  /**
   * Returns the Fbt enum module name for a given variable name (if any)
   */
  getModuleName(name: string): ?string {
    return fbtEnumMapping[name];
  }

  /**
   * Returns the Fbt enum module name for a given variable name (if any)
   */
  getEnum(variableName: string): ?EnumModule {
    const moduleName = this.getModuleName(variableName);
    return enumManifest != null && moduleName != null
      ? enumManifest[moduleName]
      : null;
  }

  /**
   * Processes a `require(...)` call and registers the fbt enum if applicable.
   * @param path Babel path of a `require(...)` call expression
   */
  registerRequireIfApplicable(path: NodeCallExpression): void {
    const {node} = path;
    const firstArgument = node.arguments[0];
    if (firstArgument.type !== 'StringLiteral') {
      return;
    }
    const modulePath = firstArgument.value;
    // $FlowFixMe Need to check that parent path exists and that the node is correct
    const alias = (path.parentPath.node.id.name: string);
    this.setModuleAlias(alias, modulePath);
  }

  /**
   * Processes a `import ... from '...';` statement and registers the fbt enum
   * if applicable.
   *
   * We only support the following top level import styles:
   *   - `import anEnum from 'Some$FbtEnum';`
   *   - `import * as aEnum from 'Some$FbtEnum';`
   *
   * @param path Babel path of a `import` statement
   */
  registerImportIfApplicable(path: NodeImportDeclaration): void {
    const {node} = path;

    if (node.specifiers.length > 1) {
      return;
    }

    const specifier = node.specifiers[0];
    if (
      t.isImportDefaultSpecifier(specifier) ||
      t.isImportNamespaceSpecifier(specifier)
    ) {
      const alias = specifier.local.name;
      const modulePath = node.source.value;
      this.setModuleAlias(alias, modulePath);
    }
  }
}

module.exports = (new FbtEnumRegistrar(): FbtEnumRegistrar);
