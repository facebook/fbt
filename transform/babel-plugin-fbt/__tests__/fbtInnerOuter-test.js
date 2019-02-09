/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p babel_plugin_fbt --remote localhost:~/www
 *
 * @emails oncall+internationalization
 * @format
 */

const {transform} = require('../FbtTestUtil');
const {transformSync: babelTransform} = require('@babel/core');
const assert = require('assert');

function testChildToParentRelationships(testData, expected) {
  const fbt = require('../index');

  const body = Object.keys(testData).reduce((agg, k) => {
    // Strip docblocks
    if (testData[k].throws) {
      return agg;
    }
    const input = testData[k].input;
    return agg + input.replace(/\/\*\*(?:\/|[^*]|\*+[^*\/])*\*+\//, '');
  }, '');

  transform(body, {collectFbt: true});

  try {
    assert.equal(
      JSON.stringify(expected, null, ' '),
      JSON.stringify(fbt.getChildToParentRelationships(), null, ' '),
    );
    // eslint-disable-next-line fb-www/no-unused-catch-bindings
  } catch (e) {
    throw new Error(
      'Actual:\n' +
        JSON.stringify(fbt.getChildToParentRelationships(), null, ' ') +
        '\n' +
        'Expected:\n' +
        JSON.stringify(expected, null, ' ') +
        '\n',
    );
  }
}

const testData = [
  {
    'should find the parent for a simple level': {
      input:
        'const fbt = require("fbt");\n' +
        '<fbt desc="d">\n' +
        '<link href="#">\n' +
        'Your friends\n' +
        '</link>\n' +
        'liked your video\n' +
        '</fbt>;',
    },
  },
  {
    'should find the parents for a nested level': {
      input:
        'const fbt = require("fbt");\n' +
        '<fbt desc="d">\n' +
        '<Link href="#">\n' +
        'Your friends\n' +
        '<b>\n' +
        'liked\n' +
        '</b>\n' +
        '</Link>\n' +
        'your video\n' +
        '</fbt>;',
    },
  },
  {
    'should find the parents for a multi-nested level': {
      input:
        'const fbt = require("fbt");\n' +
        '<fbt desc="phrase 0">\n' +
        '<div>\n' +
        'phrase 1\n' +
        '<div>\n' +
        'phrase 2\n' +
        '</div>\n' +
        '</div>\n' +
        '<div>\n' +
        'phrase 3\n' +
        '<div>\n' +
        'phrase 4\n' +
        '</div>\n' +
        '</div>\n' +
        '</fbt>;',
    },
  },
  {
    'should not count an explicit fbt:param as a child': {
      input:
        'const fbt = require("fbt");\n' +
        '<fbt desc="phrase 0">\n' +
        '<fbt:param name="should not be a child">\n' +
        '<div href="#">\n' +
        '<fbt desc="phrase 1">\n' +
        'should not be a child\n' +
        '</fbt>\n' +
        '</div>\n' +
        '</fbt:param>\n' +
        '<fbt:param name="also should not be a child">\n' +
        '<div href="#">\n' +
        '<fbt desc="phrase 2">\n' +
        'also should not be a child\n' +
        '<div href="#">\n' +
        'a child!\n' +
        '</div>\n' +
        '</fbt>\n' +
        '</div>\n' +
        '</fbt:param>\n' +
        '<div href="#">\n' +
        'another child!\n' +
        '</div>\n' +
        '</fbt>;',
    },
  },
  {
    'should work with children with multiple fbt calls in one file': {
      input:
        'const fbt = require("fbt");\n' +
        '<div>\n' +
        '<fbt desc="phrase 0">\n' +
        '<div href="#">\n' +
        'phrase 1\n' +
        '</div>\n' +
        '</fbt>\n' +
        '<fbt desc="phrase 2">\n' +
        '<div href="#">\n' +
        'phrase 3\n' +
        '</div>\n' +
        '</fbt>\n' +
        '</div>;',
    },
  },
];

const expectedRelationships = [
  {'1': 0},
  {'1': 0, '2': 1},
  {'1': 0, '2': 1, '3': 0, '4': 3},
  {'3': 2, '4': 0},
  {'1': 0, '3': 2},
];

describe('Test inner-outer strings in JS', () => {
  it('should collect correct parent child relationships', () => {
    for (var ii = 0; ii < testData.length; ++ii) {
      testChildToParentRelationships(testData[ii], expectedRelationships[ii]);
    }
  });
});
