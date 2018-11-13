/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow
 * @emails oncall+internationalization
 */

const intlList = jest.fn<$ReadOnlyArray<*>, string>(
  (
    items: $ReadOnlyArray<React$Node>,
    conjunction: ?$Keys<typeof CONJUNCTIONS>,
    delimiter: ?$Keys<typeof DELIMITERS>,
  ) => items.join(conjunction || ','),
);

const CONJUNCTIONS = ((intlList: any).CONJUNCTIONS = {
  AND: '&',
  OR: '|',
  NONE: '',
});

const DELIMITERS = ((intlList: any).DELIMITERS = {
  COMMA: 'COMMA',
  SEMICOLON: 'SEMICOLON',
});

module.exports = intlList;
