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

jest.autoMockOff();

const {payload, transform, withFbtRequireStatement} = require('../FbtTestUtil');
const {TestUtil} = require('fb-babel-plugin-utils');

function runTest(data, extra) {
  var expected = data.output;
  var actual = transform(data.input, extra);
  TestUtil.assertSourceAstEqual(expected, actual);
}

describe('fbt preserveWhitespace argument', () => {
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
