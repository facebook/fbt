/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 */

jest.autoMockOff();

const {payload, transform, withFbtRequireStatement} = require('../FbtTestUtil');
const {TestUtil} = require('fb-babel-plugin-utils');

function runTest(data, extra) {
  var expected = data.output;
  var actual = transform(data.input, extra);
  TestUtil.assertSourceAstEqual(expected, actual);
}

// TODO(T40113359) Re-enable once this test scenario is ready to be tested
xdescribe('fbt preserveWhitespace argument', () => {
  // TODO: t17559607 Fix space normalization
  // it('should preserve whitespace in text when requested', () => {
  //   runTest({
  //     input:
  //       'var x =' +
  //       '  fbt("two\\nlines", "one line", {preserveWhitespace:true});',
  //     output:
  //       'var x = fbt._(' + payload({
  //         "type": "text",
  //         "jsfbt": "two\nlines",
  //         "desc": "one line",
  //       }) + ')'
  //   });
  //
  //   runTest({
  //     input:
  //       'var x =' +
  //       '  fbt("two  spaces", "one space", {preserveWhitespace:true});',
  //     output:
  //       'var x = fbt._(' + payload({
  //         "type": "text",
  //         "jsfbt": "two  spaces",
  //         "desc": "one space",
  //       }) + ')'
  //   });
  // });

  it('should preserve whitespace in desc when requested', () => {
    runTest({
      input: withFbtRequireStatement(
        `var x = fbt('one line', 'two\\nlines', {preserveWhitespace: true});`,
      ),

      output: withFbtRequireStatement(
        `var x = fbt._(
            ${payload({
              type: 'text',
              jsfbt: 'one line',
              desc: 'two\nlines',
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
              type: 'text',
              jsfbt: 'one space',
              desc: 'two  spaces',
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
              type: 'text',
              jsfbt: 'two spaces',
              desc: 'one space',
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
              type: 'text',
              jsfbt: 'two lines',
              desc: 'one line',
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
              type: 'text',
              jsfbt: 'one line',
              desc: 'two lines',
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
              type: 'text',
              jsfbt: 'one space',
              desc: 'two spaces',
            })},
          );`,
      ),
    });
  });
});
