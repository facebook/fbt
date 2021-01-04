/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 */
/*global describe, it, expect*/

jest.autoMockOff();

const {transform, withFbsRequireStatement} = require('../FbtTestUtil');

describe('Test declarative (jsx) <fbs> syntax translation', () => {
  it('should convert a simple string', () => {
    expect(
      transform(
        withFbsRequireStatement(
          `const fbsElem = <fbs desc='str_description'>a simple string</fbs>;`,
        ),
      ),
    ).toMatchSnapshot();
  });
  it('should convert a string with a parameter', () => {
    expect(
      transform(
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
      transform(
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
      transform(
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
      transform(
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
      transform(
        withFbsRequireStatement(`
          const fbsElem = <fbs desc='str_description'>
            a simple string
            <fbt:param name="param name">{parameter}</fbt:param>
          </fbs>;
        `),
      ),
    ).toThrow(`Don't mix <fbt> and <fbs> JSX namespaces.`);
  });
});

describe('Test functional fbs() syntax translation', () => {
  it('should convert a simple string', () => {
    expect(
      transform(
        withFbsRequireStatement(
          `const fbsCall = fbs('a simple string', 'str_description');`,
        ),
      ),
    ).toMatchSnapshot();
  });
  it('should convert a string with a gender parameter', () => {
    expect(
      transform(
        withFbsRequireStatement(`
          const fbsCall = fbs(
            'a string with a ' + fbs.param('param name', parameter, {gender: 'male'}),
            'str_description'
          );
        `),
      ),
    ).toMatchSnapshot();
  });
  it('should convert a common string', () => {
    expect(
      transform(
        withFbsRequireStatement(`const fbsCommonCall = fbs.c('Post');`),
      ),
    ).toMatchSnapshot();
  });
  it('should reject an fbt parameter', () => {
    expect(() =>
      transform(
        withFbsRequireStatement(`
          const fbsCall = fbs(
            'a string with a ' + fbt.param('param name', parameter, {gender: 'male'}),
            'str_description'
          );
        `),
      ),
    ).toThrow(
      `fbs only accepts plain strings with params wrapped in fbs.param(...).`,
    );
  });

  it('should throw when using fbs() and the fbs variable is not bound', () => {
    expect(() =>
      transform(
        `const fbsCall = fbs(
          'basic',
          'str_description'
        );`,
      ),
    ).toThrow(`fbs is not bound. Did you forget to require('fbs')?`);
  });

  it('should throw when using <fbs> and the fbs variable is not bound', () => {
    expect(() =>
      transform(`const fbsCall = <fbs desc="str_description">basic</fbs>;`),
    ).toThrow(`fbs is not bound. Did you forget to require('fbs')?`);
  });
});
