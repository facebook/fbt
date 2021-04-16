/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/

'use strict';

/*::
import type {GenderConstEnum} from '../Gender';

export type AnyStringVariationArg =
  | EnumStringVariationArg
  | GenderStringVariationArg
  | NumberStringVariationArg
  ;
export type AnyFbtArgument = GenericArg | AnyStringVariationArg;
*/

const {compactBabelNodeProps} = require('../FbtUtil');

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
  /*:: +node: B; */

  constructor(node /*: B */) {
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
    const ret = compactBabelNodeProps(this);
    Object.defineProperty(ret, 'constructor', {value: this.constructor, enumerable: false});
    return ret;
  }

  toJSON() /*: mixed */ {
    return this.__toJSONForTestsOnly();
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
class StringVariationArg /*:: <V, B: ?BabelNode = BabelNode> */
  extends FbtArgumentBase /*:: <B> */ {
  /*:: +value: ?V; */

  constructor(node /*: B */, value /*: ?V */) {
    super(node);
    this.value = value;
  }
}

/**
 * String variation argument that produces variations based on a string enum
 */
class EnumStringVariationArg extends StringVariationArg /*:: <string> */ {
}

/**
 * String variation argument that produces variations based on genders
 */
class GenderStringVariationArg extends StringVariationArg /*:: <GenderConstEnum> */ {
}

/**
 * String variation argument that produces variations based on numbers
 */
class NumberStringVariationArg extends StringVariationArg /*:: <number, ?BabelNode> */ {
}

module.exports = {
  EnumStringVariationArg,
  FbtArgumentBase,
  GenderStringVariationArg,
  GenericArg,
  NumberStringVariationArg,
  StringVariationArg,
};
