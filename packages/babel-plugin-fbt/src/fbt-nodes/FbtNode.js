/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+i18n_fbt_js
 * @flow
 */

/*eslint max-len: ["error", 100]*/

'use strict';

import type {JSModuleNameType} from '../FbtConstants';
import type {
  BabelNodeCallExpressionArg,
  BabelNodeCallExpressionArgument,
} from '../FbtUtil';
import type {TokenAliases} from '../index.js';
import type {
  AnyStringVariationArg,
  StringVariationArgsMap,
} from './FbtArguments';
import type FbtEnumNode from './FbtEnumNode';
import type FbtImplicitParamNode from './FbtImplicitParamNode';
import type FbtNameNode from './FbtNameNode';
import type FbtParamNode from './FbtParamNode';
import type FbtPluralNode from './FbtPluralNode';
import type FbtPronounNode from './FbtPronounNode';
import type FbtSameParamNode from './FbtSameParamNode';
import type FbtTextNode from './FbtTextNode';
import type {Scope} from '@babel/core';

export type FbtChildNode =
  | FbtEnumNode
  | FbtImplicitParamNode
  | FbtNameNode
  | FbtParamNode
  | FbtPluralNode
  | FbtPronounNode
  | FbtSameParamNode
  | FbtTextNode;
export type AnyFbtNode = FbtNode<any, any, any, any>;

export type PlainJSXNode = {|
  babelNode: BabelNodeJSXOpeningElement,
  // Simplified representation of the JSX opening element's attributes for convenience.
  // We're currently only representing string literal attributes because it's not fully clear
  // how we'd want to represent other more complex types of attribute values.
  // If more complex types are needed, the Babel AST is available off the `babelNode` field.
  props: $ReadOnly<{[name: string]: string | number}>,
  type: string,
|};

export type PlainFbtNode = {|
  type: FbtNodeType,
  +children?: $ReadOnlyArray<PlainFbtNode>,
  // Not read-only because it needs to be set at a later stage, when all phrases have been extracted
  phraseIndex?: ?number,
  wrapperNode?: ?PlainJSXNode,
|};

const FbtNodeChecker = require('../FbtNodeChecker');
const FbtNodeType = require('./FbtNodeType');
const {compactBabelNodeProps, errorAt, varDump} = require('../FbtUtil');
const {isCallExpression, isNewExpression} = require('@babel/types');
const invariant = require('invariant');
const {default: traverse} = require('@babel/traverse');

/**
 * Base class that represents an fbt construct like <fbt>, <fbt:param>, etc...
 *
 * While Babel nodes are considered "low-level" representations of the JS source code,
 * FbtNode is a high-level abstraction of the fbt API syntax.
 *
 * See `FbtElementNode` for more info on how this class will be used.
 *
 * We'll usually not use this class directly, favoring specialized child classes instead.
 */
class FbtNode<
  SVArgument: AnyStringVariationArg | empty = empty,
  CurBabelNode: BabelNode = BabelNode,
  MaybeChildNode: ?FbtChildNode = null,
  Options: ?{} = null,
> {
  +moduleName: JSModuleNameType;
  +children: Array<MaybeChildNode>;
  // Reference to the BabelNode that this fbt node represents
  +node: CurBabelNode;
  +nodeChecker: FbtNodeChecker;
  +parent: ?AnyFbtNode;
  // A general purpose "options" object that will be customized in child classes
  +options: Options;

  _variationFactorValues: $ReadOnlyArray<SVArgument> = [];

  constructor({
    children,
    moduleName,
    node,
    parent,
  }: {|
    children?: ?$ReadOnlyArray<MaybeChildNode>,
    moduleName: JSModuleNameType,
    node: CurBabelNode,
    parent?: ?AnyFbtNode,
  |}): void {
    this.moduleName = moduleName;
    this.node = node;
    if (parent != null) {
      this.parent = parent;
    }
    this.children = children != null ? [...children] : [];
    this.nodeChecker = FbtNodeChecker.forModule(moduleName);
    this.options = this.getOptions();
    this.initCheck();
  }

  /**
   * Return this fbt construct's options that'll be stored in `this.options`
   * just after constructing this class instance.
   */
  getOptions(): Options {
    throw errorAt(
      this.node,
      'This method must be implemented in a child class',
    );
  }

  /**
   * Run integrity checks to ensure this fbt construct is in a valid state
   * These checks are non-exhaustive. Some new exceptions may arise later on.
   */
  initCheck(): void {}

  _clone(): this {
    const {constructor: Constructor} = this;
    return new Constructor({
      children: this.children,
      moduleName: this.moduleName,
      node: this.node,
      parent: this.parent,
    });
  }

  _setStringVariationValues(
    variationFactorValues: $ReadOnlyArray<SVArgument>,
  ): this {
    this._variationFactorValues = variationFactorValues;
    return this;
  }

  setParent(parent: ?AnyFbtNode): this {
    // $FlowExpectedError[cannot-write] Allow writing this property internally
    this.parent = parent;
    return this;
  }

  appendChild(child: ?MaybeChildNode): this {
    if (child != null) {
      this.children.push(child);
      child.setParent(this);
    }
    return this;
  }

  /**
   * Get the list of string variation arguments (SVArgument) for this node and all its children.
   * Note that the node tree is explored using the "postorder traversal" algorithm
   * (I.e. left, right, root)
   */
  getArgsForStringVariationCalc(): $ReadOnlyArray<SVArgument> {
    throw errorAt(
      this.node,
      'This method must be implemented in a child class',
    );
  }

  getText(_argsMap: StringVariationArgsMap): string {
    throw errorAt(
      this.node,
      'This method must be implemented in a child class',
    );
  }

  getTokenAliases(_argsMap: StringVariationArgsMap): ?TokenAliases {
    return null;
  }

  getTokenName(_argsMap: StringVariationArgsMap): ?string {
    return null;
  }

  /**
   * For debugging and unit tests:
   *
   * Since BabelNode objects are pretty deep and filled with low-level properties
   * that we don't really care about, we'll process any BabelNode property of this object so that:
   *
   *   - we convert the property value to a string like `'BabelNode[type=SomeBabelType]'`
   *   - we add a new property like `__*propName*Code` whose value will
   *     be the JS source code of the original BabelNode.
   *
   * String variation arguments will also be serialized for debugging purpose.
   *
   * See snapshot `fbtFunctional-test.js.snap` to find output examples.
   */
  __toJSONForTestsOnly(): mixed {
    let stringVariationArgs;
    try {
      stringVariationArgs = this.getArgsForStringVariationCalc();
    } catch (error) {
      if (
        error.message.includes(
          'This method must be implemented in a child class',
        )
      ) {
        stringVariationArgs = error;
      } else {
        throw error;
      }
    }

    const ret: {options?: ?{}, ...} = {
      ...compactBabelNodeProps(this),
      __stringVariationArgs: stringVariationArgs,
      // Avoid cyclic recursion issues
      parent: this.parent != null ? this.parent.constructor.name : this.parent,
    };

    if (this.options != null) {
      ret.options = compactBabelNodeProps(this.options);
    }

    Object.defineProperty(ret, 'constructor', {
      value: this.constructor,
      enumerable: false,
    });
    return ret;
  }

  toJSON(): mixed {
    return this.__toJSONForTestsOnly();
  }

  /**
   * Returns a JSON-friendly representation of this instance that can be consumed
   * in other programming languages.
   * NOTE: this only represents the current node but not its children!
   */
  toPlainFbtNode(): PlainFbtNode {
    const type = FbtNodeType.cast(
      // $FlowExpectedError[prop-missing] FbtNode child classes have a `type` static property
      this.constructor.type,
    );
    invariant(
      type != null,
      'Expected instance constructor.type property to be a string instead of `%s`',
      varDump(type),
    );
    return {type};
  }

  /**
   * Returns the Babel node from this FbtNode only if it's a BabelNodeCallExpression
   */
  getCallNode(): ?BabelNodeCallExpression {
    return isCallExpression(this.node) ? this.node : null;
  }

  /**
   * Returns the list of BabelNode arguments of this fbt node
   * (assuming that it's based on a JS function call), or null.
   */
  getCallNodeArguments(): ?Array<?BabelNodeCallExpressionArgument> {
    const callNode = this.getCallNode();
    return callNode
      ? // Force null/undefined to be part of the array so that the consumer of this function
        // will have to do null-checks.
        // $FlowExpectedError[incompatible-return]
        callNode.arguments
      : null;
  }

  /**
   * Returns the first parent FbtNode that is an instance of the given class.
   */
  getFirstAncestorOfType<N>(ancestorConstructor: Class<N>): ?N {
    for (let {parent} = this; parent != null; parent = parent.parent) {
      if (parent instanceof ancestorConstructor) {
        return parent;
      }
    }
    return null;
  }

  /**
   * Returns the fbt runtime argument (as a BabelNode) that will be used to by an fbt runtime call.
   * I.e.
   * Given the fbt runtime call:
   *
   *   fbt._(jsfbtTable, [
   *     <<runtimeFbtArg>>
   *   ])
   *
   * This method is responsible to generate <<runtimeFbtArg>>
   */
  getFbtRuntimeArg(): ?BabelNodeCallExpression {
    throw errorAt(
      this.node,
      'This method must be implemented in a child class',
    );
  }

  /**
   * Throws error if a function call or class instantiation call exists in
   * any of the fbt's arguments that have impact on string variation.
   *
   * Arguments that decide string variations:
   *  fbt:element: the 'subject' value
   *  fbt:plural: the 'count' value. 'value' is okay
   *  fbt:param: the 'gender/number' value. 'value' is okay
   *  fbt:pronoun: the 'gender' value
   *  fbt:enum: the 'enum' value
   */
  throwIfAnyArgumentContainsFunctionCallOrClassInstantiation(
    scope: Scope<BabelNodeCallExpression>,
  ) {
    const argsToCheck = this.getArgsThatShouldNotContainFunctionCallOrClassInstantiation();
    for (const argumentName in argsToCheck) {
      const argument = argsToCheck[argumentName];
      if (isCallExpression(argument) || isNewExpression(argument)) {
        throw errorAt(
          this.node,
          'Expect string variation runtime arguments to not be' +
            ' function calls or class instantiations,' +
            ` but "${argumentName}" argument is a function call or class instantiation.`,
        );
      }
      // Look for function or class call nested in the argument
      traverse(
        argument,
        {
          'CallExpression|NewExpression'(path) {
            throw errorAt(
              path.node,
              'Expect string variation runtime arguments to not contain' +
                ' function calls or class instantiations,' +
                ` but "${argumentName}" argument contains a function call or class instantiation.`,
            );
          },
        },
        scope,
      );
    }
  }

  getArgsThatShouldNotContainFunctionCallOrClassInstantiation(): $ReadOnly<{
    [argName: string]: BabelNodeCallExpressionArg,
  }> {
    return {};
  }
}

module.exports = FbtNode;
