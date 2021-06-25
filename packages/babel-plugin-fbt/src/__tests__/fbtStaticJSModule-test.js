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

describe('fbt preserveWhitespace argument', () => {
  // TODO: T38897324 (#32) Fix space normalization.
  // Here we are intentionally testing for the wrong behavior. We will come
  // back and update the expected output after we fix space normalization.
  it('should not preserve whitespaces that do not neighbor raw text', () => {
    runTest({
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
      output: withFbtRequireStatement(`
        var x = fbt._(${payload({
          jsfbt: {
            t: {
              desc: 'd',
              text: '{=Where do}{=spaces}{=go?} Good {=question} !',
              tokenAliases: {
                '=Where do': '=m0',
                '=spaces': '=m1',
                '=go?': '=m2',
                '=question': '=m4',
              },
            },
            m: [],
          },
        })},
        [
          fbt._implicitParam(
            "=m0",
            /*#__PURE__*/React.createElement(
              'span',
              null,
              fbt._(
                ${payload({
                  jsfbt: {
                    t: {
                      desc:
                        'In the phrase: "{=Where do}{=spaces}{=go?} Good {=question} !"',
                      text: 'Where do',
                    },
                    m: [],
                  },
                })},
              ),
            ),
          ),
          fbt._implicitParam(
            "=m1",
            /*#__PURE__*/React.createElement(
              'b',
              null,
              fbt._(
                ${payload({
                  jsfbt: {
                    t: {
                      desc:
                        'In the phrase: "{=Where do}{=spaces}{=go?} Good {=question} !"',
                      text: 'spaces',
                    },
                    m: [],
                  },
                })},
              ),
            ),
          ),
          fbt._implicitParam(
            "=m2",
            /*#__PURE__*/React.createElement(
              'i',
              null,
              fbt._(
                ${payload({
                  jsfbt: {
                    t: {
                      desc:
                        'In the phrase: "{=Where do}{=spaces}{=go?} Good {=question} !"',
                      text: 'go?',
                    },
                    m: [],
                  },
                })},
              ),
            ),
          ),
          fbt._implicitParam(
            "=m4",
            /*#__PURE__*/React.createElement(
              'i',
              null,
              fbt._(
                ${payload({
                  jsfbt: {
                    t: {
                      desc:
                        'In the phrase: "{=Where do}{=spaces}{=go?} Good {=question} !"',
                      text: 'question',
                    },
                    m: [],
                  },
                })},
              ),
            ),
          ),
        ],
      )`),
    });

    runTest({
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
      output: `
        var fbt_sv_arg_0;
        const fbt = require('fbt');
        var x = (
          fbt_sv_arg_0 = fbt._plural(this.state.ex1Count, "number"),
          fbt._(${payload({
            jsfbt: {
              t: {
                '*': {
                  desc: 'd',
                  text: '{=There should be}{=[number] spaces} !',
                  tokenAliases: {
                    '=There should be': '=m0',
                    '=[number] spaces': '=m1',
                  },
                },
                _1: {
                  desc: 'd',
                  text: '{=There should be}{=a space} !',
                  tokenAliases: {
                    '=There should be': '=m0',
                    '=a space': '=m1',
                  },
                },
              },
              m: [
                {
                  token: 'number',
                  type: 2,
                  singular: true,
                },
              ],
            },
          })},
        [
          fbt_sv_arg_0,
          fbt._implicitParam(
            "=m0",
            /*#__PURE__*/React.createElement(
              'span',
              null,
              fbt._(
                ${payload({
                  jsfbt: {
                    t: {
                      '*': {
                        desc:
                          'In the phrase: "{=There should be}{=[number] spaces} !"',
                        text: 'There should be',
                      },
                      _1: {
                        desc: 'In the phrase: "{=There should be}{=a space} !"',
                        text: 'There should be',
                      },
                    },
                    m: [
                      {
                        token: 'number',
                        type: 2,
                        singular: true,
                      },
                    ],
                  },
                })},
                [fbt_sv_arg_0],
              ),
            ),
          ),
          fbt._implicitParam(
            "=m1",
            /*#__PURE__*/React.createElement(
              'b',
              null,
              fbt._(
                ${payload({
                  jsfbt: {
                    t: {
                      '*': {
                        desc:
                          'In the phrase: "{=There should be}{=[number] spaces} !"',
                        text: '{number} spaces',
                      },
                      _1: {
                        desc: 'In the phrase: "{=There should be}{=a space} !"',
                        text: 'a space',
                      },
                    },
                    m: [
                      {
                        token: 'number',
                        type: 2,
                        singular: true,
                      },
                    ],
                  },
                })},
                [fbt_sv_arg_0],
              ),
            ),
          ),
        ],
      ))`,
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
