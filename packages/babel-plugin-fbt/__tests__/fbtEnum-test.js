/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p babel_plugin_fbt --local ~/www
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

  it('should handle functional enums (with references)', () => {
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
});
