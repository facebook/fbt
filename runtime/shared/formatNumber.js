/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p fbt --local ~/www
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

const fbs = require('fbs');
const intlNumUtils = require('intlNumUtils');

function formatNumber(value: number, decimals?: ?number): string {
  return intlNumUtils.formatNumber(value, decimals);
}

function getAtLeastString(maxNumber: number, decimals?: ?number): Fbs {
  // after we start using CLDR data, it will not be fbt anymore.
  return (
    <fbs desc="Label with meaning 'at least number'" project="locale_data">
      <fbs:param name="number" number={maxNumber}>
        {intlNumUtils.formatNumberWithThousandDelimiters(maxNumber, decimals)}
      </fbs:param>
      {'+'}
    </fbs>
  );
}

function getLessThanString(minNumber: number, decimals?: ?number): Fbs {
  // after we start using CLDR data, it will not be fbt anymore.
  return (
    <fbs desc="Label with meaning 'less than number'" project="locale_data">
      {'<'}
      <fbs:param name="number" number={minNumber}>
        {intlNumUtils.formatNumberWithThousandDelimiters(minNumber, decimals)}
      </fbs:param>
    </fbs>
  );
}

function formatNumberWithMaxLimit(
  value: number,
  maxvalue: number,
  decimals?: ?number,
): Fbs | string {
  return value > maxvalue
    ? getAtLeastString(maxvalue, decimals)
    : intlNumUtils.formatNumberWithThousandDelimiters(value, decimals);
}

function formatNumberWithMinLimit(
  value: number,
  minvalue: number,
  decimals?: ?number,
): Fbs | string {
  return value < minvalue
    ? getLessThanString(minvalue, decimals)
    : intlNumUtils.formatNumberWithThousandDelimiters(value, decimals);
}

formatNumber.withThousandDelimiters =
  intlNumUtils.formatNumberWithThousandDelimiters;
formatNumber.withMaxLimit = formatNumberWithMaxLimit;
formatNumber.withMinLimit = formatNumberWithMinLimit;

module.exports = formatNumber;
