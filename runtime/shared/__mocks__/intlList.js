/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @emails oncall+i18n_fbt_js
 * @flow
 * @format
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
> = jest.fn<
  $ReadOnlyArray<
    ?$Keys<{COMMA: string, SEMICOLON: string}> &
      any &
      $ReadOnlyArray<React$Node> &
      ?$Keys<{AND: string, NONE: string, OR: string}>,
  >,
  string,
>(
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
