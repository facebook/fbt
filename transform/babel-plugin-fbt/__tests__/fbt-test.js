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
 * @nolint
 * @emails oncall+internationalization
 * @format
 */

jest.autoMockOff();

const {TestUtil} = require('fb-babel-plugin-utils');
const {payload, transform, withFbtRequireStatement} = require('../FbtTestUtil');
const {transformSync: babelTransform} = require('@babel/core');

function runTest(data, extra) {
  TestUtil.assertSourceAstEqual(transform(data.input, extra), data.output);
}

describe('Test extraOptions', () => {
  it('should accept "locale" extra option', () => {
    runTest(
      {
        input: withFbtRequireStatement(
          `fbt("Foo", "Bar", {locale: locale.data});`,
        ),
        output: withFbtRequireStatement(
          `fbt._(
            ${payload({
              type: 'text',
              jsfbt: 'Foo',
              desc: 'Bar',
            })}
          )`,
        ),
      },
      {
        extraOptions: {locale: true},
      },
    );
  });
});

describe('Test FBT subject', () => {
  it('should accept "subject" as a parameter', () => {
    runTest({
      input: withFbtRequireStatement(`
        fbt("Foo", "Bar", {subject: foo});
      `),
      output: withFbtRequireStatement(
        `fbt._(
          ${payload({
            type: 'table',
            jsfbt: {
              t: {'*': 'Foo'},
              m: [{token: '__subject__', type: 1}],
            },
            desc: 'Bar',
            project: '',
          })},
          [
            fbt._subject(foo)
          ]
        )`,
      ),
    });
  });
});

describe('Test FBT subject with string templates', () => {
  it('should accept "subject" as a parameter', () => {
    runTest({
      input: withFbtRequireStatement('fbt(`Foo`, "Bar", {subject: foo});'),
      output: withFbtRequireStatement(
        `fbt._(
          ${payload({
            type: 'table',
            jsfbt: {
              t: {'*': 'Foo'},
              m: [{token: '__subject__', type: 1}],
            },
            desc: 'Bar',
            project: '',
          })},
          [
            fbt._subject(foo)
          ]
        )`,
      ),
    });
  });
});

describe('Test double-lined params', () => {
  it('should remove the new line for param names that are two lines', () => {
    runTest({
      input: withFbtRequireStatement(
        `<fbt desc="d">
          <fbt:param
            name="two
                  lines">
            <b>
              <fbt desc="test">simple</fbt>
            </b>
          </fbt:param>
          test
        </fbt>`,
      ),
      output: withFbtRequireStatement(
        `fbt._(
          ${payload({
            type: 'text',
            jsfbt: '{two lines} test',
            desc: 'd',
          })},
          [
            fbt._param(
              "two lines",
              React.createElement(
                "b",
                null,
                fbt._(
                  ${payload({
                    type: 'text',
                    jsfbt: 'simple',
                    desc: 'test',
                  })}
                )
              )
            )
          ]
        );`,
      ),
    });
  });
});
