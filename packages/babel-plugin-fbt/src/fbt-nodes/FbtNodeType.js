/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
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
