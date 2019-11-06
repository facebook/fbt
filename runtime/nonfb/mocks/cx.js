/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict
 */

/**
 * OSS mock implementation to work with our ported ("unmodulified")
 * CSS
 */
function cx(cssClassName: string): string {
  return cssClassName.replace('/', '_');
}
module.exports = cx;
