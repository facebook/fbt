/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict
 */

'use strict';

type FBLoggerParam = ?(string | number | boolean);

// No-op class implementation for Open Source
class FBLogMessage {
  constructor(project: string) {}

  fatal(format: string, ...params: Array<FBLoggerParam>): void {}

  mustfix(format: string, ...params: Array<FBLoggerParam>): void {}

  warn(format: string, ...params: Array<FBLoggerParam>): void {}

  info(format: string, ...params: Array<FBLoggerParam>): void {}

  debug(format: string, ...params: Array<FBLoggerParam>): void {}

  catching(error: Error): this {
    return this;
  }

  blameToPreviousFile(): this {
    return this;
  }

  blameToPreviousFrame(): this {
    return this;
  }

  blameToPreviousDirectory(): this {
    return this;
  }
}

module.exports = FBLogMessage;
