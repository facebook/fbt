/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict
 */

// Dummy implementation for Open Source with "detailed" logging turned off
const TURNED_OFF = {
  JS_RELIABILITY_FBT_LOGGING: true,
};

function killswitch(feature: $Keys<typeof TURNED_OFF>): boolean {
  return TURNED_OFF[feature];
}

module.exports = killswitch;
