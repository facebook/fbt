/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow strict
 */

/*::
export type IntlVariationsEnum = $IntlVariationsEnum;
*/

// Must match with `IntlVariations.js`
const IntlNumberVariations = {
  // Cast below values to IntlVariationsEnum
  ZERO: ((16 /*: $FlowExpectedError */) /*: IntlVariationsEnum */), //  0b10000
  ONE: ((4 /*: $FlowExpectedError */) /*: IntlVariationsEnum */), //    0b00100
  TWO: ((8 /*: $FlowExpectedError */) /*: IntlVariationsEnum */), //    0b01000
  FEW: ((20 /*: $FlowExpectedError */) /*: IntlVariationsEnum */), //   0b10100
  MANY: ((12 /*: $FlowExpectedError */) /*: IntlVariationsEnum */), //  0b01100
  OTHER: ((24 /*: $FlowExpectedError */) /*: IntlVariationsEnum */), // 0b11000
};

// Must match with `IntlVariations.js`
const IntlGenderVariations = {
  // Cast below values to IntlVariationsEnum
  MALE: ((1 /*: $FlowExpectedError */) /*: IntlVariationsEnum */),
  FEMALE: ((2 /*: $FlowExpectedError */) /*: IntlVariationsEnum */),
  UNKNOWN: ((3 /*: $FlowExpectedError */) /*: IntlVariationsEnum */),
};

// Two bitmasks for representing gender/number variations.  Give a bit
// between number/gender in case CLDR ever exceeds 7 options
const IntlVariationMask = {
  NUMBER: 0x1c, // 0b11100
  GENDER: 0x03, // 0b00011
};

const IntlFbtVariationType = {
  GENDER: 1,
  NUMBER: 2,
  PRONOUN: 3,
};

// This is not CLDR, but an fbt-specific marker that exists so that
// singular phrases are not overwritten by multiplexed plural phrases
// with a singular entry
const EXACTLY_ONE = '_1';

const SPECIALS = {
  // The default entry.  When no entry exists, we fallback to this in the fbt
  // table access logic.
  '*': true,
  EXACTLY_ONE: true,
};

function getType(
  n /*: $Values<typeof IntlVariationMask> */,
) /*: $Values<typeof IntlVariationMask> */ {
  if (!isValidValue(n)) {
    throw new Error('Invalid NumberType: ' + n);
  }
  /*eslint no-bitwise: 0*/
  return n & IntlVariationMask.NUMBER
    ? IntlVariationMask.NUMBER
    : IntlVariationMask.GENDER;
}

function isValidValue(value /*: string | number */) /*: boolean */ {
  const num = Number(value);
  /*eslint no-bitwise: 0*/
  return (
    SPECIALS[value] ||
    (num & IntlVariationMask.NUMBER && !(num & ~IntlVariationMask.NUMBER)) ||
    (num & IntlVariationMask.GENDER && !(num & ~IntlVariationMask.GENDER))
  );
}

module.exports = {
  Number: IntlNumberVariations,
  Gender: IntlGenderVariations,
  Mask: IntlVariationMask,
  FbtVariationType: IntlFbtVariationType,
  isValidValue,
  getType,
  EXACTLY_ONE,
  VIEWING_USER: '__viewing_user__',
  SUBJECT: '__subject__',
};
