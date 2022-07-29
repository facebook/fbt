/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

const {JSModuleName, ModuleNameRegExp} = require('../FbtConstants');

describe('FbtConstants', () => {
  it('JSModuleName enum values should have the same string length', () => {
    for (const k in JSModuleName) {
      expect(JSModuleName[k].length).toBe(JSModuleName.FBT.length);
    }
  });

  describe('ModuleNameRegExp', () => {
    it('should allow common fbt/fbs code patterns', () => {
      const scenarios = [
        `<fbt desc="..."`,
        `fbt(foo)`,
        `fbt.c(foo)`,

        `<fbs desc="..."`,
        `fbs(foo)`,
        `fbs.c(foo)`,
      ];

      for (const scenario of scenarios) {
        expect(scenario).toMatch(ModuleNameRegExp);
      }
    });

    it('should reject code patterns resembling fbt/fbs', () => {
      const scenarios = [
        `<FbTask desc="..."`,
        `fbsource(foo)`,
        `fbt.toString()`,
        `fbs.toString()`,
        `const a: Fbt = ...`,
        `const a: Fbs = ...`,
      ];

      for (const scenario of scenarios) {
        expect(scenario).not.toMatch(ModuleNameRegExp);
      }
    });
  });
});
