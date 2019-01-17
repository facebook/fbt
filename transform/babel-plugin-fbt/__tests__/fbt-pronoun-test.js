/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p babel_plugin_fbt --remote localhost:~/www
 *
 * @nolint
 * @emails oncall+internationalization
 * @format
 */

jest.autoMockOff();

const {TestUtil} = require('fb-babel-plugin-utils');
const {payload, transform} = require('../FbtTestUtil');
const {transformSync: babelTransform} = require('@babel/core');

const FbtVariationType = {
  GENDER: 1,
  NUMBER: 2,
  PRONOUN: 3,
};

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
        // I.e. Her birthday is today.
        "const fbt = require('fbt');" +
        'var x =' +
        '  fbt(fbt.pronoun("possessive", gender, {capitalize:true}) +' +
        '    " birthday is today.",' +
        '    "Capitalized possessive pronoun");',

      output:
        "const fbt = require('fbt');" +
        'var x = fbt._(' +
        payload({
          type: 'table',
          jsfbt: {
            t: {
              '1': 'Her birthday is today.',
              '2': 'His birthday is today.',
              '*': 'Their birthday is today.',
            },
            m: [null],
          },
          desc: 'Capitalized possessive pronoun',
        }) +
        ',[fbt._pronoun(1,gender)]);',
    });
  });

  it('Should throw when using non-Boolean option value', () => {
    // Note: Using StringLiteral '"true"' instead of BooleanLiteral 'true'.
    const input =
      "const fbt = require('fbt');" +
      'var x =' +
      '  fbt("Today is " +' +
      '    fbt.pronoun("possessive", gender, {human:"true"}) +' +
      '    " a happy birthday.",' +
      '    "Expect error exception");';
    expect(() => transform(input)).toThrowError(/ must be Boolean literal /);
  });

  it('Should throw when using non-Boolean option value in a template', () => {
    // Note: Using StringLiteral '"true"' instead of BooleanLiteral 'true'.
    const input =
      "const fbt = require('fbt');" +
      'var x =' +
      '  fbt(`Today is ' +
      '    ${fbt.pronoun("possessive", gender, {human:"true"})}' +
      '     a happy birthday.`,' +
      '    "Expect error exception");';
    expect(() => transform(input)).toThrowError(/ must be Boolean literal /);
  });

  it('Should throw when using unknown "usage" value', () => {
    // Note: Using "possession" instead of "possessive".
    const input =
      "const fbt = require('fbt');" +
      'var x =' +
      '  fbt("Today is " +' +
      '    fbt.pronoun("possession", gender, {human:false}) +' +
      '    " a happy birthday.",' +
      '    "Expect error exception");';
    expect(() => transform(input)).toThrowError(
      / must be one of \[object,possessive,reflexive,subject\]/,
    );
  });

  it('Should elide false "human" option from fbt.pronoun()', () => {
    runTest({
      input:
        // I.e. Wish them a happy birthday.
        "const fbt = require('fbt');" +
        'var x =' +
        '  fbt("Wish " +' +
        '    fbt.pronoun("object", gender, {human:false}) +' +
        '    " a happy birthday.",' +
        '    "Elided false option");',

      output:
        "const fbt = require('fbt');" +
        'var x = fbt._(' +
        payload({
          type: 'table',
          jsfbt: {
            t: {
              '1': 'Wish her a happy birthday.',
              '2': 'Wish him a happy birthday.',
              '*': 'Wish them a happy birthday.',
            },
            m: [null],
          },
          desc: 'Elided false option',
        }) +
        ',[fbt._pronoun(0,gender)]);',
    });
  });
});

describe('fbt pronoun support (react native)', () => {
  it('"capitalize" option accepts boolean literal true', () => {
    runTestForReactNative({
      input:
        // I.e. Her birthday is today.
        "const fbt = require('fbt');" +
        'var x =' +
        '  fbt(fbt.pronoun("possessive", gender, {capitalize:true}) +' +
        '    " birthday is today.",' +
        '    "Capitalized possessive pronoun");',

      output:
        "const fbt = require('fbt');" +
        'var x = fbt._(' +
        payload({
          type: 'table',
          jsfbt: {
            t: {
              '1': 'Her birthday is today.',
              '2': 'His birthday is today.',
              '*': 'Their birthday is today.',
            },
            m: [
              {
                type: FbtVariationType.PRONOUN,
              },
            ],
          },
          desc: 'Capitalized possessive pronoun',
        }) +
        ',[fbt._pronoun(1,gender)]);',
    });
  });

  it('Should throw when using non-Boolean option value', () => {
    // Note: Using StringLiteral '"true"' instead of BooleanLiteral 'true'.
    const input =
      "const fbt = require('fbt');" +
      'var x =' +
      '  fbt("Today is " +' +
      '    fbt.pronoun("possessive", gender, {human:"true"}) +' +
      '    " a happy birthday.",' +
      '    "Expect error exception");';
    expect(() => transform(input, {reactNativeMode: true})).toThrowError(
      / must be Boolean literal /,
    );
  });

  it('Should throw when using non-Boolean option value in a template', () => {
    // Note: Using StringLiteral '"true"' instead of BooleanLiteral 'true'.
    const input =
      "const fbt = require('fbt');" +
      'var x =' +
      '  fbt(`Today is ' +
      '    ${fbt.pronoun("possessive", gender, {human:"true"})}' +
      '     a happy birthday.`,' +
      '    "Expect error exception");';
    expect(() => transform(input, {reactNativeMode: true})).toThrowError(
      / must be Boolean literal /,
    );
  });

  it('Should throw when using unknown "usage" value', () => {
    // Note: Using "possession" instead of "possessive".
    const input =
      "const fbt = require('fbt');" +
      'var x =' +
      '  fbt("Today is " +' +
      '    fbt.pronoun("possession", gender, {human:false}) +' +
      '    " a happy birthday.",' +
      '    "Expect error exception");';
    expect(() => transform(input, {reactNativeMode: true})).toThrowError(
      / must be one of \[object,possessive,reflexive,subject\]/,
    );
  });

  it('Should elide false "human" option from fbt.pronoun()', () => {
    runTestForReactNative({
      input:
        // I.e. Wish them a happy birthday.
        "const fbt = require('fbt');" +
        'var x =' +
        '  fbt("Wish " +' +
        '    fbt.pronoun("object", gender, {human:false}) +' +
        '    " a happy birthday.",' +
        '    "Elided false option");',

      output:
        "const fbt = require('fbt');" +
        'var x = fbt._(' +
        payload({
          type: 'table',
          jsfbt: {
            t: {
              '1': 'Wish her a happy birthday.',
              '2': 'Wish him a happy birthday.',
              '*': 'Wish them a happy birthday.',
            },
            m: [
              {
                type: FbtVariationType.PRONOUN,
              },
            ],
          },
          desc: 'Elided false option',
        }) +
        ',[fbt._pronoun(0,gender)]);',
    });
  });
});
