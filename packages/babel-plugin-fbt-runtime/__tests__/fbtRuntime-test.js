/**
 *
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 */

jest.autoMockOff();

const {transformSync: babelTransform} = require('@babel/core');
const {withFbtRequireStatement} = require('babel-plugin-fbt/dist/FbtTestUtil');
const {TestUtil} = require('fb-babel-plugin-utils');

function transform(source, pluginOptions) {
  return babelTransform(source, {
    ast: false,
    plugins: [
      require('@babel/plugin-syntax-jsx'),
      require('@babel/plugin-transform-react-jsx'),
      [require('babel-plugin-fbt'), pluginOptions],
      [require('../index'), pluginOptions],
    ],
    sourceType: 'module',
  }).code;
}

function runTest(data, isRN) {
  TestUtil.assertSourceAstEqual(
    data.output,
    transform(data.input, {reactNativeMode: isRN}),
  );
}

describe('Test hash key generation', () => {
  it('should generate hash key for simply string', () => {
    const data = {
      input: withFbtRequireStatement(`
        fbt('Foo', 'Bar');
      `),
      output: withFbtRequireStatement(`
        fbt._('Foo', null, {hk: '227BGA'});
      `),
    };
    runTest(data, true);
    runTest(data, false);
  });

  it('should generate hash key for nested fbts', () => {
    const data = {
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
        </fbt>;`,
      ),
      output: withFbtRequireStatement(
        `fbt._(
          '{two lines} test',
          [
            fbt._param(
              'two lines',
              React.createElement(
                'b',
                null,
                fbt._('simple', null, {hk: '4qbcU8'}),
              ),
            ),
          ],
          {hk: '1xZ4be'},
        );`,
      ),
    };
    runTest(data, true);
    runTest(data, false);
  });
});

describe('Test enum hash keys generation', () => {
  it('should generate single hash key for fbt with enum under regular mode', () => {
    runTest(
      {
        input: withFbtRequireStatement(
          `fbt('Foo ' + fbt.enum('a', {a: 'A', b: 'B', c: 'C'}), 'Bar');`,
        ),
        output: withFbtRequireStatement(
          `fbt._(
            {
              "a": "Foo A",
              "b": "Foo B",
              "c": "Foo C"
            },
            [
              fbt._enum('a', {
                "a": 'A',
                "b": 'B',
                "c": 'C'
              })
            ],
            {hk: "4fsyit"},
          );`,
        ),
      },
      false,
    );
  });

  it('should generate hash key for fbt with enum', () => {
    runTest(
      {
        input: withFbtRequireStatement(
          `fbt('Foo ' + fbt.enum('a', {a: 'A', b: 'B', c: 'C'}), 'Bar');`,
        ),
        output: withFbtRequireStatement(
          `fbt._(
            {
              "a": 'Foo A',
              "b": 'Foo B',
              "c": 'Foo C'
            },
            [
              fbt._enum('a', {
                "a": 'A',
                "b": 'B',
                "c": 'C'
              })
            ],
            {
              ehk: {
                a: "4uSStb",
                b: "WGbrk",
                c: "4cijxf"
              }
            },
          );`,
        ),
      },
      true,
    );
  });

  it('should generate hash key for fbt with multiple enums', () => {
    runTest(
      {
        input: withFbtRequireStatement(
          `fbt(
            fbt.enum('a', {a: 'A', b: 'B', c: 'C'}) +
              ' Foo ' +
              fbt.enum('x', {x: 'X', y: 'Y', z: 'Z'}),
            'Bar',
          );`,
        ),
        output: withFbtRequireStatement(
          `fbt._(
            {
              "a": {
                "x": "A Foo X",
                "y": "A Foo Y",
                "z": "A Foo Z"
              },
              "b": {
                "x": "B Foo X",
                "y": "B Foo Y",
                "z": "B Foo Z"
              },
              "c": {
                "x": "C Foo X",
                "y": "C Foo Y",
                "z": "C Foo Z"
              },
            },
            [
              fbt._enum('a', {
                "a": 'A',
                "b": 'B',
                "c": 'C'
              }),
              fbt._enum('x', {
                "x": 'X',
                "y": 'Y',
                "z": 'Z'
              }),
            ],
            {
              ehk: {
                a: {
                  x: "2iLukh",
                  y: "HiUYK",
                  z: "4y43qC"
                },
                b: {
                  x: "3iS7k",
                  y: "4v1slU",
                  z: "wSyUv"
                },
                c: {
                  x: "3UuIpO",
                  y: "4ieJt4",
                  z: "8SVh3"
                },
              },
            },
          );`,
        ),
      },
      true,
    );
  });
});
