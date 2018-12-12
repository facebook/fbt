/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict-local
 * @emails oncall+internationalization
 */

const IntlCLDRNumberType04 = jest.requireActual('IntlCLDRNumberType04');
const FbtNumberType = {
  getVariation: (jest.fn<$ReadOnlyArray<number>, number>((n: number) =>
    IntlCLDRNumberType04.getVariation(n),
  ): JestMockFn<$ReadOnlyArray<number>, number>),
};

module.exports = FbtNumberType;
