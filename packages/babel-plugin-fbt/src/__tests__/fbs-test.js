/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @format
 * @oncall i18n_fbt_js
 */
/*global describe, it, expect*/

jest.autoMockOff();

const TestFbtEnumManifest = require('TestFbtEnumManifest');

const {
  jsCodeFbtCallSerializer,
  snapshotTransform,
  withFbsRequireStatement,
} = require('./FbtTestUtil');

expect.addSnapshotSerializer(jsCodeFbtCallSerializer);

describe('Test declarative (jsx) <fbs> syntax translation', () => {
  it('should convert a simple string', () => {
    expect(
      snapshotTransform(
        withFbsRequireStatement(
          `const fbsElem = <fbs desc='str_description'>a simple string</fbs>;`,
        ),
      ),
    ).toMatchSnapshot();
  });
  it('should convert a string with a parameter', () => {
    expect(
      snapshotTransform(
        withFbsRequireStatement(`
          const fbsElem = <fbs desc='str_description'>
            a string with a
            <fbs:param name="param name">{parameter}</fbs:param>
          </fbs>;
        `),
      ),
    ).toMatchSnapshot();
  });
  it('should convert a common string', () => {
    expect(
      snapshotTransform(
        withFbsRequireStatement(`
          const fbsCommonElem = <fbs common={true}>Post</fbs>;
        `),
        {
          fbtCommon: {
            Post: 'Button to post a comment',
          },
        },
      ),
    ).toMatchSnapshot();
  });
  it('should reject an <fbs> child element', () => {
    expect(() =>
      snapshotTransform(
        withFbsRequireStatement(`
          const fbsElem = <fbs desc='str_description'>
            a simple string
            <fbs>nested</fbs>
          </fbs>;
        `),
      ),
    ).toThrow(`Don't put <fbs> directly within <fbs>.`);
  });
  it('should reject an <fbt> child element', () => {
    expect(() =>
      snapshotTransform(
        withFbsRequireStatement(`
          const fbsElem = <fbs desc='str_description'>
            a simple string
            <fbt>nested</fbt>
          </fbs>;
        `),
      ),
    ).toThrow(`Don't put <fbt> directly within <fbs>.`);
  });
  it('should reject an <fbt:param> child element', () => {
    expect(() =>
      snapshotTransform(
        withFbsRequireStatement(`
          const fbsElem = <fbs desc='str_description'>
            a simple string
            <fbt:param name="param name">{parameter}</fbt:param>
          </fbs>;
        `),
      ),
    ).toThrow(`Don't mix <fbt> and <fbs> JSX namespaces.`);
  });
  it('should handle <fbs:enum>', () => {
    expect(
      snapshotTransform(
        withFbsRequireStatement(`
          let aEnum = require('Test$FbtEnum');
          var x = (
            <fbs desc="enums!">
              Click to see
              <fbs:enum enum-range={aEnum} value={id} />
            </fbs>
          );
        `),
        {fbtEnumManifest: TestFbtEnumManifest},
      ),
    ).toMatchSnapshot();
  });
});

describe('Test functional fbs() syntax translation', () => {
  it('should convert a simple string', () => {
    expect(
      snapshotTransform(
        withFbsRequireStatement(
          `const fbsCall = fbs('a simple string', 'str_description');`,
        ),
      ),
    ).toMatchSnapshot();
  });
  it('should convert a string with a gender parameter', () => {
    expect(
      snapshotTransform(
        withFbsRequireStatement(`
          const IntlVariations = require('IntlVariations');
          const fbsCall = fbs(
            'a string with a ' + fbs.param('param name', parameter, {gender: IntlVariations.GENDER_MALE}),
            'str_description'
          );
        `),
      ),
    ).toMatchSnapshot();
  });
  it('should convert a common string', () => {
    expect(
      snapshotTransform(
        withFbsRequireStatement(`const fbsCommonCall = fbs.c('Post');`),
      ),
    ).toMatchSnapshot();
  });

  // TODO: T93968371 Refine error messages in FbtElementNode#createChildNode
  it('should reject an fbt parameter', () => {
    expect(() =>
      snapshotTransform(
        withFbsRequireStatement(`
          const fbsCall = fbs(
            'a string with a ' + fbt.param('param name', parameter, {gender: 'male'}),
            'str_description'
          );
        `),
      ),
    ).toThrow(`fbs: unsupported babel node: CallExpression`);
  });

  it('should throw when using fbs() and the fbs variable is not bound', () => {
    expect(() =>
      snapshotTransform(
        `const fbsCall = fbs(
          'basic',
          'str_description'
        );`,
      ),
    ).toThrow(`fbs is not bound. Did you forget to require('fbs')?`);
  });

  it('should throw when using <fbs> and the fbs variable is not bound', () => {
    expect(() =>
      snapshotTransform(
        `const fbsCall = <fbs desc="str_description">basic</fbs>;`,
      ),
    ).toThrow(`fbs is not bound. Did you forget to require('fbs')?`);
  });

  it('should handle fbs.enum', () => {
    expect(
      snapshotTransform(
        withFbsRequireStatement(`
          let aEnum = require('Test$FbtEnum');
          var x = fbs('Click to see ' + fbs.enum(id, aEnum), 'enums!');
        `),
        {fbtEnumManifest: TestFbtEnumManifest},
      ),
    ).toMatchSnapshot();
  });
});
