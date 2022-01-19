/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 * @flow strict-local
 */
/*eslint max-len: ["error", 100]*/

'use strict';

enum FbtNodeType /* of string */ {
  Element = 'element',
  Enum = 'enum',
  ImplicitParam = 'implicitParam',
  Name = 'name',
  Param = 'param',
  Plural = 'plural',
  Pronoun = 'pronoun',
  SameParam = 'sameParam',
  Text = 'text',
}

module.exports = FbtNodeType;
