/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+internationalization
 * @typechecks
 */

'use strict';

jest.disableAutomock();
var FbtNumberConsistency = require('../__mocks__/FbtNumberConsistency');

describe('FbtNumber consistency', function() {
  FbtNumberConsistency.dataModuleNames.forEach(dataModuleName => {
    /* eslint-disable fb-www/require-args */
    var path = require.resolve('../__mocks__/' + dataModuleName);
    var dataModule = require(path);
    var jsModulePath = require.resolve('../' + dataModule.jsModule);
    var jsModule = require(jsModulePath);
    var phpNumberTypes = dataModule.numberTypes;
    it('should be consistent with PHP in ' + dataModuleName, function() {
      for (var ii = 0; ii < phpNumberTypes.length; ++ii) {
        var jsType = jsModule.getVariation(ii);
        // In JS, we still have a table access (although there is only
        // one entry)
        jsType = jsType === '*' ? null : jsType;
        expect(jsType).toBe(
          phpNumberTypes[ii],
          ii + ' failed in ' + dataModuleName,
        );
      }
    });
  });
});
