/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @format
 * @oncall i18n_fbt_js
 */

jest.autoMockOff();

const TestData_IntlNumberType = require('../__data__/TestData_IntlNumberType');
const IntlNumberType = require('../IntlNumberType');
const assert = require('assert');

describe('Test Fbt Enum', () => {
  it('Should maintain consistency with server-side locale data', () => {
    for (const locale in TestData_IntlNumberType) {
      const expected = require('../' + TestData_IntlNumberType[locale]);
      const actual = IntlNumberType._getNumberModuleForLocale(locale);
      if (actual !== expected) {
        throw new assert.AssertionError({
          message:
            'Expected: `' +
            expected +
            '`. Actual: `' +
            actual +
            '` on locale: ' +
            locale,
          actual,
          expected,
        });
      }
    }
  });
});
