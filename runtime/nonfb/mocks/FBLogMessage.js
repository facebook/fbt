/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 * @format
 * @noflow
 */

// No-op class implementation for Open Source
class FBLogMessage {
  constructor(_) {}
  mustfix() {}
  warn() {}
  info() {}
  debug() {}
  catching() {
    return this;
  }
  blameToPreviousFile() {
    return this;
  }
  blameToPreviousFrame() {
    return this;
  }
  blameToPreviousDirectory() {
    return this;
  }
  addToCategoryKey() {
    return this;
  }
  addMetadata() {
    return this;
  }
}

module.exports = FBLogMessage;
