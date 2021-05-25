/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict-local
 * @emails oncall+i18n_fbt_js
 */
import type {IntlVariationsEnum} from 'IntlVariations';

import {NUMBER_ONE, NUMBER_OTHER} from 'IntlVariations';

const FbtNumberType = {
  getVariation: (jest.fn<$ReadOnlyArray<number>, IntlVariationsEnum>(
    (n: number) =>
      // English plural rules (AKA IntlCLDRNumberType05 in CLDR v34)
      n === 1 ? NUMBER_ONE : NUMBER_OTHER,
  ): JestMockFn<$ReadOnlyArray<number>, IntlVariationsEnum>),
};

export default FbtNumberType;
