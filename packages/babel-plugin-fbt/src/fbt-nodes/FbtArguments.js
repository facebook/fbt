/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/

'use strict';

/*::
import type {EnumKey} from '../FbtEnumRegistrar';
import type {GenderConstEnum} from '../Gender';
import typeof {
  EXACTLY_ONE,
  GENDER_ANY,
  NUMBER_ANY,
} from '../translate/IntlVariations';
import type CursorArray from '../utils/CursorArray';
import type {AnyFbtNode} from './FbtNode';

export type AnyStringVariationArg =
  | EnumStringVariationArg
  | GenderStringVariationArg
  | NumberStringVariationArg
  ;
export type AnyFbtArgument = GenericArg | AnyStringVariationArg;
// List of String Variation Arguments with a mutable cursor index field
export type SVArgsList = CursorArray<AnyStringVariationArg>;
*/

const {
  compactBabelNodeProps,
  getRawSource,
  varDump,
} = require('../FbtUtil');
const invariant = require('invariant');

/**
 * Base class representing fbt construct arguments that support dynamic values at runtime.
 *
 * E.g.
 *
 *    <fbt:plural
 *      count={
 *        numParticipants             <-- FbtArgumentBase
 *      }
 *      value={
 *        formatted(numParticipants)  <-- FbtArgumentBase
 *      }
 *      showCount="yes"               <-- hard-coded, so not an FbtArgumentBase
 *    >
 *      challenger
 *    </fbt:plural>
 */
class FbtArgumentBase /*:: <B: ?BabelNode> */ {
  /*::
  // Reference of the FbtNode creator of this instance
  +fbtNode: AnyFbtNode;
  // BabelNode representing the value of this argument
  +node: B;
  */

  constructor(fbtNode /*: AnyFbtNode */, node /*: B */) {
    this.fbtNode = fbtNode;
    this.node = node;
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
   * See snapshot `fbtFunctional-test.js.snap` to find output examples.
   */
  __toJSONForTestsOnly() /*: mixed */ {
    const {fbtNode} = this;
    const ret = compactBabelNodeProps({
      ...this,
      fbtNode: fbtNode != null ? fbtNode.constructor.name : fbtNode,
    });
    Object.defineProperty(ret, 'constructor', {value: this.constructor, enumerable: false});
    return ret;
  }

  toJSON() /*: mixed */ {
    return this.__toJSONForTestsOnly();
  }

  getArgCode(code: string): string {
    invariant(
      !!this.node,
      'Unable to find Babel node object from string variation argument: %s',
      varDump(this),
    );
    return getRawSource(code, this.node);
  }
}

/**
 * Special fbt argument that does NOT produce string variations.
 *
 * E.g.
 *
 *    <fbt:plural
 *      count={
 *        numParticipants             <-- NumberStringVariationArg
 *      }
 *      value={
 *        formatted(numParticipants)  <-- GenericArg (used for UI display only)
 *      }
 *      showCount="yes"
 *    >
 *      challenger
 *    </fbt:plural>
 */
class GenericArg extends FbtArgumentBase /*:: <BabelNode> */ {
}

/**
 * Given an fbt callsite that may generate multiple string variations,
 * we know that these variations are issued from some specific arguments.
 *
 * This is the base class that represents these string variation arguments.
 *
 * I.e.
 *
 *     fbt(
 *       [
 *         'Wish ',
 *         fbt.pronoun(
 *           'object',
 *           personGender, // <-- the string varation argument
 *           {human: true}
 *         ),
 *         ' a happy birthday.',
 *       ],
 *       'text with pronoun',
 *     );
 *
 * The string variation argument would be based on the `personGender` variable.
 */
class StringVariationArg /*:: <Value, B: ?BabelNode = BabelNode> */
  extends FbtArgumentBase /*:: <B> */ {

  /**
   * List of candidate values that this SVArgument might have.
   */
  +candidateValues: $ReadOnlyArray<Value>;

  /**
   * Current SVArgument value of this instance among candidates from `candidateValues`.
   */
  +value: ?Value;

  constructor(
    fbtNode /*: AnyFbtNode */,
    node /*: B */,
    candidateValues /*: $ReadOnlyArray<Value> */,
    value /*: ?Value */,
  ) {
    super(fbtNode, node);
    this.candidateValues = candidateValues;
    this.value = value;
  }

  cloneWithValue(value /*: Value */) /*: this */ {
    return new this.constructor(
      this.fbtNode,
      this.node,
      this.candidateValues,
      value,
    );
  }
}

/**
 * String variation argument that produces variations based on a string enum
 */
class EnumStringVariationArg extends StringVariationArg /*:: <EnumKey> */ {
}

/**
 * String variation argument that produces variations based on genders
 */
class GenderStringVariationArg extends StringVariationArg /*:: <GenderConstEnum | GENDER_ANY> */ {
}

/**
 * String variation argument that produces variations based on numbers
 */
class NumberStringVariationArg extends StringVariationArg<NUMBER_ANY | EXACTLY_ONE, ?BabelNode> {
}

module.exports = {
  EnumStringVariationArg,
  FbtArgumentBase,
  GenderStringVariationArg,
  GenericArg,
  NumberStringVariationArg,
  StringVariationArg,
};
