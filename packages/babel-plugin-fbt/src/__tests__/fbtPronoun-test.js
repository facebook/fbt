/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @format
 * @oncall i18n_fbt_js
 */

jest.autoMockOff();

const {payload, transform, withFbtRequireStatement} = require('./FbtTestUtil');
const {FbtVariationType} = require('../translate/IntlVariations');
const {TestUtil} = require('fb-babel-plugin-utils');

function runTest(data, extra) {
  var expected = data.output;
  var actual = transform(data.input, extra);
  TestUtil.assertSourceAstEqual(expected, actual);
}

function runTestForReactNative(data, extra) {
  extra = extra || {};
  extra.reactNativeMode = true;
  runTest(data, extra);
}

describe('fbt pronoun support', () => {
  it('"capitalize" option accepts boolean literal true', () => {
    runTest({
      input:
        // eslint-disable-next-line fb-www/gender-neutral-language
        // I.e. Her birthday is today.
        withFbtRequireStatement(
          `var x = fbt(
            fbt.pronoun('possessive', gender, {capitalize: true}) +
              ' birthday is today.',
            'Capitalized possessive pronoun',
          );`,
        ),

      output: withFbtRequireStatement(
        `var x = fbt._(
          ${payload({
            jsfbt: {
              t: {
                '1': {
                  desc: 'Capitalized possessive pronoun',
                  text: 'Her birthday is today.',
                },
                '2': {
                  desc: 'Capitalized possessive pronoun',
                  text: 'His birthday is today.',
                },
                '*': {
                  desc: 'Capitalized possessive pronoun',
                  text: 'Their birthday is today.',
                },
              },
              m: [null],
            },
          })},
          [fbt._pronoun(1, gender)],
        );`,
      ),
    });
  });

  it('Should throw when using non-Boolean option value', () => {
    // Note: Using StringLiteral '"true"' instead of BooleanLiteral 'true'.
    const input = withFbtRequireStatement(
      `var x = fbt(
        'Today is ' +
          fbt.pronoun('possessive', gender, {human: 'true'}) +
          ' a happy birthday.',
        'Expect error exception',
      );`,
    );
    expect(() => transform(input)).toThrowError(
      "Expected boolean value instead of 'true' (string)",
    );
  });

  it('Should throw when using non-Boolean option value in a template', () => {
    // Note: Using StringLiteral '"true"' instead of BooleanLiteral 'true'.
    const input = withFbtRequireStatement(
      `var x = fbt(
        \`Today is \${fbt.pronoun('possessive', gender, {
          human: 'true',
        })} a happy birthday.\`,
        'Expect error exception',
      );`,
    );
    expect(() => transform(input)).toThrowError(
      "Expected boolean value instead of 'true' (string)",
    );
  });

  it('Should throw when using unknown "usage" value', () => {
    // Note: Using "possession" instead of "possessive".
    const input = withFbtRequireStatement(
      `var x = fbt(
        'Today is ' +
          fbt.pronoun('possession', gender, {human: false}) +
          ' a happy birthday.',
        'Expect error exception',
      );`,
    );
    expect(() => transform(input)).toThrowError(
      '`usage`, the first argument of fbt.pronoun() - Expected value to be ' +
        "one of [object, possessive, reflexive, subject] but we got 'possession' (string) instead",
    );
  });

  it('Should elide false "human" option from fbt.pronoun()', () => {
    runTest({
      input:
        // I.e. Wish them a happy birthday.
        withFbtRequireStatement(
          `var x = fbt(
            'Wish ' +
              fbt.pronoun('object', gender, {human: true}) +
              ' a happy birthday.',
            'Elided false option',
          );`,
        ),

      output: withFbtRequireStatement(
        `var x = fbt._(
          ${payload({
            jsfbt: {
              t: {
                '1': {
                  desc: 'Elided false option',
                  text: 'Wish her a happy birthday.',
                },
                '2': {
                  desc: 'Elided false option',
                  text: 'Wish him a happy birthday.',
                },
                '*': {
                  desc: 'Elided false option',
                  text: 'Wish them a happy birthday.',
                },
              },
              m: [null],
            },
          })},
          [fbt._pronoun(0, gender, {human: 1})],
        );`,
      ),
    });
  });
});

describe('fbt pronoun support (react native)', () => {
  it('"capitalize" option accepts boolean literal true', () => {
    runTestForReactNative({
      input:
        // eslint-disable-next-line fb-www/gender-neutral-language
        // I.e. Her birthday is today.
        withFbtRequireStatement(
          `var x = fbt(
            fbt.pronoun('possessive', gender, {capitalize: true}) +
              ' birthday is today.',
            'Capitalized possessive pronoun',
          );`,
        ),

      output: withFbtRequireStatement(
        `var x = fbt._(
          ${payload({
            jsfbt: {
              t: {
                '1': {
                  desc: 'Capitalized possessive pronoun',
                  text: 'Her birthday is today.',
                },
                '2': {
                  desc: 'Capitalized possessive pronoun',
                  text: 'His birthday is today.',
                },
                '*': {
                  desc: 'Capitalized possessive pronoun',
                  text: 'Their birthday is today.',
                },
              },
              m: [
                {
                  type: FbtVariationType.PRONOUN,
                },
              ],
            },
          })},
          [fbt._pronoun(1, gender)],
        );`,
      ),
    });
  });

  it('Should throw when using non-Boolean option value', () => {
    // Note: Using StringLiteral '"true"' instead of BooleanLiteral 'true'.
    const input = withFbtRequireStatement(
      `var x = fbt(
        'Today is ' +
          fbt.pronoun('possessive', gender, {human: 'true'}) +
          ' a happy birthday.',
        'Expect error exception',
      );`,
    );
    expect(() => transform(input, {reactNativeMode: true})).toThrowError(
      "Expected boolean value instead of 'true' (string)",
    );
  });

  it('Should throw when using non-Boolean option value in a template', () => {
    // Note: Using StringLiteral '"true"' instead of BooleanLiteral 'true'.
    const input = withFbtRequireStatement(
      `var x = fbt(
        \`Today is \${fbt.pronoun('possessive', gender, {
          human: 'true',
        })} a happy birthday.\`,
        'Expect error exception',
      );`,
    );
    expect(() => transform(input, {reactNativeMode: true})).toThrowError(
      "Expected boolean value instead of 'true' (string)",
    );
  });

  it('Should throw when using unknown "usage" value', () => {
    // Note: Using "possession" instead of "possessive".
    const input = withFbtRequireStatement(
      `var x = fbt(
        'Today is ' +
          fbt.pronoun('possession', gender, {human: false}) +
          ' a happy birthday.',
        'Expect error exception',
      );`,
    );
    expect(() => transform(input, {reactNativeMode: true})).toThrowError(
      '`usage`, the first argument of fbt.pronoun() - Expected value to be ' +
        "one of [object, possessive, reflexive, subject] but we got 'possession' (string) instead",
    );
  });

  it('Should elide false "human" option from fbt.pronoun()', () => {
    runTestForReactNative({
      input:
        // I.e. Wish them a happy birthday.
        withFbtRequireStatement(
          `var x = fbt(
            'Wish ' +
              fbt.pronoun('object', gender, {human: true}) +
              ' a happy birthday.',
            'Elided false option',
          );`,
        ),

      output: withFbtRequireStatement(
        `var x = fbt._(
          ${payload({
            jsfbt: {
              t: {
                '1': {
                  desc: 'Elided false option',
                  text: 'Wish her a happy birthday.',
                },
                '2': {
                  desc: 'Elided false option',
                  text: 'Wish him a happy birthday.',
                },
                '*': {
                  desc: 'Elided false option',
                  text: 'Wish them a happy birthday.',
                },
              },
              m: [
                {
                  type: FbtVariationType.PRONOUN,
                },
              ],
            },
          })},
          [fbt._pronoun(0, gender, {human: 1})],
        );`,
      ),
    });
  });
});
