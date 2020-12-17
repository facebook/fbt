/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict-local
 * @emails oncall+internationalization
 */
import {NUMBER_ONE, NUMBER_OTHER} from 'IntlVariations';
const FbtNumberType = {
  getVariation: (jest.fn<$ReadOnlyArray<number>, number>((n: number) =>
    // English plural rules (AKA IntlCLDRNumberType05 in CLDR v34)
    n === 1 ? NUMBER_ONE : NUMBER_OTHER,
  ): JestMockFn<$ReadOnlyArray<number>, number>),
};

module.exports = FbtNumberType;
