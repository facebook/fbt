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
 * @flow
 * @typechecks
 * @format
 * @emails oncall+internationalization
 */

const IntlViewerContext = require('IntlViewerContext');
const NumberFormatConsts = require('NumberFormatConsts');
const NumberFormatConfig = NumberFormatConsts.get(IntlViewerContext.locale);

const escapeRegex = require('escapeRegex');

const DEFAULT_GROUPING_SIZE = 3;
import type {
  StandardDecimalPatternInfo,
  NumberingSystemData,
} from 'NumberFormatConfig';

const CURRENCIES_WITH_DOTS = [
  '\u0433\u0440\u043d.',
  '\u0434\u0435\u043d.',
  '\u043b\u0432.',
  '\u043c\u0430\u043d.',
  '\u0564\u0580.',
  '\u062c.\u0645.',
  '\u062f.\u0625.',
  '\u062f.\u0627.',
  '\u062f.\u0628.',
  '\u062f.\u062a.',
  '\u062f.\u062c.',
  '\u062f.\u0639.',
  '\u062f.\u0643.',
  '\u062f.\u0644.',
  '\u062f.\u0645.',
  '\u0631.\u0633.',
  '\u0631.\u0639.',
  '\u0631.\u0642.',
  '\u0631.\u064a.',
  '\u0644.\u0633.',
  '\u0644.\u0644.',
  '\u0783.',
  'B/.',
  'Bs.',
  'Fr.',
  'kr.',
  'L.',
  'p.',
  'S/.',
];

const _regexCache = {};
function _buildRegex(pattern: string): RegExp {
  if (!_regexCache[pattern]) {
    _regexCache[pattern] = new RegExp(pattern, 'i');
  }
  return _regexCache[pattern];
}

const matchCurrenciesWithDots = _buildRegex(
  CURRENCIES_WITH_DOTS.reduce((regex, representation, index) => {
    return regex + (index ? '|' : '') + '(' + escapeRegex(representation) + ')';
  }, ''),
);

/**
 * Format a number for string output.
 *
 * Calling this function directly is discouraged, unless you know
 * exactly what you're doing. Consider using `formatNumber` or
 * `formatNumberWithThousandDelimiters` below.
 */
function formatNumberRaw(
  value: any,
  decimals?: ?number,
  thousandDelimiter?: string,
  decimalDelimiter?: string,
  minDigitsForThousandDelimiter?: number,
  standardPatternInfo?: StandardDecimalPatternInfo,
  numberingSystemData?: ?NumberingSystemData,
): string {
  thousandDelimiter = thousandDelimiter || '';
  decimalDelimiter = decimalDelimiter || '.';
  minDigitsForThousandDelimiter = minDigitsForThousandDelimiter || 0;
  standardPatternInfo = standardPatternInfo || {
    primaryGroupSize: DEFAULT_GROUPING_SIZE,
    secondaryGroupSize: DEFAULT_GROUPING_SIZE,
  };
  const primaryGroupingSize =
    standardPatternInfo.primaryGroupSize || DEFAULT_GROUPING_SIZE;
  const secondaryGroupingSize =
    standardPatternInfo.secondaryGroupSize || primaryGroupingSize;

  const digits = numberingSystemData && numberingSystemData.digits;
  if (decimals === undefined || decimals === null) {
    value = value.toString();
  } else if (typeof value === 'string') {
    value = truncateLongNumber(value, decimals);
  } else {
    value = _roundNumber(value, decimals);
  }

  const valueParts = value.toString().split('.');
  let wholeNumber = valueParts[0];
  let decimal = valueParts[1];

  if (
    Math.abs(parseInt(wholeNumber, 10)).toString().length >=
    minDigitsForThousandDelimiter
  ) {
    let replaced = '';
    const replaceWith = '$1' + thousandDelimiter + '$2$3';
    const primaryPattern =
      '(\\d)(\\d{' + (primaryGroupingSize - 0) + '})($|\\D)';
    replaced = wholeNumber.replace(_buildRegex(primaryPattern), replaceWith);
    if (replaced != wholeNumber) {
      wholeNumber = replaced;
      const secondaryPatternString =
        '(\\d)(\\d{' +
        (secondaryGroupingSize - 0) +
        '})(' +
        escapeRegex(thousandDelimiter) +
        ')';
      const secondaryPattern = _buildRegex(secondaryPatternString);
      while (
        (replaced = wholeNumber.replace(secondaryPattern, replaceWith)) !=
        wholeNumber
      ) {
        wholeNumber = replaced;
      }
    }
  }
  if (digits) {
    wholeNumber = _replaceWithNativeDigits(wholeNumber, digits);
    decimal = decimal && _replaceWithNativeDigits(decimal, digits);
  }

  let result = wholeNumber;
  if (decimal) {
    result += decimalDelimiter + decimal;
  }

  return result;
}

function _replaceWithNativeDigits(number: string, digits: string): string {
  let result = '';
  for (let ii = 0; ii < number.length; ++ii) {
    const d = digits[number.charCodeAt(ii) - 48]; /* 48 === '0' */
    result += d !== undefined ? d : number[ii];
  }
  return result;
}

/**
 * Format a number for string output.
 *
 * This will format a given number according to the user's locale.
 * Thousand delimiters will NOT be added, use
 * `formatNumberWithThousandDelimiters` if you want them to be added.
 *
 * You may optionally specify the number of decimal places that should
 * be displayed. For instance, pass `0` to round to the nearest
 * integer, `2` to round to nearest cent when displaying currency, etc.
 */
function formatNumber(value: number, decimals?: ?number): string {
  return formatNumberRaw(
    value,
    decimals,
    '',
    NumberFormatConfig.decimalSeparator,
    NumberFormatConfig.minDigitsForThousandsSeparator,
    NumberFormatConfig.standardDecimalPatternInfo,
    NumberFormatConfig.numberingSystemData,
  );
}

/**
 * Format a number for string output.
 *
 * This will format a given number according to the user's locale.
 * Thousand delimiters will be added. Use `formatNumber` if you don't
 * want them to be added.
 *
 * You may optionally specify the number of decimal places that should
 * be displayed. For instance, pass `0` to round to the nearest
 * integer, `2` to round to nearest cent when displaying currency, etc.
 */
function formatNumberWithThousandDelimiters(
  value: number,
  decimals?: ?number,
): string {
  return formatNumberRaw(
    value,
    decimals,
    NumberFormatConfig.numberDelimiter,
    NumberFormatConfig.decimalSeparator,
    NumberFormatConfig.minDigitsForThousandsSeparator,
    NumberFormatConfig.standardDecimalPatternInfo,
    NumberFormatConfig.numberingSystemData,
  );
}

/**
 * Calculate how many powers of 10 there are in a given number
 * I.e. 1.23 has 0, 100 and 999 have 2, and 1000 has 3.
 * Used in the inflation and rounding calculations below.
 */
function _getNumberOfPowersOfTen(value: number): number {
  return value && Math.floor(Math.log10(Math.abs(value)));
}

/**
 * Format a number for string output.
 *
 * This will format a given number according to the specified significant
 * figures.
 *
 * Also, specify the number of decimal places that should
 * be displayed. For instance, pass `0` to round to the nearest
 * integer, `2` to round to nearest cent when displaying currency, etc.
 *
 * Example:
 * > formatNumberWithLimitedSigFig(123456789, 0, 2)
 * "120,000,000"
 * > formatNumberWithLimitedSigFig(1.23456789, 2, 2)
 * "1.20"
 */
function formatNumberWithLimitedSigFig(
  value: number,
  decimals: ?number,
  numSigFigs: number,
): string {
  // First make the number sufficiently integer-like.
  const power = _getNumberOfPowersOfTen(value);
  let inflatedValue = value;
  if (power < numSigFigs) {
    inflatedValue = value * Math.pow(10, -power + numSigFigs);
  }
  // Now that we have a large enough integer, round to cut off some digits.
  const roundTo = Math.pow(
    10,
    _getNumberOfPowersOfTen(inflatedValue) - numSigFigs + 1,
  );
  let truncatedValue = Math.round(inflatedValue / roundTo) * roundTo;
  // Bring it back to whatever the number's magnitude was before.
  if (power < numSigFigs) {
    truncatedValue /= Math.pow(10, -power + numSigFigs);
    // Determine number of decimals based on sig figs
    if (decimals == null) {
      return formatNumberWithThousandDelimiters(
        truncatedValue,
        numSigFigs - power - 1,
      );
    }
  }
  // Decimals
  return formatNumberWithThousandDelimiters(truncatedValue, decimals);
}

function _roundNumber(valueParam: number, decimalsParam?: number): string {
  const decimals = decimalsParam == null ? 0 : decimalsParam;
  const pow = Math.pow(10, decimals);
  let value = valueParam;
  value = Math.round(value * pow) / pow;
  value += '';
  if (!decimals) {
    return value;
  }

  // if value is small and
  // was converted to scientific notation, don't append anything
  // as we are already done
  if (value.indexOf('e-') !== -1) {
    return value;
  }

  const pos = value.indexOf('.');
  let zeros = 0;
  if (pos == -1) {
    value += '.';
    zeros = decimals;
  } else {
    zeros = decimals - (value.length - pos - 1);
  }
  for (let i = 0, l = zeros; i < l; i++) {
    value += '0';
  }
  return value;
}

const addZeros = (x, count) => {
  for (let i = 0; i < count; i++) {
    x += '0';
  }
  return x;
};

function truncateLongNumber(number: string, decimals?: number): string {
  const pos = number.indexOf('.');
  const dividend = pos === -1 ? number : number.slice(0, pos);
  const remainder = pos === -1 ? '' : number.slice(pos + 1);

  return decimals
    ? dividend +
        '.' +
        addZeros(remainder.slice(0, decimals), decimals - remainder.length)
    : dividend;
}

const _decimalSeparatorRegexCache = {};
const decimalSeparatorRegex = separator => {
  if (!_decimalSeparatorRegexCache[separator]) {
    _decimalSeparatorRegexCache[separator] = new RegExp(
      '([^\\/p]|^)' + escapeRegex(separator) + '(\\d*).*',
      'i',
    );
  }
  return _decimalSeparatorRegexCache[separator];
};

/**
 * Parse a number.
 *
 * If the number is preceded or followed by a currency symbol or other
 * letters, they will be ignored.
 *
 * A decimal delimiter should be passed to respect the user's locale.
 *
 * Calling this function directly is discouraged, unless you know
 * exactly what you're doing. Consider using `parseNumber` below.
 */
function parseNumberRaw(
  text: string,
  decimalDelimiter: string,
  numberDelimiter?: string,
): ?number {
  // Replace numerals based on current locale data
  const digitsMap = _getNativeDigitsMap();
  if (digitsMap) {
    text = text
      .split('')
      .map((/*string*/ character) => digitsMap[character] || character)
      .join('')
      .trim();
  }

  text = text.replace(/^[^\d]*\-/, '\u0002'); // preserve negative sign
  text = text.replace(matchCurrenciesWithDots, ''); // remove some currencies

  numberDelimiter = numberDelimiter || '';

  const decimalExp = escapeRegex(decimalDelimiter);
  const numberExp = escapeRegex(numberDelimiter);

  const isThereADecimalSeparatorInBetween = _buildRegex(
    '^[^\\d]*\\d.*' + decimalExp + '.*\\d[^\\d]*$',
  );
  if (!isThereADecimalSeparatorInBetween.test(text)) {
    const isValidWithDecimalBeforeHand = _buildRegex(
      '(^[^\\d]*)' + decimalExp + '(\\d*[^\\d]*$)',
    );
    if (isValidWithDecimalBeforeHand.test(text)) {
      text = text.replace(isValidWithDecimalBeforeHand, '$1\u0001$2');
      return _parseCodifiedNumber(text);
    }
    const isValidWithoutDecimal = _buildRegex(
      '^[^\\d]*[\\d ' + escapeRegex(numberExp) + ']*[^\\d]*$',
    );
    if (!isValidWithoutDecimal.test(text)) {
      text = '';
    }
    return _parseCodifiedNumber(text);
  }
  const isValid = _buildRegex(
    '(^[^\\d]*[\\d ' + numberExp + ']*)' + decimalExp + '(\\d*[^\\d]*$)',
  );
  text = isValid.test(text) ? text.replace(isValid, '$1\u0001$2') : '';
  return _parseCodifiedNumber(text);
}

/**
 * A codified number has \u0001 in the place of a decimal separator and a
 * \u0002 in the place of a negative sign.
 */
function _parseCodifiedNumber(text: string): ?number {
  text = text
    .replace(/[^0-9\u0001\u0002]/g, '') // remove everything but numbers,
    // decimal separator and negative sign
    .replace('\u0001', '.') // restore decimal separator
    .replace('\u0002', '-'); // restore negative sign
  const value = Number(text);
  return text === '' || isNaN(value) ? null : value;
}

function _getNativeDigitsMap(): ?{[string]: string} {
  const nativeDigitMap = {};
  const digits =
    NumberFormatConfig.numberingSystemData &&
    NumberFormatConfig.numberingSystemData.digits;
  if (!digits) {
    return null;
  }
  for (let i = 0; i < digits.length; i++) {
    nativeDigitMap[digits.charAt(i)] = i.toString();
  }

  return nativeDigitMap;
}

function parseNumber(text: string): ?number {
  return parseNumberRaw(
    text,
    NumberFormatConfig.decimalSeparator || '.',
    NumberFormatConfig.numberDelimiter,
  );
}

const intlNumUtils = {
  formatNumber: formatNumber,
  formatNumberRaw: formatNumberRaw,
  formatNumberWithThousandDelimiters: formatNumberWithThousandDelimiters,
  formatNumberWithLimitedSigFig: formatNumberWithLimitedSigFig,
  parseNumber: parseNumber,
  parseNumberRaw: parseNumberRaw,
  truncateLongNumber: truncateLongNumber,

  /**
   * Converts a float into a prettified string. e.g. 1000.5 => "1,000.5"
   *
   * @deprecated Use `intlNumber.formatNumberWithThousandDelimiters(num)`
   * instead. It automatically handles decimal and thousand delimiters and
   * gets edge cases for Norwegian and Spanish right.
   *
   */
  getFloatString(
    num: string | number,
    thousandDelimiter: string,
    decimalDelimiter: string,
  ): string {
    const str = String(num);
    const pieces = str.split('.');

    const intPart = intlNumUtils.getIntegerString(pieces[0], thousandDelimiter);
    if (pieces.length === 1) {
      return intPart;
    }

    return intPart + decimalDelimiter + pieces[1];
  },

  /**
   * Converts an integer into a prettified string. e.g. 1000 => "1,000"
   *
   * @deprecated Use `intlNumber.formatNumberWithThousandDelimiters(num, 0)`
   * instead. It automatically handles decimal thousand delimiters and gets
   * edge cases for Norwegian and Spanish right.
   *
   */
  getIntegerString(num: string | number, thousandDelimiter: string): string {
    if (thousandDelimiter === '') {
      if (__DEV__) {
        throw new Error('thousandDelimiter cannot be empty string!');
      }
      thousandDelimiter = ',';
    }

    let str = String(num);
    const regex = /(\d+)(\d{3})/;
    while (regex.test(str)) {
      str = str.replace(regex, '$1' + thousandDelimiter + '$2');
    }
    return str;
  },
};

module.exports = intlNumUtils;
