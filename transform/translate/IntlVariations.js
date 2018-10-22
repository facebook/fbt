/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 */

const IntlNumberVariations = {
  ZERO: 0x10, //  0b10000
  ONE: 0x4, //    0b00100
  TWO: 0x8, //    0b01000
  FEW: 0x14, //   0b10100
  MANY: 0xc, //   0b01100
  OTHER: 0x18, // 0b11000
};

const IntlGenderVariations = {
  MALE: 1,
  FEMALE: 2,
  UNKNOWN: 3,
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

function getType(n) {
  if (!isValidValue(n)) {
    throw new Error('Invalid NumberType: ' + n);
  }
  /*eslint no-bitwise: 0*/
  return n & IntlVariationMask.NUMBER
    ? IntlVariationMask.NUMBER
    : IntlVariationMask.GENDER;
}

// This is not CLDR, but an fbt-specific marker that exists so that
// singular phrases are not overwritten by multiplexed plural phrases
// with a singular entry
const EXACTLY_ONE = '_1';

const _specials = {
  // The default entry.  When no entry exists, we fallback to this in the fbt
  // table access logic.
  '*': true,
  EXACTLY_ONE: true,
};

function isValidValue(v) {
  /*eslint no-bitwise: 0*/
  return (
    _specials[v] ||
    (v & IntlVariationMask.NUMBER && !(v & ~IntlVariationMask.NUMBER)) ||
    (v & IntlVariationMask.GENDER && !(v & ~IntlVariationMask.GENDER))
  );
}

module.exports = {
  Number: IntlNumberVariations,
  Gender: IntlGenderVariations,
  Mask: IntlVariationMask,
  FbtVariationType: IntlFbtVariationType,
  isValidValue: isValidValue,
  getType: getType,
  EXACTLY_ONE: EXACTLY_ONE,
  VIEWING_USER: '__viewing_user__',
  SUBJECT: '__subject__',
};
