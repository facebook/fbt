/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @flow strict-local
 * @format
 * @emails oncall+internationalization
 */

'use strict';

const FBLogger = require('FBLogger');
const FbtResultBase = require('FbtResultBase');

function logErrorUseStringMethod(methodName: string): void {
  // If the contents is array of length greater than one, then use the string
  // method will cause error
  FBLogger('fbt')
    .blameToPreviousDirectory()
    .mustfix(
      'Error using fbt string. Used method %s' +
        ' on Fbt string. Fbt string is designed to be immutable ' +
        'and should not be manipulated.',
      methodName,
    );
}

/**
 * The FbtResultBase "implemented" module for www.
 */
const FbtResultWWWWithStringishMethods: Class<FbtResultBase> = FbtResultBase.usingStringProxyMethod(
  (methodName: $Keys<IFbtStringish>) => {
    return function() {
      logErrorUseStringMethod(methodName);
      // $FlowFixMe Mock stringish methods
      return String.prototype[methodName].apply(this, arguments);
    };
  },
);

module.exports = FbtResultWWWWithStringishMethods;
