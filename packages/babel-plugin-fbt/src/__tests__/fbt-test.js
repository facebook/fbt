/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @format
 * @oncall i18n_fbt_js
 */

jest.autoMockOff();

const {
  jsCodeFbtCallSerializer,
  snapshotTransform,
  withFbtRequireStatement,
} = require('./FbtTestUtil');

expect.addSnapshotSerializer(jsCodeFbtCallSerializer);

function runTest(data, extra) {
  const runSnapshotTransform = () => snapshotTransform(data.input, extra);
  if (typeof data.throws === 'string' || data.throws instanceof RegExp) {
    expect(runSnapshotTransform).toThrow(data.throws);
  } else {
    expect(runSnapshotTransform()).toMatchSnapshot();
  }
}

describe('fbt() API: ', () => {
  describe('using extraOptions', () => {
    it('functional fbt should accept "locale" extra option', () => {
      runTest(
        {
          input: withFbtRequireStatement(
            `fbt("Foo", "Bar", {locale: "ar_AR", private: "yes"});`,
          ),
        },
        {
          extraOptions: {locale: true, private: {yes: true}},
        },
      );
    });

    it('JSX fbt should accept extra options with limited value set', () => {
      runTest(
        {
          input: withFbtRequireStatement(
            `<fbt desc='d' locale='ar_AR'>
              This is an
              <b>inner string</b>
              and a
              <fbt:param name='token'>
                <fbt desc='d' private='yes'>
                  another string
                </fbt>
              </fbt:param>
            </fbt>;`,
          ),
        },
        {
          extraOptions: {locale: true, private: {yes: true}},
        },
      );
    });

    it('JSX fbt should pass top-level extra options to children inner strings', () => {
      runTest(
        {
          input: withFbtRequireStatement(
            `<fbt desc='d' myOption='yes'>
              This is
              <b>
                an inner string and
                <b>
                  another inner string
                </b>
              </b>
            </fbt>`,
          ),
        },
        {
          extraOptions: {myOption: true},
        },
      );
    });

    it('functional fbt should throw on non-native attributes that are not set in `extraOptions`', () => {
      runTest(
        {
          input: withFbtRequireStatement(
            `fbt("Foo", "Bar", {locale: "ar_AR"});`,
          ),
          throws: `Invalid option "locale". Only allowed: author, common, doNotExtract, preserveWhitespace, project, subject `,
        },
        {
          extraOptions: {},
        },
      );
    });

    it('JSX fbt should throw on non-native attributes that are not set in `extraOptions`', () => {
      runTest(
        {
          input: withFbtRequireStatement(
            `<fbt desc='d' locale='ar_AR' private='true'>
              This is a string
            </fbt>;`,
          ),
          throws: `Invalid option "locale". Only allowed: private, author, common, doNotExtract, preserveWhitespace, project, subject `,
        },
        {
          extraOptions: {private: true},
        },
      );
    });

    it('functional fbt should throw on invalid option value', () => {
      runTest(
        {
          input: withFbtRequireStatement(
            `fbt("Foo", "Bar", {private: "yes"});`,
          ),
          throws: `Option "private" has an invalid value: "yes". Only allowed: no`,
        },
        {
          extraOptions: {private: {no: true}},
        },
      );
    });

    it('JSX fbt should throw on invalid option value', () => {
      runTest(
        {
          input: withFbtRequireStatement(
            `<fbt desc='d' private='aRandomValue'>
              This is a string
            </fbt>;`,
          ),
          throws: `Option "private" has an invalid value: "aRandomValue". Only allowed: yes, no`,
        },
        {
          extraOptions: {private: {yes: true, no: true}},
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
