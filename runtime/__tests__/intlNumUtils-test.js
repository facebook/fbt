/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails i18n-tests@fb.com
 * @flow strict-local
 * @format
 */

jest.disableAutomock();

describe('intlNumUtils:', () => {
  // Ensures intlNumUtils and this test have the same instance of
  // NumberFormatConfig and that our prepare* functions override as
  // expected
  jest.mock('NumberFormatConsts');
  const NumberFormatConsts = require('NumberFormatConsts');
  const NumberFormatConfig = NumberFormatConsts.get('');
  var u = require('intlNumUtils');

  function prepareForAmericanFormat() {
    NumberFormatConfig.decimalSeparator = '.';
    NumberFormatConfig.numberDelimiter = ',';
    NumberFormatConfig.minDigitsForThousandsSeparator = 4;
    NumberFormatConfig.standardDecimalPatternInfo = {
      primaryGroupSize: 3,
      secondaryGroupSize: 3,
    };
    NumberFormatConfig.numberingSystemData = null;
  }

  function prepareForBrazilianFormat() {
    NumberFormatConfig.decimalSeparator = ',';
    NumberFormatConfig.numberDelimiter = '.';
    NumberFormatConfig.minDigitsForThousandsSeparator = 4;
    NumberFormatConfig.standardDecimalPatternInfo = {
      primaryGroupSize: 3,
      secondaryGroupSize: 3,
    };
    NumberFormatConfig.numberingSystemData = null;
  }

  function prepareForHindiLatinFormat() {
    NumberFormatConfig.decimalSeparator = '.';
    NumberFormatConfig.numberDelimiter = ',';
    NumberFormatConfig.minDigitsForThousandsSeparator = 4;
    NumberFormatConfig.standardDecimalPatternInfo = {
      primaryGroupSize: 3,
      secondaryGroupSize: 2,
    };
    NumberFormatConfig.numberingSystemData = null;
  }

  function prepareForHindiDevanagariFormat() {
    prepareForHindiLatinFormat();
    NumberFormatConfig.numberingSystemData = {
      digits: '\u0966\u0967\u0968\u0969\u096A\u096B\u096C\u096D\u096E\u096F',
    };
  }

  function prepareForArabicFormat() {
    NumberFormatConfig.decimalSeparator = '\u066B';
    NumberFormatConfig.numberDelimiter = '\u066C';
    NumberFormatConfig.numberingSystemData = {
      digits: '\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669',
    };
  }

  function prepareForPersianFormat() {
    NumberFormatConfig.decimalSeparator = '\u066B';
    NumberFormatConfig.numberDelimiter = '\u066C';
    NumberFormatConfig.numberingSystemData = {
      digits: '\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9',
    };
  }

  describe('intNumUtils.formatNumberRaw', function() {
    it('Should work with integer input', function() {
      expect(u.formatNumberRaw(5)).toBe('5');
      expect(u.formatNumberRaw(5, 3)).toBe('5.000');
    });

    it('Should work with string input', function() {
      expect(u.formatNumberRaw('5')).toBe('5');
      expect(u.formatNumberRaw('5', 3)).toBe('5.000');
    });

    it('Should not round when no decimals are specified', function() {
      expect(u.formatNumberRaw(5.499)).toBe('5.499');
      expect(u.formatNumberRaw(5.5)).toBe('5.5');
      expect(u.formatNumberRaw(5.499, null)).toBe('5.499');
      expect(u.formatNumberRaw(5.5, null)).toBe('5.5');

      expect(u.formatNumberRaw('5.499')).toBe('5.499');
      expect(u.formatNumberRaw('5.5')).toBe('5.5');
      expect(u.formatNumberRaw('5.499', null)).toBe('5.499');
      expect(u.formatNumberRaw('5.5', null)).toBe('5.5');
    });

    it('Should round (not truncate) decimals for numbers', function() {
      expect(u.formatNumberRaw(1234.5655, 2)).toBe('1234.57');
      expect(u.formatNumberRaw(1234.5644, 2)).toBe('1234.56');
      expect(u.formatNumberRaw(-1234.5655, 2)).toBe('-1234.57');
      expect(u.formatNumberRaw(-1234.5644, 2)).toBe('-1234.56');
    });

    it('Should truncate (not round) decimals for strings', function() {
      expect(u.formatNumberRaw('1234.5655', 2)).toBe('1234.56');
      expect(u.formatNumberRaw('1234.5644', 2)).toBe('1234.56');
      expect(u.formatNumberRaw('-1234.5655', 2)).toBe('-1234.56');
      expect(u.formatNumberRaw('-1234.5644', 2)).toBe('-1234.56');
    });

    it('Should handle a higher precision than given', function() {
      expect(u.formatNumberRaw(1234.1, 5)).toBe('1234.10000');
      expect(u.formatNumberRaw('1234.1', 5)).toBe('1234.10000');
    });

    it('Should respect delimiters passed', function() {
      expect(u.formatNumberRaw(1234.54, 2, '.', ',')).toBe('1.234,54');
      expect(u.formatNumberRaw('1234.54', 2, '.', ',')).toBe('1.234,54');
    });

    it('Should handle large numbers', function() {
      expect(u.formatNumberRaw('1000000000000000', 2)).toBe(
        '1000000000000000.00',
      );
      expect(u.formatNumberRaw('1000000000000000.123', 2)).toBe(
        '1000000000000000.12',
      );
      expect(u.formatNumberRaw('-1000000000000000.123', 2)).toBe(
        '-1000000000000000.12',
      );
    });

    it('Should handle small numbers', function() {
      expect(u.formatNumberRaw(0.000000199, 9)).toBe('1.99e-7');
      expect(u.formatNumberRaw(0.000000199, 7)).toBe('2e-7');
      expect(u.formatNumberRaw(0.0000000199, 7)).toBe('0.0000000');
      expect(u.formatNumberRaw('0.000000199', 9)).toBe('0.000000199');
    });
  });

  describe('intNumUtils.formatNumber', function() {
    it('Should work with integer input', function() {
      expect(u.formatNumber(5)).toBe('5');
      expect(u.formatNumber(5, 3)).toBe('5.000');
    });

    it('Should not round when no decimals are specified', function() {
      expect(u.formatNumber(5.499)).toBe('5.499');
      expect(u.formatNumber(5.5)).toBe('5.5');
      expect(u.formatNumber(5.499, null)).toBe('5.499');
      expect(u.formatNumber(5.5, null)).toBe('5.5');
    });

    it('Should round (not truncate) decimals', function() {
      expect(u.formatNumber(1234.5655, 2)).toBe('1234.57');
      expect(u.formatNumber(1234.5644, 2)).toBe('1234.56');
      expect(u.formatNumber(-1234.5655, 2)).toBe('-1234.57');
      expect(u.formatNumber(-1234.5644, 2)).toBe('-1234.56');
    });

    it('Should handle a higher precision than given', function() {
      expect(u.formatNumber(1234.1, 5)).toBe('1234.10000');
    });

    it('Should respect user locale for number formatting', function() {
      NumberFormatConfig.decimalSeparator = '#';
      NumberFormatConfig.numberDelimiter = '/';
      NumberFormatConfig.minDigitsForThousandsSeparator = 6;

      // Below the thousand separator threshold. No thousand separator.
      expect(u.formatNumber(1234.1, 1)).toBe('1234#1');
      expect(u.formatNumber(12345.1, 1)).toBe('12345#1');
      // Above the thousand separator threshold.
      expect(u.formatNumber(123456.1, 1)).toBe('123456#1');

      // Clean up.
      jest.resetModules();
    });
  });

  describe('intNumUtils.formatNumberWithThousandDelimiters', function() {
    beforeEach(function() {
      prepareForAmericanFormat();
    });

    it('Should work with integer input', function() {
      expect(u.formatNumberWithThousandDelimiters(5)).toBe('5');
      expect(u.formatNumberWithThousandDelimiters(5, 3)).toBe('5.000');
    });

    it('Should not round when no decimals are specified', function() {
      expect(u.formatNumberWithThousandDelimiters(5.499)).toBe('5.499');
      expect(u.formatNumberWithThousandDelimiters(5.5)).toBe('5.5');
      expect(u.formatNumberWithThousandDelimiters(5.499, null)).toBe('5.499');
      expect(u.formatNumberWithThousandDelimiters(5.5, null)).toBe('5.5');
    });

    it('Should round (not truncate) decimals', function() {
      expect(u.formatNumberWithThousandDelimiters(1234.5655, 2)).toBe(
        '1,234.57',
      );
      expect(u.formatNumberWithThousandDelimiters(1234.5644, 2)).toBe(
        '1,234.56',
      );
      expect(u.formatNumberWithThousandDelimiters(-1234.5655, 2)).toBe(
        '-1,234.57',
      );
      expect(u.formatNumberWithThousandDelimiters(-1234.5644, 2)).toBe(
        '-1,234.56',
      );
    });

    it('Should handle a higher precision than given', function() {
      expect(u.formatNumberWithThousandDelimiters(1234.1, 5)).toBe(
        '1,234.10000',
      );
    });

    it('Should respect primary and secondary grouping sizes in Hindi', function() {
      prepareForHindiLatinFormat();
      expect(u.formatNumberWithThousandDelimiters(12)).toBe('12');
      expect(u.formatNumberWithThousandDelimiters(1234)).toBe('1,234');
      expect(u.formatNumberWithThousandDelimiters(12345)).toBe('12,345');
      expect(u.formatNumberWithThousandDelimiters(123456)).toBe('1,23,456');
      expect(u.formatNumberWithThousandDelimiters(1234567.1)).toBe(
        '12,34,567.1',
      );
      jest.resetModules();
    });

    it('Should render native digits when available', function() {
      prepareForHindiDevanagariFormat();
      expect(u.formatNumberWithThousandDelimiters(0)).toBe('\u0966');
      expect(u.formatNumberWithThousandDelimiters(1234)).toBe(
        '\u0967,\u0968\u0969\u096A',
      );
      expect(u.formatNumberWithThousandDelimiters(12345)).toBe(
        '\u0967\u0968,\u0969\u096A\u096B',
      );
      expect(u.formatNumberWithThousandDelimiters(123456)).toBe(
        '\u0967,\u0968\u0969,\u096A\u096B\u096C',
      );
      expect(u.formatNumberWithThousandDelimiters(1234567.1)).toBe(
        '\u0967\u0968,\u0969\u096A,\u096B\u096C\u096D.\u0967',
      );
      jest.resetModules();
    });

    it('Should respect user locale for number formatting', function() {
      NumberFormatConfig.decimalSeparator = '#';
      NumberFormatConfig.numberDelimiter = '/';
      NumberFormatConfig.minDigitsForThousandsSeparator = 6;

      // Below the thousand separator threshold. No thousand separator.
      expect(u.formatNumberWithThousandDelimiters(1234.1, 1)).toBe('1234#1');
      expect(u.formatNumberWithThousandDelimiters(12345.1, 1)).toBe('12345#1');
      // Above the thousand separator threshold.
      expect(u.formatNumberWithThousandDelimiters(123456.1, 1)).toBe(
        '123/456#1',
      );

      // Clean up.
      jest.resetModules();
    });
  });

  describe('intlNumUtils.formatNumberWithLimitedSigFig', function() {
    beforeEach(function() {
      prepareForAmericanFormat();
    });

    it('Should format number in significant figures and decimals', function() {
      expect(u.formatNumberWithLimitedSigFig(123456789, 0, 2)).toBe(
        '120,000,000',
      );
      expect(u.formatNumberWithLimitedSigFig(1.23456789, 2, 2)).toBe('1.20');
      expect(u.formatNumberWithLimitedSigFig(-12.345, 3, 3)).toBe('-12.300');
      expect(u.formatNumberWithLimitedSigFig(0, null, 3)).toBe('0.00');
    });
  });

  describe('intlNumUtils.parseNumberRaw', function() {
    beforeEach(function() {
      prepareForAmericanFormat();
    });

    it('Should return null for non-numeric input', function() {
      expect(u.parseNumber('')).toBe(null);
      expect(u.parseNumber('asdf')).toBe(null);
    });

    it('Should infer the decimal symbol (period)', function() {
      expect(u.parseNumber('0')).toBe(0);
      expect(u.parseNumber('100.00')).toBe(100);
      expect(u.parseNumber('$ 100.00')).toBe(100);
      expect(u.parseNumber('100,000.00')).toBe(100000);
      expect(u.parseNumber('$100,000.00')).toBe(100000);
      expect(u.parseNumber('1,00,0,00.00')).toBe(100000); // malformed but OK
      expect(u.parseNumber('-100,000.00')).toBe(-100000);
      expect(u.parseNumber('-$100,000.00')).toBe(-100000);
      expect(u.parseNumber('100.')).toBe(100); // No decimal digits
      expect(u.parseNumber('0.123')).toBe(0.123);
      expect(u.parseNumber('US 2.13')).toBe(2.13);
      expect(u.parseNumber('2.13 TL')).toBe(2.13);
      expect(u.parseNumber('123,456,789')).toBe(123456789); // 2+ ','s
      expect(u.parseNumber('123,456,789,123')).toBe(123456789123); // longer
      expect(u.parseNumber('123,456,789,')).toBe(123456789); // trailing ,
      expect(u.parseNumber('123,456.785')).toBe(123456.785); // decimal
      expect(u.parseNumber('-123,456,789')).toBe(-123456789);
    });

    it('Should respect the decimal symbol passed', function() {
      expect(u.parseNumberRaw('100,235', ',')).toBe(100.235);
      expect(u.parseNumberRaw('100,', ',')).toBe(100); // No decimal digits
      expect(u.parseNumberRaw('123.456.789', ',', '.')).toBe(123456789); // 2+ '.'s
      expect(u.parseNumberRaw('123.456.789.123', ',', '.')).toBe(123456789123); // long
      expect(u.parseNumberRaw('123.456.789.', ',', '.')).toBe(123456789); // trailing .
      expect(u.parseNumberRaw('-123.456.789', ',', '.')).toBe(-123456789); // negative
      expect(u.parseNumberRaw('123.456,785', ',', '.')).toBe(123456.785); // decimal
      expect(u.parseNumberRaw('300,02,000 132', ' ', ',')).toBe(30002000.132); // space
    });

    it('Should support Spanish thousand delimiters (spaces)', function() {
      expect(u.parseNumberRaw('123 456 789', '.')).toBe(123456789);
      expect(u.parseNumberRaw('123 456 789', ',')).toBe(123456789);
      expect(u.parseNumberRaw('1 234,56', ',')).toBe(1234.56);
    });
  });

  describe('intlNumUtils.parseNumber', function() {
    beforeEach(function() {
      prepareForAmericanFormat();
    });

    it('Should parse numbers with English delimiters', function() {
      expect(u.parseNumber('0')).toBe(0);
      expect(u.parseNumber('100.00')).toBe(100);
      expect(u.parseNumber('$ 100.00')).toBe(100);
      expect(u.parseNumber('100,000.00')).toBe(100000);
      expect(u.parseNumber('$100,000.00')).toBe(100000);
      expect(u.parseNumber('1,00,0,00.00')).toBe(100000); // malformed but OK
      expect(u.parseNumber('-100,000.00')).toBe(-100000);
      expect(u.parseNumber('-$100,000.00')).toBe(-100000);
      expect(u.parseNumber('100.')).toBe(100); // No decimal digits
      expect(u.parseNumber('0.123')).toBe(0.123);
      expect(u.parseNumber('US 2.13')).toBe(2.13);
      expect(u.parseNumber('2.13 TL')).toBe(2.13);
      expect(u.parseNumber('123,456,789')).toBe(123456789); // 2+ ','s
      expect(u.parseNumber('123,456,789,123')).toBe(123456789123); // longer
      expect(u.parseNumber('123,456,789,')).toBe(123456789); // trailing ,
      expect(u.parseNumber('123,456.785')).toBe(123456.785); // decimal
      expect(u.parseNumber('-123,456,789')).toBe(-123456789);
    });

    it('Should parse numbers with French/German/etc. delimiters', function() {
      prepareForBrazilianFormat();

      expect(u.parseNumber('100,00')).toBe(100);
      expect(u.parseNumber('$ 100,00')).toBe(100);
      expect(u.parseNumber('100.000,00')).toBe(100000);
      expect(u.parseNumber('$100.000,00')).toBe(100000);
      expect(u.parseNumber('1.00.0.00,00')).toBe(100000); // malformed but OK
      expect(u.parseNumber('-100.000,00')).toBe(-100000);
      expect(u.parseNumber('-$100.000,00')).toBe(-100000);
      expect(u.parseNumber('100,')).toBe(100); // No decimal digits
      expect(u.parseNumber('0,123')).toBe(0.123);
      expect(u.parseNumber('US 2,13')).toBe(2.13);
      expect(u.parseNumber('2,13 TL')).toBe(2.13);
      expect(u.parseNumber('123.456.789')).toBe(123456789); // 2+ '.'s
      expect(u.parseNumber('123.456.789.123')).toBe(123456789123); // longer
      expect(u.parseNumber('123.456.789.')).toBe(123456789); // trailing .
      expect(u.parseNumber('123.456,785')).toBe(123456.785); // decimal
      expect(u.parseNumber('-123.456.789')).toBe(-123456789);
    });

    it('Should parse numbers including Peruvian and Russian currency', function() {
      expect(u.parseNumber('S/. 450.00')).toBe(450);
      expect(u.parseNumber('S/..45')).toBe(0.45);
      expect(u.parseNumber('p. 450.00')).toBe(450);
      expect(u.parseNumber('p..45')).toBe(0.45);
      expect(u.parseNumber('450.00p.')).toBe(450);
      expect(u.parseNumber('45p.')).toBe(45);
      expect(u.parseNumber('.45p.')).toBe(0.45);

      prepareForBrazilianFormat();

      expect(u.parseNumber('S/.,45')).toBe(0.45);
    });

    it('Should parse numbers starting with currency separator', function() {
      expect(u.parseNumber('.75')).toBe(0.75);
      expect(u.parseNumber('.75942345')).toBe(0.75942345);

      prepareForBrazilianFormat();

      expect(u.parseNumber(',75')).toBe(0.75);
      expect(u.parseNumber(',75942345')).toBe(0.75942345);
    });

    it('Should parse numbers with Arabic keyboard input characters', function() {
      prepareForArabicFormat();
      // test cases that use \u066b as decimal separator
      expect(u.parseNumber('\u0660\u066b\u0661\u0662\u0663')).toBe(0.123);
      expect(
        u.parseNumber(
          '\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669\u0660',
        ),
      ).toBe(1234567890); // all digits
      expect(
        u.parseNumber(
          '\u0661\u0662\u0663\u066C\u0664\u0665\u0666\u066C' +
            '\u0667\u0668\u0669\u066C\u0661\u0662\u0663\u0660',
        ),
      ).toBe(1234567891230); // longer
      expect(
        u.parseNumber(
          '\u0661\u0662\u0663\u066C\u0664\u0665\u0666\u066C\u0667\u0668\u0669\u066C',
        ),
      ).toBe(123456789); // trailing .
      expect(
        u.parseNumber(
          '\u0661\u0662\u0663\u066C\u0664\u0665\u0666\u066b\u0667\u0668\u0669',
        ),
      ).toBe(123456.789); // decimal
      expect(
        u.parseNumber(
          '-\u0661\u0662\u0663\u066C\u0664\u0665\u0666\u066C\u0667\u0668\u0669',
        ),
      ).toBe(-123456789);

      expect(u.parseNumber('\u0660\u066b\u0661\u0662\u0663')).toBe(0.123);
      expect(
        u.parseNumber(
          '\u0661\u0662\u0663\u066c\u0664\u0665\u0666\u066b\u0667\u0668\u0669',
        ),
      ).toBe(123456.789); // decimal

      // Clean up.
      jest.resetModules();
    });

    it('Should parse numbers with Persian keyboard input characters', function() {
      prepareForPersianFormat();
      // Persian characters
      expect(u.parseNumber('\u06f0\u066B\u06f1\u06f2\u06f3')).toBe(0.123);
      expect(
        u.parseNumber(
          '\u06f1\u06f2\u06f3\u06f4\u06f5\u06f6\u06f7\u06f8\u06f9\u06f0',
        ),
      ).toBe(1234567890); // all digits
      expect(
        u.parseNumber(
          '\u06f1\u06f2\u06f3\u066C\u06f4\u06f5\u06f6\u066C\u06f7\u06f8\u06f9\u066C' +
            '\u06f1\u06f2\u06f3\u06f0',
        ),
      ).toBe(1234567891230); // longer
      expect(
        u.parseNumber(
          '\u06f1\u06f2\u06f3\u066C\u06f4\u06f5\u06f6\u066C\u06f7\u06f8\u06f9\u066C',
        ),
      ).toBe(123456789); // trailing .
      expect(
        u.parseNumber(
          '\u06f1\u06f2\u06f3\u066C\u06f4\u06f5\u06f6\u066B\u06f7\u06f8\u06f5',
        ),
      ).toBe(123456.785); // decimal
      expect(
        u.parseNumber(
          '-\u06f1\u06f2\u06f3\u066C\u06f4\u06f5\u06f6\u066C\u06f7\u06f8\u06f9',
        ),
      ).toBe(-123456789);

      // Clean up.
      jest.resetModules();
    });
  });

  describe('intlNumUtils.parseNumber with Parser', function() {
    beforeEach(function() {
      prepareForAmericanFormat();
    });

    it('Parser should handle symbols with dot nicely', function() {
      expect(u.parseNumber('S/. 450.00')).toBe(450);
      expect(u.parseNumber('S/..45')).toBe(0.45);
      expect(u.parseNumber('p. 450.00')).toBe(450);
      expect(u.parseNumber('fake.45')).toBe(0.45);
      expect(u.parseNumber('p..45')).toBe(0.45);
      expect(u.parseNumber('450.00p.')).toBe(450);
      expect(u.parseNumber('45p.')).toBe(45);
      expect(u.parseNumber('.45p.')).toBe(0.45);

      expect(u.parseNumber('.75')).toBe(0.75);
      expect(u.parseNumber('.75942345')).toBe(0.75942345);
    });

    it('Parser should ignore spaces as much as possible', function() {
      expect(u.parseNumberRaw('123 456 789', '.')).toBe(123456789);
      expect(u.parseNumberRaw('123 456 789', ',')).toBe(123456789);
      expect(u.parseNumberRaw('1 234,56', ',')).toBe(1234.56);
    });

    it('Should parse American format correctly with Parser', function() {
      expect(u.parseNumber('0')).toBe(0);
      expect(u.parseNumber('100.00')).toBe(100);
      expect(u.parseNumber('$ 100.00')).toBe(100);
      expect(u.parseNumber('100,000.00')).toBe(100000);
      expect(u.parseNumber('$100,000.00')).toBe(100000);
      expect(u.parseNumber('1,00,0,00.00')).toBe(100000); // malformed but OK
      expect(u.parseNumber('-100,000.00')).toBe(-100000);
      expect(u.parseNumber('-$100,000.00')).toBe(-100000);
      expect(u.parseNumber('100.')).toBe(100); // No decimal digits
      expect(u.parseNumber('0.123')).toBe(0.123);
      expect(u.parseNumber('US 2.13')).toBe(2.13);
      expect(u.parseNumber('2.13 TL')).toBe(2.13);
      expect(u.parseNumber('123,456,789')).toBe(123456789); // 2+ ','s
      expect(u.parseNumber('123,456,789,123')).toBe(123456789123); // longer
      expect(u.parseNumber('123,456,789,')).toBe(123456789); // trailing ,
      expect(u.parseNumber('123,456.785')).toBe(123456.785); // decimal
      expect(u.parseNumber('-123,456,789')).toBe(-123456789);
    });

    it('Parser should handle Brazilian format properly', function() {
      prepareForBrazilianFormat();

      expect(u.parseNumber('100,00')).toBe(100);
      expect(u.parseNumber('$ 100,00')).toBe(100);
      expect(u.parseNumber('100.000,00')).toBe(100000);
      expect(u.parseNumber('$100.000,00')).toBe(100000);
      expect(u.parseNumber('1.00.0.00,00')).toBe(100000); // malformed but OK
      expect(u.parseNumber('-100.000,00')).toBe(-100000);
      expect(u.parseNumber('-$100.000,00')).toBe(-100000);
      expect(u.parseNumber('100,')).toBe(100); // No decimal digits
      expect(u.parseNumber('0,123')).toBe(0.123);
      expect(u.parseNumber('US 2,13')).toBe(2.13);
      expect(u.parseNumber('2,13 TL')).toBe(2.13);
      expect(u.parseNumber('123.456.789')).toBe(123456789); // 2+ '.'s
      expect(u.parseNumber('123.456.789.123')).toBe(123456789123); // longer
      expect(u.parseNumber('123.456.789.')).toBe(123456789); // trailing .
      expect(u.parseNumber('123.456,785')).toBe(123456.785); // decimal
      expect(u.parseNumber('-123.456.789')).toBe(-123456789);
    });

    it('Parser should not handle pathological cases', function() {
      expect(u.parseNumber('-100-,0%*#$00.00')).toBe(null); // unforgiving
      expect(u.parseNumber('-$100-,0$!@#00.00')).toBe(null); // unforgiving
      expect(u.parseNumberRaw('1.45.345', '.')).toBe(null);
      expect(u.parseNumberRaw('1,45,345', ',')).toBe(null);
    });

    it('Parser should handle currencies with dots', function() {
      expect(u.parseNumber('kr.2000')).toBe(2000);
      expect(u.parseNumber('\u0631.\u0633.2000')).toBe(2000);
      expect(u.parseNumber('S/.2000')).toBe(2000);
      expect(u.parseNumber('S.2000')).toBe(0.2);
    });
  });

  describe('intNumUtils.getIntegerString', function() {
    it('Should throw in __DEV__ if thousandDelimiter is empty', function() {
      expect(() => u.getIntegerString(1000, '')).toThrowError(
        'thousandDelimiter cannot be empty string',
      );
    });

    it('Should leave numbers in the range [-999, 999] unchanged', function() {
      expect(u.getIntegerString(-999, ',')).toBe('-999');
      expect(u.getIntegerString(-100, ',')).toBe('-100');
      expect(u.getIntegerString(-1, ',')).toBe('-1');
      expect(u.getIntegerString(0, ',')).toBe('0');
      expect(u.getIntegerString(1, ',')).toBe('1');
      expect(u.getIntegerString(100, ',')).toBe('100');
      expect(u.getIntegerString(999, ',')).toBe('999');
    });

    it('Should format numbers in the range [-inf, -1000] and [1000, inf]', function() {
      expect(u.getIntegerString(-123456789, ',')).toBe('-123,456,789');
      expect(u.getIntegerString(-12345, ',')).toBe('-12,345');
      expect(u.getIntegerString(-1000, ',')).toBe('-1,000');
      expect(u.getIntegerString(1000, ',')).toBe('1,000');
      expect(u.getIntegerString(12345, ',')).toBe('12,345');
      expect(u.getIntegerString(123456789, ',')).toBe('123,456,789');
    });

    it('Should support a variety of thousandDelimiters', function() {
      expect(u.getIntegerString(1234, '.')).toBe('1.234');
      expect(u.getIntegerString(1234, '\u066C')).toBe('1\u066C234');
      expect(u.getIntegerString(1234, '::')).toBe('1::234');
    });
  });
});
