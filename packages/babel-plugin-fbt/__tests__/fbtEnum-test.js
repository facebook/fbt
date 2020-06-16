/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 */

jest.autoMockOff();

const TestFbtEnumManifest = require('TestFbtEnumManifest');

const {payload, transform, withFbtRequireStatement} = require('../FbtTestUtil');
const {TestUtil} = require('fb-babel-plugin-utils');

function runTest(data) {
  TestUtil.assertSourceAstEqual(
    transform(data.input, {fbtEnumManifest: TestFbtEnumManifest}),
    data.output,
  );
}

describe('Test Fbt Enum', () => {
  beforeEach(() => {
    // Ensure the Enum registrar config is reset.
    jest.resetModules();
  });

  it('should handle jsx enums (with references)', () => {
    runTest({
      input: withFbtRequireStatement(
        `let aEnum = require('Test$FbtEnum');
          var x = (
            <fbt desc="enums!">
              Click to see
              <fbt:enum enum-range={aEnum} value={id} />
            </fbt>
          );`,
      ),

      output: withFbtRequireStatement(
        `let aEnum = require('Test$FbtEnum');
          var x = fbt._(
            ${payload({
              type: 'table',
              jsfbt: {
                t: {
                  id1: 'Click to see groups',
                  id2: 'Click to see photos',
                  id3: 'Click to see videos',
                },
                m: [null],
              },
              desc: 'enums!',
            })},
            [fbt._enum(id, aEnum)],
          );`,
      ),
    });
  });

  it('should handle jsx string literals', () => {
    runTest({
      input: withFbtRequireStatement(
        `let aEnum = require('Test$FbtEnum');
          var x = (
            <fbt desc="enums!">
              Click to see
              <fbt:enum enum-range={aEnum} value="id1" />
            </fbt>
          );`,
      ),

      output: withFbtRequireStatement(
        `let aEnum = require('Test$FbtEnum');
          var x = fbt._(
            ${payload({
              type: 'table',
              jsfbt: {
                t: {
                  id1: 'Click to see groups',
                  id2: 'Click to see photos',
                  id3: 'Click to see videos',
                },
                m: [null],
              },
              desc: 'enums!',
            })},
            [fbt._enum("id1", aEnum)],
          );`,
      ),
    });
  });

  it('should handle functional enums (with references) (require)', () => {
    runTest({
      input: withFbtRequireStatement(
        `let aEnum = require('Test$FbtEnum');
          var x = fbt('Click to see ' + fbt.enum(id, aEnum), 'enums!');`,
      ),

      output: withFbtRequireStatement(
        `let aEnum = require('Test$FbtEnum');
          var x = fbt._(
            ${payload({
              type: 'table',
              jsfbt: {
                t: {
                  id1: 'Click to see groups',
                  id2: 'Click to see photos',
                  id3: 'Click to see videos',
                },
                m: [null],
              },
              desc: 'enums!',
            })},
            [fbt._enum(id, aEnum)],
          );`,
      ),
    });
  });

  it('should handle functional enums (with references) (import default)', () => {
    runTest({
      input: `
        import fbt from 'fbt';
        import aEnum from 'Test$FbtEnum';
        var x = fbt('Click to see ' + fbt.enum(id, aEnum), 'enums!');
      `,

      output: `
        import fbt from 'fbt';
        import aEnum from 'Test$FbtEnum';
        var x = fbt._(
          ${payload({
            type: 'table',
            jsfbt: {
              t: {
                id1: 'Click to see groups',
                id2: 'Click to see photos',
                id3: 'Click to see videos',
              },
              m: [null],
            },
            desc: 'enums!',
          })},
          [fbt._enum(id, aEnum)],
        );
    `,
    });
  });

  it('should handle functional enums (with references) (import star)', () => {
    runTest({
      input: `
        import fbt from 'fbt';
        import * as aEnum from 'Test$FbtEnum';
        var x = fbt('Click to see ' + fbt.enum(id, aEnum), 'enums!');
      `,

      output: `
        import fbt from 'fbt';
        import * as aEnum from 'Test$FbtEnum';
        var x = fbt._(
          ${payload({
            type: 'table',
            jsfbt: {
              t: {
                id1: 'Click to see groups',
                id2: 'Click to see photos',
                id3: 'Click to see videos',
              },
              m: [null],
            },
            desc: 'enums!',
          })},
          [fbt._enum(id, aEnum)],
        );
    `,
    });
  });

  it('should handle functional enums (with references) in templates', () => {
    runTest({
      input: withFbtRequireStatement(
        `let aEnum = require('Test$FbtEnum');
          var x = fbt(\`Click to see \${fbt.enum(id, aEnum)}\`, 'enums!');`,
      ),

      output: withFbtRequireStatement(
        `let aEnum = require('Test$FbtEnum');
          var x = fbt._(
            ${payload({
              type: 'table',
              jsfbt: {
                t: {
                  id1: 'Click to see groups',
                  id2: 'Click to see photos',
                  id3: 'Click to see videos',
                },
                m: [null],
              },
              desc: 'enums!',
            })},
            [fbt._enum(id, aEnum)],
          );`,
      ),
    });
  });

  it('should throw when enum values are not strings', () => {
    expect(() =>
      transform(
        withFbtRequireStatement(
          `let aEnum = require('Test$FbtEnum');
          var x = fbt('This is ' + fbt.enum(id, {bad: \`egg\`}), 'enums!');`,
        ),
        {fbtEnumManifest: TestFbtEnumManifest},
      ),
    ).toThrowError(
      'fbt enum range values must be StringLiteral, got TemplateLiteral',
    );
  });

  it('should throw on multiple import types', () => {
    expect(() =>
      transform(
        withFbtRequireStatement(
          `import aEnum, * as bEnum from 'Test$FbtEnum';
          var x = fbt('Click to see ' + fbt.enum(id, aEnum), 'enums!');`,
        ),
      ),
    ).toThrowError('Fbt Enum `aEnum` not registered');
  });

  it('should throw on destructured imports', () => {
    expect(() =>
      transform(
        withFbtRequireStatement(
          `import {aEnum} from 'Test$FbtEnum';
          var x = fbt('Click to see ' + fbt.enum(id, aEnum), 'enums!');`,
        ),
      ),
    ).toThrowError('Fbt Enum `aEnum` not registered');
  });
});
