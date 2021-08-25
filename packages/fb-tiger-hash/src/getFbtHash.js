/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Intended for use with the Facebook FBT framework.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 * @flow strict
 */

'use strict';

const Tiger = require('./Tiger');
const tiger = new Tiger(Tiger.L128, 0, true);

/**
 * Takes an fbt text and description and returns the unique identifier as calculated by
 * the FB version of tiger128 (old flipped-endian PHP version).
 *
 * @example
 *   yarn fbt-collect --hash-module 'fb-tiger-hash/src/getFbtHash' ...
 */
function getFbtHash(
  text /*: string */,
  description /*: string */,
) /*: string */ {
  return tiger.hash(text + ':::' + description + ':');
}

module.exports = getFbtHash;
