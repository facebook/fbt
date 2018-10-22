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
 * @format
 * @flow strict-local
 * @emails oncall+internationalization
 */

'use strict';

const fbt = require('fbt');
const intlNumUtils = require('intlNumUtils');

function formatNumber(value: number, decimals?: ?number): string {
  return intlNumUtils.formatNumber(value, decimals);
}

function getAtLeastString(maxnumber: number, decimals?: ?number): string {
  const result = (
    <fbt desc="Label with meaning 'at least number'" project="locale_data">
      <fbt:param name="number" number={maxnumber}>
        {intlNumUtils.formatNumberWithThousandDelimiters(maxnumber, decimals)}
      </fbt:param>+
    </fbt>
  );
  // after we start using CLDR data, it will not be fbt anymore.
  return result.toString();
}

function getLessThanString(minnumber: number, decimals?: ?number): string {
  const result = (
    <fbt desc="Label with meaning 'less than number'" project="locale_data">
      &lt;<fbt:param name="number" number={minnumber}>
        {intlNumUtils.formatNumberWithThousandDelimiters(minnumber, decimals)}
      </fbt:param>
    </fbt>
  );
  // after we start using CLDR data, it will not be fbt anymore.
  return result.toString();
}

function formatNumberWithMaxLimit(
  value: number,
  maxvalue: number,
  decimals?: ?number,
): string {
  return value > maxvalue
    ? getAtLeastString(maxvalue, decimals)
    : intlNumUtils.formatNumberWithThousandDelimiters(value, decimals);
}

function formatNumberWithMinLimit(
  value: number,
  minvalue: number,
  decimals?: ?number,
): string {
  return value < minvalue
    ? getLessThanString(minvalue, decimals)
    : intlNumUtils.formatNumberWithThousandDelimiters(value, decimals);
}

formatNumber.withThousandDelimiters =
  intlNumUtils.formatNumberWithThousandDelimiters;
formatNumber.withMaxLimit = formatNumberWithMaxLimit;
formatNumber.withMinLimit = formatNumberWithMinLimit;

module.exports = formatNumber;
