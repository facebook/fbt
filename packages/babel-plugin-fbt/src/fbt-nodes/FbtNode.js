/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/
/* eslint-disable brace-style */ // Needed due to Flow types inlined in comments

'use strict';

/*::
import type {AnyStringVariationArg, AnyFbtArgument, SVArgsList} from './FbtArguments';
import type {BabelNodeCallExpressionArgument} from '../FbtUtil';
import type {GenderConstEnum} from '../Gender';
import type {JSModuleNameType} from '../FbtConstants';

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

const FbtNodeChecker = require('../FbtNodeChecker');
const {
  compactBabelNodeProps,
  errorAt,
} = require('../FbtUtil');
const {
  isCallExpression,
} = require('@babel/types');

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

  /**
   * Clone this node and set new string variation factor values
   */
  cloneUsingStringVariationValues(
    stringVariationValues /*: $ReadOnlyArray<SVArgument> */ = [],
  ) /*: this */ {
    return this._clone()._setStringVariationValues(stringVariationValues);
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

  getText(_argsList /*: SVArgsList */) /*: string */ {
    throw errorAt(this.node, 'This method must be implemented in a child class');
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
   * Returns the Babel node from this FbtNode only if it's a BabelNodeCallExpression
   */
  getCallNode() /*: ?BabelNodeCallExpression */ {
    return isCallExpression(this.node) ? this.node : null;
  }

  /**
   * Returns the list of BabelNode arguments of this fbt node
   * (assuming that it's based on a JS function call), or null.
   */
  getCallNodeArguments() /*: ?Array<?BabelNodeCallExpressionArgument> */ {
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
}

module.exports = FbtNode;
