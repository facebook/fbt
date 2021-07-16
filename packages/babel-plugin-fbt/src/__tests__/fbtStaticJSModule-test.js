/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 */

jest.autoMockOff();

const {
  jsCodeFbtCallSerializer,
  payload,
  snapshotTransform,
  transform,
  withFbtRequireStatement,
} = require('../FbtTestUtil');
const {TestUtil} = require('fb-babel-plugin-utils');

function runTest(data, extra) {
  var expected = data.output;
  var actual = transform(data.input, extra);
  TestUtil.assertSourceAstEqual(expected, actual);
}

expect.addSnapshotSerializer(jsCodeFbtCallSerializer);

describe('fbt preserveWhitespace argument', () => {
  // TODO: T38897324 (#32) Fix space normalization.
  // Here we are intentionally testing for the wrong behavior. We will come
  // back and update the expected output after we fix space normalization.
  describe('should NOT preserve whitespaces that do not neighbor raw text', () => {
    const snapshotTestData = {
      'jsx elements and raw text': {
        input: withFbtRequireStatement(`
          var x =
            <fbt desc="d">
              <span>
                Where do
              </span>
              <b>spaces</b>
              <i>go?</i>
              Good
              <i>question</i>
              !
            </fbt>;
        `),
      },
      'jsx elements with string variation arguments': {
        input: withFbtRequireStatement(`
          var x =
            <fbt desc="d">
              <span>
                There should be
              </span>
              <b>
                <fbt:plural
                  many="spaces"
                  showCount="ifMany"
                  count={this.state.ex1Count}>
                  a space
                </fbt:plural>
              </b>
              !
            </fbt>;
        `),
      },
    };
    TestUtil.testSection(snapshotTestData, snapshotTransform, {
      matchSnapshot: true,
    });
  });

  it('should preserve whitespace in text when requested', () => {
    runTest({
      input: withFbtRequireStatement(
        'var x = fbt("two\\nlines", "one line", {preserveWhitespace:true});',
      ),
      output: withFbtRequireStatement(
        `var x = fbt._(${payload({
          jsfbt: {
            t: {
              desc: 'one line',
              text: 'two\nlines',
            },
            m: [],
          },
        })})`,
      ),
    });

    runTest({
      input: withFbtRequireStatement(
        'var x = fbt("two  spaces", "one space", {preserveWhitespace:true});',
      ),
      output: withFbtRequireStatement(
        `var x = fbt._(${payload({
          jsfbt: {
            t: {
              desc: 'one space',
              text: 'two  spaces',
            },
            m: [],
          },
        })})`,
      ),
    });
  });

  it('should preserve whitespace in desc when requested', () => {
    runTest({
      input: withFbtRequireStatement(
        `var x = fbt('one line', 'two\\nlines', {preserveWhitespace: true});`,
      ),

      output: withFbtRequireStatement(
        `var x = fbt._(
            ${payload({
              jsfbt: {
                t: {
                  desc: 'two\nlines',
                  text: 'one line',
                },
                m: [],
              },
            })},
          );`,
      ),
    });

    runTest({
      input: withFbtRequireStatement(
        `var x = fbt('one space', 'two  spaces', {preserveWhitespace: true});`,
      ),
      output: withFbtRequireStatement(
        `var x = fbt._(
            ${payload({
              jsfbt: {
                t: {
                  desc: 'two  spaces',
                  text: 'one space',
                },
                m: [],
              },
            })},
          );`,
      ),
    });
  });

  it('should coalesce whitespace in text when not requested', () => {
    runTest({
      input: withFbtRequireStatement(
        `var x = fbt('two  spaces', 'one space', {preserveWhitespace: false});`,
      ),
      output: withFbtRequireStatement(
        `var x = fbt._(
            ${payload({
              jsfbt: {
                t: {
                  desc: 'one space',
                  text: 'two spaces',
                },
                m: [],
              },
            })},
          );`,
      ),
    });

    runTest({
      input: withFbtRequireStatement(
        `var x = fbt('two\\nlines', 'one line', {preserveWhitespace: false});`,
      ),
      output: withFbtRequireStatement(
        `var x = fbt._(
            ${payload({
              jsfbt: {
                t: {
                  desc: 'one line',
                  text: 'two lines',
                },
                m: [],
              },
            })},
          );`,
      ),
    });
  });

  it('should coalesce whitespace in desc when not requested', () => {
    runTest({
      input: withFbtRequireStatement(
        `var x = fbt('one line', 'two\\nlines', {preserveWhitespace: false});`,
      ),
      output: withFbtRequireStatement(
        `var x = fbt._(
            ${payload({
              jsfbt: {
                t: {
                  desc: 'two lines',
                  text: 'one line',
                },
                m: [],
              },
            })},
          );`,
      ),
    });

    runTest({
      input: withFbtRequireStatement(
        `var x = fbt('one space', 'two spaces', {preserveWhitespace: false});`,
      ),
      output: withFbtRequireStatement(
        `var x = fbt._(
            ${payload({
              jsfbt: {
                t: {
                  desc: 'two spaces',
                  text: 'one space',
                },
                m: [],
              },
            })},
          );`,
      ),
    });
  });
});
