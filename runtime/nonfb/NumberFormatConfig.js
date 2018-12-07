/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 * @flow strict-local
 */
declare class NumberFormatConfig {
  decimalSeparator: string,
  numberDelimiter: string,
  minDigitsForThousandsSeparator: number,
  standardDecimalPatternInfo: StandardDecimalPatternInfo,
  numberingSystemData: ?NumberingSystemData,
}

declare export default NumberFormatConfig;
