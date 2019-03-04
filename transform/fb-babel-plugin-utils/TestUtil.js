/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

/*global expect, it, describe*/

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
  return babelParser.parse(code, {
    sourceType: 'module',
    plugins: ['flow', 'jsx'],
  });
}

function prettyPrint(input) {
  return generate(parse(input), {comments: true}, input).code.trim();
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

module.exports = {
  assertSourceAstEqual(expected, actual, options) {
    const expectedTree = stripMeta(parse(expected).program, options);
    const actualTree = stripMeta(parse(actual).program, options);
    try {
      assert.deepEqual(actualTree, expectedTree);
    } catch (e) {
      const expectedFormattedCode = prettyPrint(expected);
      const actualFormattedCode = prettyPrint(actual);
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

      console.log(`Expected: ${expectedFormattedCode}`);
      console.log(`Actual  : ${actualFormattedCode}`);
      console.log(`First common string: ${commonStr}`);
      console.log(`The first difference is (${excerptLength} chars max): `);
      console.log(`Expected: ${excerptDiffFromExpected}`);
      console.log(`Actual  : ${excerptDiffFromActual}`);

      const err = new Error(
        [
          'deepEqual node AST assert failed for the following code:',
          '  Expected output:',
          expectedFormattedCode,
          '',
          '  Actual output:',
          actualFormattedCode,
          '',
          '  First common string:',
          commonStr,
          '',
          `  The first difference is (${excerptLength} chars max): `,
          `  Expected: ${excerptDiffFromExpected}`,
          `  Actual  : ${excerptDiffFromActual}`,
          '',
        ].join('\n'),
      );
      err.stack = e.stack;
      throw err;
    }
  },

  testSection(testData, transform, options) {
    Object.keys(testData).forEach(test => {
      const testInfo = testData[test];
      it(test, () => {
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
            this.assertSourceAstEqual(
              testInfo.output,
              transform(testInfo.input, testInfo.options),
              options,
            );
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
};
