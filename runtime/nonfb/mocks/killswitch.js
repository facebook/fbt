/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 * @format
 * @flow strict-local
 */
// Dummy implementation for Open Source with "detailed" logging turned
// off
const TURNED_OFF = {
  JS_RELIABILITY_FBT_LOGGING: true,
};
function killswitch(feature: string) {
  return TURNED_OFF[feature];
}
module.exports = killswitch;
