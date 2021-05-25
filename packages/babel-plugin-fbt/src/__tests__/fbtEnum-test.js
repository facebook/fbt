/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 */

jest.autoMockOff();

const TestFbtEnumManifest = require('TestFbtEnumManifest');

const {
  jsCodeFbtCallSerializer,
  snapshotTransform,
  withFbtRequireStatement,
} = require('../FbtTestUtil');

expect.addSnapshotSerializer(jsCodeFbtCallSerializer);

function runTest(data) {
  expect(
    snapshotTransform(data.input, {fbtEnumManifest: TestFbtEnumManifest}),
  ).toMatchSnapshot();
}

// TODO(T40113359) Re-enable once this test scenario is ready to be tested
xdescribe('Test Fbt Enum', () => {
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
    ).toThrowError(
      'fbt enum range values must be StringLiteral, got TemplateLiteral',
    );
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
