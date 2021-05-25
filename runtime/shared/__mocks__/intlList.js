/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow
 * @emails oncall+i18n_fbt_js
 */

const intlList: JestMockFn<
  $ReadOnlyArray<
    ?$Keys<
      $TEMPORARY$object<{|
        COMMA: $TEMPORARY$string<'COMMA'>,
        SEMICOLON: $TEMPORARY$string<'SEMICOLON'>,
      |}>,
    > &
      any &
      $ReadOnlyArray<React$Node> &
      ?$Keys<$TEMPORARY$object<{|AND: string, NONE: string, OR: string|}>>,
  >,
  string,
> = jest.fn<$ReadOnlyArray<*>, string>(
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
