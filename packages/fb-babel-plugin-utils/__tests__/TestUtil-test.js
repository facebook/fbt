/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @format
 * @oncall jsinfra
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
  describe('stripCodeBlockWhitespace:', () => {
    it('can safely strip whitespace', () => {
      expect(
        TestUtil.stripCodeBlockWhitespace(`
          const c          = 1;
          const d = 2;
            const e = 3;
        `),
      ).toBe(`
const c          = 1;
const d = 2;
  const e = 3;
        `);
    });
  });
});
