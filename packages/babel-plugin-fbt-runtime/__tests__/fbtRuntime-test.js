/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 */

jest.autoMockOff();

const {transformSync: babelTransform} = require('@babel/core');
const {
  withFbtRequireStatement,
} = require('babel-plugin-fbt/dist/__tests__/FbtTestUtil');
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
        fbt._('Foo', null, {hk: '3ktBJ2'});
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
                fbt._('simple', null, {hk: '2pjKFw'}),
              ),
            ),
          ],
          {hk: '2xRGl8'},
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
            {hk: "NT3sR"},
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
                a: "2gRMkN",
                b: "3NsO2f",
                c: "3eytjU"
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
                  x: "5Lquv",
                  y: "3RQlhz",
                  z: "3ZpRpY"
                },
                b: {
                  x: "djeja",
                  y: "1Cl3e7",
                  z: "31zfrM"
                },
                c: {
                  x: "2z0mci",
                  y: "2xJRMx",
                  z: "HAwfA"
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

describe('Test replacing clear token names with mangled tokens', () => {
  const data = {
    input: withFbtRequireStatement(
      `<fbt desc="d">
          <b>Your</b>
          friends
          <b>shared</b>
          <fbt:plural
            many="photos"
            showCount="ifMany"
            count={ex1.count}>
            a photo
          </fbt:plural>
        </fbt>;`,
    ),
    output: `var fbt_sv_arg_0;
      const fbt = require("fbt");
      fbt_sv_arg_0 = fbt._plural(ex1.count, "number"),
      fbt._(
        {
          "*": "{=m0} friends {=m2}{number} photos",
          "_1": "{=m0} friends {=m2} a photo",
        },
        [
          fbt_sv_arg_0,
          fbt._implicitParam(
            "=m0",
            /*#__PURE__*/React.createElement(
              "b",
              null,
              fbt._(
                {
                  "*": "Your",
                  "_1": "Your"
                },
                [fbt_sv_arg_0],
                {hk: "3AIVHA"},
              ),
            ),
          ),
          fbt._implicitParam(
            "=m2",
            /*#__PURE__*/React.createElement(
              "b",
              null,
              fbt._(
                {
                  "*": "shared",
                  "_1": "shared"
                },
                [fbt_sv_arg_0],
                {hk: "3CHy8o"},
              ),
            ),
          ),
        ],
        {hk: "2mDoBt"},
      );`,
  };
  runTest(data, true);
  runTest(data, false);
});
