/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @format
 * @oncall i18n_fbt_js
 */

const {transform, withFbtRequireStatement} = require('./FbtTestUtil');
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
      input: withFbtRequireStatement(
        `<fbt desc="d">
            <link href="#">Your friends</link>
            liked your video
          </fbt>;`,
      ),
    },
  },
  {
    'should find the parents for a nested level': {
      input: withFbtRequireStatement(
        `<fbt desc="d">
            <Link href="#">
              Your friends
              <b>liked</b>
            </Link>
            your video
          </fbt>;`,
      ),
    },
  },
  {
    'should find the parents for a multi-nested level': {
      input: withFbtRequireStatement(
        `<fbt desc="phrase 0">
            <div>
              phrase 1<div>phrase 2</div>
            </div>
            <div>
              phrase 3<div>phrase 4</div>
            </div>
          </fbt>;`,
      ),
    },
  },
  {
    'should not count an explicit fbt:param as a child': {
      input: withFbtRequireStatement(
        `<fbt desc="phrase 0">
            <fbt:param name="should not be a child">
              <div href="#">
                <fbt desc="phrase 1">should not be a child</fbt>
              </div>
            </fbt:param>
            <fbt:param name="also should not be a child">
              <div href="#">
                <fbt desc="phrase 2">
                  also should not be a child
                  <div href="#">a child!</div>
                </fbt>
              </div>
            </fbt:param>
            <div href="#">another child!</div>
          </fbt>;`,
      ),
    },
  },
  {
    'should work with children with multiple fbt calls in one file': {
      input: withFbtRequireStatement(
        `<div>
            <fbt desc="phrase 0">
              <div href="#">phrase 1</div>
            </fbt>
            <fbt desc="phrase 2">
              <div href="#">phrase 3</div>
            </fbt>
          </div>;`,
      ),
    },
  },
];

const expectedRelationships = [
  {'1': 0},
  {'1': 0, '2': 1},
  {'1': 0, '2': 1, '3': 0, '4': 3},
  {'1': 0, '4': 3},
  {'1': 0, '3': 2},
];

describe('Test inner-outer strings in JS', () => {
  it('should collect correct parent child relationships', () => {
    for (var ii = 0; ii < testData.length; ++ii) {
      testChildToParentRelationships(testData[ii], expectedRelationships[ii]);
    }
  });
});
