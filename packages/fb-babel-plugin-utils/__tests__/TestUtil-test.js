/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+jsinfra
 * @format
 */

jest.autoMockOff();

test('TestUtil:', () => {
  let TestUtil;

  beforeEach(() => {
    TestUtil = require('../TestUtil');
  });

  describe('generateFormattedCodeFromAST:', () => {
    it('can generate formatted JS code from a Babel AST object', () => {
      expect(
        TestUtil.generateFormattedCodeFromAST(
          TestUtil.__parse__FOR_UNIT_TESTS(
            `function hello(){/* Comments should remain */alert('world!')}`,
          ),
        ),
      ).toMatchInlineSnapshot(`
        "function hello() {
          /* Comments should remain */
          alert('world!');
        }"
      `);
    });
  });
});
