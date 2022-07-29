/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict
 * @format
 * @oncall i18n_fbt_js
 */

/* eslint max-len: ["warn", 120] */
/* eslint-disable fb-www/gender-neutral-language */

'use strict';

type GenderConfig = {|
  is_male: boolean,
  is_female: boolean,
  is_neuter: boolean,
  is_plural: boolean,
  is_mixed: boolean,
  is_guess: boolean,
  is_unknown: boolean,
  subject: string,
  possessive: string,
  reflexive: string,
  object: string,
  string: string,
|};

export type GenderConstEnum = $GenderConstEnum;

// Keep this in sync with GenderConst.js (of the fbt npm module)
// TODO(T70508769) Figure out a way to keep this in sync more transparently
const GENDER_CONST = Object.freeze({
  NOT_A_PERSON: ((0: $FlowExpectedError): GenderConstEnum),
  FEMALE_SINGULAR: ((1: $FlowExpectedError): GenderConstEnum),
  MALE_SINGULAR: ((2: $FlowExpectedError): GenderConstEnum),
  FEMALE_SINGULAR_GUESS: ((3: $FlowExpectedError): GenderConstEnum),
  MALE_SINGULAR_GUESS: ((4: $FlowExpectedError): GenderConstEnum),
  // 5 seems to indicate a group of people who may be of mixed gender
  MIXED_UNKNOWN: ((5: $FlowExpectedError): GenderConstEnum),
  NEUTER_SINGULAR: ((6: $FlowExpectedError): GenderConstEnum),
  UNKNOWN_SINGULAR: ((7: $FlowExpectedError): GenderConstEnum),
  FEMALE_PLURAL: ((8: $FlowExpectedError): GenderConstEnum),
  MALE_PLURAL: ((9: $FlowExpectedError): GenderConstEnum),
  NEUTER_PLURAL: ((10: $FlowExpectedError): GenderConstEnum),
  UNKNOWN_PLURAL: ((11: $FlowExpectedError): GenderConstEnum),
});

const data: {[GenderConstEnum]: GenderConfig} = {
  // $FlowExpectedError[invalid-computed-prop] Tolerate using an opaque type as an object key
  [GENDER_CONST.NOT_A_PERSON]: {
    is_male: false,
    is_female: false,
    is_neuter: false,
    is_plural: false,
    is_mixed: false,
    is_guess: false,
    is_unknown: true,
    subject: 'they',
    possessive: 'their',
    reflexive: 'themself',
    object: 'this',
    string: 'unknown',
  },
  // $FlowExpectedError[invalid-computed-prop] Tolerate using an opaque type as an object key
  [GENDER_CONST.UNKNOWN_SINGULAR]: {
    is_male: false,
    is_female: false,
    is_neuter: false,
    is_plural: false,
    is_mixed: false,
    is_guess: false,
    is_unknown: true,
    subject: 'they',
    possessive: 'their',
    reflexive: 'themself',
    object: 'them',
    string: 'unknown singular',
  },
  // $FlowExpectedError[invalid-computed-prop] Tolerate using an opaque type as an object key
  [GENDER_CONST.FEMALE_SINGULAR]: {
    is_male: false,
    is_female: true,
    is_neuter: false,
    is_plural: false,
    is_mixed: false,
    is_guess: false,
    is_unknown: false,
    subject: 'she',
    possessive: 'her',
    reflexive: 'herself',
    object: 'her',
    string: 'female singular',
  },
  // $FlowExpectedError[invalid-computed-prop] Tolerate using an opaque type as an object key
  [GENDER_CONST.FEMALE_SINGULAR_GUESS]: {
    is_male: false,
    is_female: true,
    is_neuter: false,
    is_plural: false,
    is_mixed: false,
    is_guess: true,
    is_unknown: false,
    subject: 'she',
    possessive: 'her',
    reflexive: 'herself',
    object: 'her',
    string: 'female singular',
  },
  // $FlowExpectedError[invalid-computed-prop] Tolerate using an opaque type as an object key
  [GENDER_CONST.MALE_SINGULAR]: {
    is_male: true,
    is_female: false,
    is_neuter: false,
    is_plural: false,
    is_mixed: false,
    is_guess: false,
    is_unknown: false,
    subject: 'he',
    possessive: 'his',
    reflexive: 'himself',
    object: 'him',
    string: 'male singular',
  },
  // $FlowExpectedError[invalid-computed-prop] Tolerate using an opaque type as an object key
  [GENDER_CONST.MALE_SINGULAR_GUESS]: {
    is_male: true,
    is_female: false,
    is_neuter: false,
    is_plural: false,
    is_mixed: false,
    is_guess: true,
    is_unknown: false,
    subject: 'he',
    possessive: 'his',
    reflexive: 'himself',
    object: 'him',
    string: 'male singular',
  },
  // $FlowExpectedError[invalid-computed-prop] Tolerate using an opaque type as an object key
  [GENDER_CONST.NEUTER_SINGULAR]: {
    is_male: false,
    is_female: false,
    is_neuter: true,
    is_plural: false,
    is_mixed: false,
    is_guess: false,
    is_unknown: false,
    subject: 'they',
    possessive: 'their',
    reflexive: 'themself',
    object: 'them',
    string: 'neuter singular',
  },
  // $FlowExpectedError[invalid-computed-prop] Tolerate using an opaque type as an object key
  [GENDER_CONST.MIXED_UNKNOWN]: {
    is_male: false,
    is_female: false,
    is_neuter: false,
    is_plural: true,
    is_mixed: true,
    is_guess: false,
    is_unknown: false,
    subject: 'they',
    possessive: 'their',
    reflexive: 'themselves',
    object: 'them',
    string: 'mixed plural',
  },
  // $FlowExpectedError[invalid-computed-prop] Tolerate using an opaque type as an object key
  [GENDER_CONST.FEMALE_PLURAL]: {
    is_male: false,
    is_female: true,
    is_neuter: false,
    is_plural: true,
    is_mixed: false,
    is_guess: false,
    is_unknown: false,
    subject: 'they',
    possessive: 'their',
    reflexive: 'themselves',
    object: 'them',
    string: 'female plural',
  },
  // $FlowExpectedError[invalid-computed-prop] Tolerate using an opaque type as an object key
  [GENDER_CONST.MALE_PLURAL]: {
    is_male: true,
    is_female: false,
    is_neuter: false,
    is_plural: true,
    is_mixed: false,
    is_guess: false,
    is_unknown: false,
    subject: 'they',
    possessive: 'their',
    reflexive: 'themselves',
    object: 'them',
    string: 'male plural',
  },
  // $FlowExpectedError[invalid-computed-prop] Tolerate using an opaque type as an object key
  [GENDER_CONST.NEUTER_PLURAL]: {
    is_male: false,
    is_female: false,
    is_neuter: true,
    is_plural: true,
    is_mixed: false,
    is_guess: false,
    is_unknown: false,
    subject: 'they',
    possessive: 'their',
    reflexive: 'themselves',
    object: 'them',
    string: 'neuter plural',
  },
  // $FlowExpectedError[invalid-computed-prop] Tolerate using an opaque type as an object key
  [GENDER_CONST.UNKNOWN_PLURAL]: {
    is_male: false,
    is_female: false,
    is_neuter: false,
    is_plural: true,
    is_mixed: false,
    is_guess: false,
    is_unknown: true,
    subject: 'they',
    possessive: 'their',
    reflexive: 'themselves',
    object: 'them',
    string: 'unknown plural',
  },
};

function getData(
  gender: GenderConstEnum,
  usage: $Keys<GenderConfig>,
): boolean | string {
  return data[gender]
    ? data[gender][usage]
    : data[GENDER_CONST.NOT_A_PERSON][usage];
}

module.exports = {getData, GENDER_CONST};
