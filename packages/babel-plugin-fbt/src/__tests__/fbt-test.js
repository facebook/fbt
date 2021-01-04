/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 */

jest.autoMockOff();

const {payload, transform, withFbtRequireStatement} = require('../FbtTestUtil');
const {TestUtil} = require('fb-babel-plugin-utils');

function runTest(data, extra) {
  TestUtil.assertSourceAstEqual(transform(data.input, extra), data.output);
}

describe('fbt() API: ', () => {
  describe('using extraOptions', () => {
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

  describe('using FBT subject', () => {
    it('should accept "subject" as a parameter', () => {
      runTest({
        input: withFbtRequireStatement(`fbt("Foo", "Bar", {subject: foo});`),
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

  describe('using FBT subject with string templates', () => {
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

describe('fbt variable binding detection', () => {
  function describeFbtBindingTestCase(requireStatement) {
    return {
      input: `${requireStatement};
        fbt("Foo", "Bar");`,
      output: `${requireStatement};
        fbt._(
          ${payload({
            type: 'text',
            jsfbt: 'Foo',
            desc: 'Bar',
          })}
        )`,
    };
  }

  it(`should handle commonJS require()`, () => {
    runTest(describeFbtBindingTestCase(`const fbt = require('fbt')`));
  });

  describe('using ES6', () => {
    it(`should handle fbt default export`, () => {
      runTest(describeFbtBindingTestCase(`import fbt from 'fbt'`));
    });
    it(`should handle the named fbt export`, () => {
      runTest(describeFbtBindingTestCase(`import {fbt} from 'fbt'`));
    });
  });
});
