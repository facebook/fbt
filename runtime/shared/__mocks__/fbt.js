/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+i18n_fbt_js
 */

const invariant = require('invariant');

jest
  .unmock('FbtEnv')
  .unmock('FbtTable')
  .unmock('FbtTableAccessor')
  .unmock('intlNumUtils')
  .unmock('IntlPhonologicalRewrites')
  .unmock('IntlPunctuation')
  .unmock('IntlVariationResolver')
  .unmock('IntlVariationResolverImpl')
  .unmock('NumberFormatConsts')
  .unmock('substituteTokens')
  .mock('FbtNumberType');

const WRAPPER = '__FBT__';
const fbtRuntime = jest.requireActual('fbt');

const fbt = jest.fn().mockImplementation(function () {
  throw new Error('should never be called');
});

function unwrap(json) {
  try {
    return JSON.parse(json.slice(WRAPPER.length, -WRAPPER.length));
  } catch (ex) {
    throw new Error('Invalid FBT JSON: ' + json + ' (' + ex.message + ')');
  }
}

fbt._ = jest.fn().mockImplementation((wrappedJSON, args) => {
  const unwrappedJson = unwrap(wrappedJSON);
  const jsfbt = unwrappedJson.jsfbt;
  return fbtRuntime._(unwrappedJson.type === 'text' ? jsfbt : jsfbt.t, args);
});

fbt._.getCallString = index => unwrap(fbt._.mock.calls[index][0]);

[
  '_enum',
  '_name',
  '_param',
  '_plural',
  '_pronoun',
  '_subject',
  'isFbtInstance',
].forEach(methodName => {
  invariant(
    typeof fbtRuntime[methodName] === 'function',
    'Expected method fbt.%s() to be defined',
    methodName,
  );
  fbt[methodName] = (...args) => fbtRuntime[methodName](...args);
});

module.exports = fbt;
