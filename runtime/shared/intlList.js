/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p intl
 *
 * Renders a list of items, similar to :fbt:large-list / :intl:large-list. This
 * is similar to doing .join(', ') but is culturally-aware (uses fbt calls) and
 * by default prepends a conjunction ("and" or "or") to the final item. This
 * conjunction is optional.
 *
 * @format
 * @fbt {"project": "intl-core"}
 * @typechecks
 * @flow strict-local
 * @emails oncall+i18n_fbt_js
 */

// flowlint ambiguous-object-type:error

'use strict';

const fbt = require('fbt');
const invariant = require('invariant');
const React = require('react');

const CONJUNCTIONS = {
  AND: 'AND',
  NONE: 'NONE',
  OR: 'OR',
};

const DELIMITERS = {
  BULLET: 'BULLET',
  COMMA: 'COMMA',
  SEMICOLON: 'SEMICOLON',
};

const intlList = function <TItem: React.Node>(
  items: $ReadOnlyArray<TItem>,
  conjunction: ?$Keys<typeof CONJUNCTIONS>,
  delimiter: ?$Keys<typeof DELIMITERS>,
): TItem | Fbt {
  if (__DEV__) {
    items.forEach(function (item) {
      invariant(
        typeof item === 'string' || React.isValidElement(item),
        'Must provide a string or ReactComponent to intlList.',
      );
    });
  }

  const count = items.length;
  if (count === 0) {
    return '';
  } else if (count === 1) {
    return items[0];
  }

  const lastItem = items[count - 1];
  let output = items[0];

  for (let i = 1; i < count - 1; ++i) {
    switch (delimiter) {
      case DELIMITERS.SEMICOLON:
        output = (
          <fbt
            desc={
              'A list of items of various types, for example: ' +
              '"Menlo Park, CA; Seattle, WA; New York City, NY". ' +
              '{previous items} and {following items} are themselves ' +
              'lists that contain one or more items.'
            }>
            <fbt:param name="previous items">{output}</fbt:param>
            {'; '}
            <fbt:param name="following items">{items[i]}</fbt:param>
          </fbt>
        );
        break;
      case DELIMITERS.BULLET:
        output = (
          <fbt
            desc={
              'A list of items of various types separated by bullets, for example: ' +
              '"Menlo Park, CA \u2022 Seattle, WA \u2022 New York City, NY". ' +
              '{previous items} and {following items} are themselves ' +
              'lists that contain one or more items.'
            }>
            <fbt:param name="previous items">{output}</fbt:param> &bull;{' '}
            <fbt:param name="following items">{items[i]}</fbt:param>
          </fbt>
        );
        break;
      default:
        output = (
          <fbt
            desc={
              'A list of items of various types. {previous items} and' +
              ' {following items} are themselves lists that contain one or' +
              ' more items.'
            }>
            <fbt:param name="previous items">{output}</fbt:param>
            {', '}
            <fbt:param name="following items">{items[i]}</fbt:param>
          </fbt>
        );
    }
  }

  return _getConjunction(
    output,
    lastItem,
    conjunction || CONJUNCTIONS.AND,
    delimiter || DELIMITERS.COMMA,
  );
};

function _getConjunction(
  list: React.Node,
  lastItem: React.Node,
  conjunction: $Keys<typeof CONJUNCTIONS>,
  delimiter: ?$Keys<typeof DELIMITERS>,
): Fbt {
  switch (conjunction) {
    case CONJUNCTIONS.AND:
      return (
        <fbt
          desc={
            'A list of items of various types, for example:' +
            ' "item1, item2, item3 and item4"'
          }>
          <fbt:param name="list of items">{list}</fbt:param>
          and
          <fbt:param name="last item">{lastItem}</fbt:param>
        </fbt>
      );

    case CONJUNCTIONS.OR:
      return (
        <fbt
          desc={
            'A list of items of various types, for example:' +
            ' "item1, item2, item3 or item4"'
          }>
          <fbt:param name="list of items">{list}</fbt:param>
          or
          <fbt:param name="last item">{lastItem}</fbt:param>
        </fbt>
      );

    case CONJUNCTIONS.NONE:
      switch (delimiter) {
        case DELIMITERS.SEMICOLON:
          return (
            <fbt
              desc={
                'A list of items of various types, for example:' +
                ' "Menlo Park, CA; Seattle, WA; New York City, NY". ' +
                '{previous items} itself contains one or more items.'
              }>
              <fbt:param name="previous items">{list}</fbt:param>
              {'; '}
              <fbt:param name="last item">{lastItem}</fbt:param>
            </fbt>
          );
        case DELIMITERS.BULLET:
          return (
            <fbt
              desc={
                'A list of items of various types separated by bullets, for example: ' +
                '"Menlo Park, CA \u2022 Seattle, WA \u2022 New York City, NY". ' +
                '{previous items} contains one or more items.'
              }>
              <fbt:param name="list of items">{list}</fbt:param> &bull;{' '}
              <fbt:param name="last item">{lastItem}</fbt:param>
            </fbt>
          );
        default:
          return (
            <fbt
              desc={
                'A list of items of various types, for example:' +
                ' "item1, item2, item3, item4"'
              }>
              <fbt:param name="list of items">{list}</fbt:param>
              {', '}
              <fbt:param name="last item">{lastItem}</fbt:param>
            </fbt>
          );
      }
    default:
      invariant(
        false,
        'Invalid conjunction %s provided to intlList',
        conjunction,
      );
  }
}

intlList.DELIMITERS = DELIMITERS;
intlList.CONJUNCTIONS = CONJUNCTIONS;

type IntlListExport = {|
  <TItem: React.Node>(
    items: $ReadOnlyArray<TItem>,
    conjunction: ?$Keys<typeof CONJUNCTIONS>,
    delimiter: ?$Keys<typeof DELIMITERS>,
  ): TItem | Fbt,

  DELIMITERS: typeof DELIMITERS,
  CONJUNCTIONS: typeof CONJUNCTIONS,
|};

module.exports = (intlList: IntlListExport);
