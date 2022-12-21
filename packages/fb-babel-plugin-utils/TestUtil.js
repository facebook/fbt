/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noflow
 * @oncall i18n_fbt_js
 */
/*eslint max-len: ["error", 100]*/

'use strict';

/*global expect, it, describe*/

/*::
type TestEntry = {
  // Test case filter:
  // If `focus` is set, only run tests where `filter='focus'`
  // If `skip` is set, this test entry won't be executed
  filter?: 'focus' | 'skip',
  input: string, // Input JS code to test
  options?: {...}, // Babel transform options
  output: string, // expected output code
  // Set to `true` if an error is expected.
  // You can also set an expected error string.
  throws?: string | boolean,
};
type TestData = {[testTitle: string]: TestEntry};
*/

const babel = require('@babel/core');
const generate = require('@babel/generator').default;
const babelParser = require('@babel/parser');
const assert = require('assert');

const IGNORE_KEYS = [
  '__clone',
  'start',
  'end',
  'raw',
  'rawValue',
  'loc',
  'tokens',
  'parenthesized',
  'parenStart',
];

function stripMeta(node, options) {
  let ignoreKeys;
  if (options && options.comments) {
    // keep comments
    ignoreKeys = [...IGNORE_KEYS];
  } else {
    ignoreKeys = [...IGNORE_KEYS, 'leadingComments', 'trailingComments'];
  }
  ignoreKeys.forEach(key => delete node[key]);
  for (const p in node) {
    if (node[p] && typeof node[p] === 'object') {
      stripMeta(node[p], options);
    }
  }
  return node;
}

function getDefaultTransformForPlugins(plugins) {
  return function transform(source) {
    return babel.transformSync(source, {
      plugins,
    }).code;
  };
}

function parse(code) {
  if ((typeof code !== 'string' && typeof code !== 'object') || code == null) {
    // eslint-disable-next-line fb-www/no-new-error
    throw new Error(
      `Code must be a string or AST object but got: ${typeof code}`,
    );
  }
  return babelParser.parse(code, {
    sourceType: 'module',
    plugins: ['flow', 'jsx', 'nullishCoalescingOperator'],
  });
}

/**
 * Generate formatted JS source code from a given Babel AST object.
 * Note: JS comments are preserved.
 * See `__tests__/TestUtil-test.js` for example.
 *
 * @param {BabelNode} babelNode BabelNode object obtained after parsing JS code
 * or from a Babel Transform.
 * @return {string} JS source code
 */
function generateFormattedCodeFromAST(babelNode) {
  return generate(babelNode, {comments: true}, '').code.trim();
}

function formatSourceCode(input) {
  return generateFormattedCodeFromAST(parse(input));
}

function firstCommonSubstring(left, right) {
  let i = 0;
  for (i = 0; i < left.length && i < right.length; i++) {
    if (left.charAt(i) !== right.charAt(i)) {
      break;
    }
  }
  return left.substr(0, i);
}

// New versions of Babel detect and store the trailing comma of function arguments
// in the Babel node structure. But many of our unit tests assume that
// the function trailing comma is not important.
// So let's remove these to facilitate AST comparisons
// We'll also need to use the same type of quotes for strings.
function normalizeSourceCode(sourceCode /*: string */) /*: string */ {
  const ast = parse(sourceCode);
  // Note: @babel/generator does not generate trailing commas by default
  return generate(
    ast,
    {
      comments: true,
      quotes: 'single',
    },
    sourceCode,
  ).code.trim();
}

/**
 * Given a test config's "filter" status, decides whether we should run it with
 * jest's it/fit/xit function.
 */
function getJestUnitTestFunction(
  testEntry /*: TestEntry */,
) /*: (title: string, callback: () => void) => void */ {
  switch (testEntry.filter) {
    case 'focus':
      return it.only;
    case 'skip':
      return it.skip;
    default:
      return it;
  }
}

module.exports = {
  generateFormattedCodeFromAST,

  /**
   * This function allows you to use mutliline template strings in your test
   * cases without worrying about non standard loc's. It does this by stripping
   * leading whitespace so the contents lines up based on the first lines
   * offset.
   */
  stripCodeBlockWhitespace(code) {
    // Find standard whitespace offset for block
    const match = code.match(/(\n\s*)\S/);
    const strippedCode =
      match == null
        ? code
        : // Strip from each line
          code.replace(new RegExp(match[1], 'g'), '\n');

    return strippedCode;
  },

  assertSourceAstEqual(expected, actual, options) {
    const expectedTree = stripMeta(
      parse(normalizeSourceCode(expected)).program,
      options,
    );
    const actualTree = stripMeta(
      parse(normalizeSourceCode(actual)).program,
      options,
    );
    try {
      assert.deepStrictEqual(actualTree, expectedTree);
    } catch (e) {
      const jsonDiff = require('json-diff');
      const expectedFormattedCode = formatSourceCode(expected);
      const actualFormattedCode = formatSourceCode(actual);
      const commonStr = firstCommonSubstring(
        expectedFormattedCode,
        actualFormattedCode,
      );
      const excerptLength = 60;
      const excerptDiffFromExpected = expectedFormattedCode.substr(
        commonStr.length,
        excerptLength,
      );
      const excerptDiffFromActual = actualFormattedCode.substr(
        commonStr.length,
        excerptLength,
      );

      const errMessage = `deepEqual node AST assert failed for the following code:

Expected output: <<<${expectedFormattedCode}>>>

Actual output: <<<${actualFormattedCode}>>>

First common string: <<<${commonStr}>>>

The first difference is (${excerptLength} chars max):

Expected : <<<${excerptDiffFromExpected}>>>

Actual   : <<<${excerptDiffFromActual}>>>

AST diff:
====
${jsonDiff.diffString(expectedTree, actualTree)}
====
`;
      console.error(errMessage);

      const err = new Error(errMessage);
      err.stack = e.stack;
      throw err;
    }
  },

  // Alias of `getJestUnitTestFunction`
  $it: getJestUnitTestFunction,

  testSection(
    testData /*: TestData */,
    transform /*: Function */, // Babel transform function
    options /*: {
      comments?: boolean, // if true, strip comments from Babel transform output
    } */,
  ) /*: void */ {
    Object.entries(testData).forEach(([title, testInfo]) => {
      getJestUnitTestFunction(testInfo)(title, () => {
        if (testInfo.throws === true) {
          expect(() => transform(testInfo.input, testInfo.options)).toThrow();
        } else if (typeof testInfo.throws === 'string') {
          expect(() => transform(testInfo.input, testInfo.options)).toThrow(
            testInfo.throws,
          );
        } else if (testInfo.throws === false) {
          transform(testInfo.input, testInfo.options);
        } else {
          expect(() => {
            const transformOutput = transform(testInfo.input, testInfo.options);
            if (options && options.matchSnapshot) {
              expect(transformOutput).toMatchSnapshot();
            } else {
              this.assertSourceAstEqual(
                testInfo.output,
                transformOutput,
                options,
              );
            }
          }).not.toThrow();
        }
      });
    });
  },

  testCase(name, plugins, testData, options) {
    describe(name, () =>
      this.testSection(
        testData,
        getDefaultTransformForPlugins(plugins),
        options,
      ),
    );
  },

  __parse__FOR_UNIT_TESTS: parse,
};
