/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 */

jest.autoMockOff();

const {
  jsCodeFbtCallSerializer,
  snapshotTransform,
  withFbtRequireStatement,
} = require('./FbtTestUtil');

expect.addSnapshotSerializer(jsCodeFbtCallSerializer);

function runTest(data, extra) {
  expect(snapshotTransform(data.input, extra)).toMatchSnapshot();
}

describe('fbt() API: ', () => {
  describe('using extraOptions', () => {
    it('should accept "locale" extra option', () => {
      runTest(
        {
          input: withFbtRequireStatement(
            `fbt("Foo", "Bar", {locale: locale.data});`,
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
      });
    });
  });

  describe('using FBT subject with string templates', () => {
    it('should accept "subject" as a parameter', () => {
      runTest({
        input: withFbtRequireStatement('fbt(`Foo`, "Bar", {subject: foo});'),
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
    });
  });
});

describe('fbt variable binding detection', () => {
  function describeFbtBindingTestCase(requireStatement) {
    return {
      input: `${requireStatement};
        fbt("Foo", "Bar");`,
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
