/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+i18n_fbt_js
 * @flow strict-local
 * @format
 */

'use strict';

const {JSModuleName} = require('../FbtConstants');

describe('FbtConstants', () => {
  it('JSModuleName enum values should have the same string length', () => {
    for (const k in JSModuleName) {
      expect(JSModuleName[k].length).toBe(JSModuleName.FBT.length);
    }
  });
});
