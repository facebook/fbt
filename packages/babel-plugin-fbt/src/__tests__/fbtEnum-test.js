/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @format
 * @oncall i18n_fbt_js
 */

jest.autoMockOff();

const TestFbtEnumManifest = require('TestFbtEnumManifest');

const {
  jsCodeFbtCallSerializer,
  snapshotTransform,
  withFbtRequireStatement,
} = require('./FbtTestUtil');

expect.addSnapshotSerializer(jsCodeFbtCallSerializer);

function runTest(data) {
  expect(
    snapshotTransform(data.input, {fbtEnumManifest: TestFbtEnumManifest}),
  ).toMatchSnapshot();
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
    });
  });

  it('should handle functional enums (with references) (require)', () => {
    runTest({
      input: withFbtRequireStatement(
        `let aEnum = require('Test$FbtEnum');
        var x = fbt('Click to see ' + fbt.enum(id, aEnum), 'enums!');`,
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
    });
  });

  it('should handle functional enums (with references) (import star)', () => {
    runTest({
      input: `
        import fbt from 'fbt';
        import * as aEnum from 'Test$FbtEnum';
        var x = fbt('Click to see ' + fbt.enum(id, aEnum), 'enums!');
      `,
    });
  });

  it('should handle functional enums (with references) in templates', () => {
    runTest({
      input: withFbtRequireStatement(
        `let aEnum = require('Test$FbtEnum');
          var x = fbt(\`Click to see \${fbt.enum(id, aEnum)}\`, 'enums!');`,
      ),
    });
  });

  it('should throw when enum values are not strings', () => {
    expect(() =>
      snapshotTransform(
        withFbtRequireStatement(
          `let aEnum = require('Test$FbtEnum');
          var x = fbt('This is ' + fbt.enum(id, {bad: \`egg\`}), 'enums!');`,
        ),
        {fbtEnumManifest: TestFbtEnumManifest},
      ),
    ).toThrowError('Enum values must be string literals');
  });

  describe('when used with dynamic enum keys', () => {
    it('should throw the enum key is a variable (BabelNodeIdentifier)', () => {
      expect(() =>
        snapshotTransform(
          withFbtRequireStatement(
            `const foo = 'anything';
            <fbt desc="try fbt:enum with a dynamic enum key">
              <fbt:enum
                enum-range={{
                  [foo]: 'bar',
                }}
                value={myValue}
              />
            </fbt>;`,
          ),
          {fbtEnumManifest: TestFbtEnumManifest},
        ),
      ).toThrowError('Enum keys must be string literals instead of `');
    });

    it('should throw the enum key is a variable (MemberExpression)', () => {
      expect(() =>
        snapshotTransform(
          withFbtRequireStatement(
            `const foo = {bar: 'anything'};
            <fbt desc="try fbt:enum with a dynamic enum key">
              <fbt:enum
                enum-range={{
                  [foo.bar]: 'baz',
                }}
                value={myValue}
              />
            </fbt>;`,
          ),
          {fbtEnumManifest: TestFbtEnumManifest},
        ),
      ).toThrowError('Enum keys must be string literals instead of `');
    });
  });

  it('should throw on multiple import types', () => {
    expect(() =>
      snapshotTransform(
        withFbtRequireStatement(
          `import aEnum, * as bEnum from 'Test$FbtEnum';
          var x = fbt('Click to see ' + fbt.enum(id, aEnum), 'enums!');`,
        ),
      ),
    ).toThrowError('Fbt Enum `aEnum` not registered');
  });

  it('should throw on destructured imports', () => {
    expect(() =>
      snapshotTransform(
        withFbtRequireStatement(
          `import {aEnum} from 'Test$FbtEnum';
          var x = fbt('Click to see ' + fbt.enum(id, aEnum), 'enums!');`,
        ),
      ),
    ).toThrowError('Fbt Enum `aEnum` not registered');
  });
});
