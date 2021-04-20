/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/
/* eslint-disable brace-style */ // Needed due to Flow types inlined in comments
/* eslint-disable fb-www/flow-exact-by-default-object-types */

'use strict';

/*::
import type {AnyStringVariationArg, AnyFbtArgument, StringVariationArgsMap} from './FbtArguments';
import type {BabelNodeCallExpressionArgument} from '../FbtUtil';
import type {GenderConstEnum} from '../Gender';
import type {JSModuleNameType} from '../FbtConstants';
import type {TokenAliases} from '../index.js';

import type FbtElementNode from './FbtElementNode';
import type FbtEnumNode from './FbtEnumNode';
import type FbtImplicitParamNode from './FbtImplicitParamNode';
import type FbtNameNode from './FbtNameNode';
import type FbtParamNode from './FbtParamNode';
import type FbtPluralNode from './FbtPluralNode';
import type FbtPronounNode from './FbtPronounNode';
import type FbtSameParamNode from './FbtSameParamNode';
import type FbtTextNode from './FbtTextNode';

export type FbtChildNode =
  | FbtEnumNode
  | FbtImplicitParamNode
  | FbtNameNode
  | FbtParamNode
  | FbtPluralNode
  | FbtPronounNode
  | FbtSameParamNode
  | FbtTextNode;
export type AnyFbtNode = FbtNode<any, any, any>;
*/

export type PlainJSXNode = {|
  babelNode: BabelNodeJSXOpeningElement,
  // Simplified representation of the JSX opening element's attributes for convenience.
  // We're currently only representing string literal attributes because it's not fully clear
  // how we'd want to represent other more complex types of attribute values.
  // The `babelNode` field already provides full access to the Babel AST after all.
  props: $ReadOnly<{[name: string]: string | number}>,
  type: string,
|};
export type PlainFbtNode = {|
  type:
    | $PropertyType<Class<FbtElementNode>, 'type'>
    | $PropertyType<Class<FbtEnumNode>, 'type'>
    | $PropertyType<Class<FbtNameNode>, 'type'>
    | $PropertyType<Class<FbtParamNode>, 'type'>
    | $PropertyType<Class<FbtPluralNode>, 'type'>
    | $PropertyType<Class<FbtPronounNode>, 'type'>
    | $PropertyType<Class<FbtSameParamNode>, 'type'>
    | $PropertyType<Class<FbtTextNode>, 'type'>
    | $PropertyType<Class<FbtImplicitParamNode>, 'type'>,
  +children?: $ReadOnlyArray<PlainFbtNode>,
  // Not read-only because it needs to be set at a later stage, when all phrases have been extracted
  phraseIndex?: number,
  wrapperNode?: PlainJSXNode,
|};

const FbtNodeChecker = require('../FbtNodeChecker');
const {
  compactBabelNodeProps,
  errorAt,
  varDump,
} = require('../FbtUtil');
const {
  isCallExpression,
} = require('@babel/types');
const invariant = require('invariant');

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
class FbtNode/*:: <
    SVArgument: AnyStringVariationArg | empty = empty,
    CurBabelNode: BabelNode = BabelNode,
    MaybeChildNode: ?FbtChildNode = null,
  > */ {

  /*::
  +moduleName: JSModuleNameType;
  +children: Array<MaybeChildNode>;
  // Reference to the BabelNode that this fbt node represents
  +node: CurBabelNode;
  +nodeChecker: FbtNodeChecker;
  +parent: ?AnyFbtNode;
  // A general purpose "options" object that will be customized in child classes
  +options: ?{};
  */

  _variationFactorValues /*: $ReadOnlyArray<SVArgument> */ = [];

  constructor({
    children,
    moduleName,
    node,
    parent,
  } /*: {|
    children?: ?$ReadOnlyArray<MaybeChildNode>,
    moduleName: JSModuleNameType,
    node: CurBabelNode,
    parent?: ?AnyFbtNode,
  |}*/) /*: void */ {
    this.moduleName = moduleName;
    this.node = node;
    if (parent != null) {
      this.parent = parent;
    }
    this.children = children != null ? [...children] : [];
    this.nodeChecker = FbtNodeChecker.forModule(moduleName);
    const options = this.getOptions();
    if (options) {
      this.options = options;
    }
    this.initCheck();
  }

  /**
   * Return this fbt construct's options that'll be stored in `this.options`
   * just after constructing this class instance.
   */
  getOptions() /*: ?{} */ {
    return null;
  }

  /**
   * Run integrity checks to ensure this fbt construct is in a valid state
   * These checks are non-exhaustive. Some new exceptions may arise later on.
   */
  initCheck() /*: void */ {
  }

  _clone() /*: this */ {
    const {constructor: Constructor} = this;
    return new Constructor({
      children: this.children,
      moduleName: this.moduleName,
      node: this.node,
      parent: this.parent,
    });
  }

  _setStringVariationValues(
    variationFactorValues /*: $ReadOnlyArray<SVArgument> */,
  ) /*: this */ {
    this._variationFactorValues = variationFactorValues;
    return this;
  }

  setParent(parent /*: ?AnyFbtNode */) /*: this */ {
    // $FlowExpectedError[cannot-write] Allow writing this property internally
    this.parent = parent;
    return this;
  }

  appendChild(child /*: ?MaybeChildNode*/) /*: this */ {
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
  getArgsForStringVariationCalc() /*: $ReadOnlyArray<SVArgument> */ {
    throw errorAt(this.node, 'This method must be implemented in a child class');
  }

  getText(_argsMap /*: StringVariationArgsMap */) /*: string */ {
    throw errorAt(this.node, 'This method must be implemented in a child class');
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
  __toJSONForTestsOnly() /*: mixed */ {
    let stringVariationArgs;
    try {
      stringVariationArgs = this.getArgsForStringVariationCalc();
    } catch (error) {
      if (error.message.includes('This method must be implemented in a child class')) {
        stringVariationArgs = error;
      } else {
        throw error;
      }
    }

    const ret /*: {options?: ?{}, ...} */ = {
      ...compactBabelNodeProps(this),
      __stringVariationArgs: stringVariationArgs,
      // Avoid cyclic recursion issues
      parent: this.parent != null ? this.parent.constructor.name : this.parent,
    };

    if (this.options != null) {
      ret.options = compactBabelNodeProps(this.options);
    }

    Object.defineProperty(ret, 'constructor', {value: this.constructor, enumerable: false});
    return ret;
  }

  toJSON() /*: mixed */ {
    return this.__toJSONForTestsOnly();
  }

  /**
   * Returns a JSON-friendly representation of this instance that can be consumed
   * in other programming languages.
   * NOTE: this only represents the current node but not its children!
   */
  toPlainFbtNode(): PlainFbtNode {
    // $FlowExpectedError[prop-missing] FbtNode child classes have a `type` static property
    const {type} = this.constructor;
    invariant(
      typeof type === 'string',
      'Expected instance constructor.type property to be a string instead of `%s`',
      varDump(type)
    );
    // $FlowExpectedError[incompatible-return] FbtNode child classes have a `type` static property
    return {type};
  }

  /**
   * Returns the Babel node from this FbtNode only if it's a BabelNodeCallExpression
   */
  getCallNode() /*: ?BabelNodeCallExpression */ {
    return isCallExpression(this.node) ? this.node : null;
  }

  /**
   * Returns the list of BabelNode arguments of this fbt node
   * (assuming that it's based on a JS function call), or null.
   */
  getCallNodeArguments() /*: ?Array<?BabelNodeCallExpression> */ {
    const callNode = this.getCallNode();
    return callNode
      // Force null/undefined to be part of the array so that the consumer of this function
      // will have to do null-checks.
      // $FlowExpectedError[incompatible-return]
      ? callNode.arguments
      : null;
  }

  /**
   * Returns the first parent FbtNode that is an instance of the given class.
   */
  getFirstAncestorOfType/*:: <N>*/(ancestorConstructor /*: Class<N> */) /*: ?N */ {
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
    throw errorAt(this.node, 'This method must be implemented in a child class');
  }
}

module.exports = FbtNode;
