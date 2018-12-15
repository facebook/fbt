/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 * @flow strict-local
 */

export type StandardDecimalPatternInfo = {
  primaryGroupSize: number,
  secondaryGroupSize: number,
};

export type NumberingSystemData = {
  digits: string,
};

declare class NumberFormatConfig {
  decimalSeparator: string,
  numberDelimiter: string,
  minDigitsForThousandsSeparator: number,
  standardDecimalPatternInfo: StandardDecimalPatternInfo,
  numberingSystemData: ?NumberingSystemData,
}

declare export default NumberFormatConfig;
