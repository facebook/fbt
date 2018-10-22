/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p fbt --remote localhost:~/www
 *
 * @flow strict
 * @format
 * @emails oncall+internationalization
 */

'use strict';

import type {DisplayGenderConstType} from 'DisplayGenderConst';

const DisplayGenderConst = require('DisplayGenderConst');
const GenderConst = require('GenderConst');

const invariant = require('invariant');

/**
 * Map an array of genders to a single value.
 * Logic here mirrors that of :fbt:pronoun::render().
 */
function fromMultiple(genders: Array<number>): number {
  invariant(0 < genders.length, 'Cannot have pronoun for zero people');
  return genders.length === 1 ? genders[0] : GenderConst.UNKNOWN_PLURAL;
}

/**
 * Maps a DisplayGenderConst value (usually retrieved through the Gender
 * GraphQL type) to a GenderConst value usable by Fbt.
 */
function fromDisplayGender(gender: DisplayGenderConstType): number {
  switch (gender) {
    case DisplayGenderConst.MALE:
      return GenderConst.MALE_SINGULAR;
    case DisplayGenderConst.FEMALE:
      return GenderConst.FEMALE_SINGULAR;
    case DisplayGenderConst.NEUTER:
      return GenderConst.NEUTER_SINGULAR;
    default:
      return GenderConst.NOT_A_PERSON;
  }
}

module.exports = {
  fromMultiple,
  fromDisplayGender,
};
