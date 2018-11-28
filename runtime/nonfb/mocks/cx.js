/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 * @format
 * @flow strict-local
 */

/**
 * OSS mock implementation to work with our ported ("unmodulified")
 * CSS
 */
function cx(clsname: string) {
  return clsname.replace('/', '_');
}
module.exports = cx;
