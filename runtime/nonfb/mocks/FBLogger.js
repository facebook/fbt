/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 * @format
 * @flow strict-local
 */

const FBLogMessage = require('FBLogMessage');

// No-op class implementation for Open Source
function FBLogger(project: string) {
  return new FBLogMessage(project);
}

module.exports = FBLogger;
