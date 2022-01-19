/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @emails oncall+i18n_fbt_js
 * @flow strict
 * @format
 */

'use strict';

/**
 * Escapes regex special characters from a string, so it can be
 * used as a raw search term inside an actual regex.
 */
function escapeRegex(str: string): string {
  // From http://stackoverflow.com/questions/14076210/
  return str.replace(/([.?*+\^$\[\]\\(){}|\-])/g, '\\$1');
}

module.exports = escapeRegex;
