/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 */

'use strict';

/*global expect, it, describe*/

const assert = require('assert');
const babel = require('@babel/core');
const babylon = require('babylon');
const generate = require('@babel/generator').default;

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
  return babylon.parse(code, {
    sourceType: 'module',
    plugins: [
      'flow',
      'jsx',
    ],
  });
}

function prettyPrint(input) {
  return generate(parse(input), {comments: true}, input).code.trim();
}

module.exports = {
  assertSourceAstEqual(expected, actual, options) {
    const expectedTree = stripMeta(parse(expected).program, options);
    const actualTree = stripMeta(parse(actual).program, options);
    try {
      assert.deepEqual(actualTree, expectedTree);
    } catch (e) {
      console.log('Expected:', prettyPrint(expected));
      console.log('Actual:  ', prettyPrint(actual));
      const err = new Error([
        'deepEqual node AST assert failed for the following code:',
        '  expected output:',
        prettyPrint(expected),
        '',
        '  actual output:',
        prettyPrint(actual),
        '',
      ].join('\n'));
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
          expect(() => transform(testInfo.input, testInfo.options)).toThrow(testInfo.throws);
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
    describe(
      name,
      () => this.testSection(
        testData,
        getDefaultTransformForPlugins(plugins),
        options,
      ),
    );
  },
};
