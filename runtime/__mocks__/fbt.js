/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+internationalization
 */

jest
  .unmock('substituteTokens')
  .unmock('intlNumUtils')
  .unmock('IntlPunctuation')
  .unmock('IntlPhonologicalRewrites')
  .unmock('NumberFormatConsts')
  .unmock('IntlVariationResolver')
  .unmock('IntlVariationResolverImpl')
  .unmock('FbtTableAccessor')
  .mock('FbtNumberType');

var fbt = jest.fn();
var fbtRuntime = jest.requireActual('fbt');

var WRAPPER = '__FBT__';

fbt.mockImplementation(function() {
  throw new Error('should never be called');
});

function unwrap(json) {
  try {
    return JSON.parse(json.slice(WRAPPER.length, -WRAPPER.length));
  } catch (ex) {
    throw new Error('Invalid FBT JSON: ' + json + ' (' + ex.message + ')');
  }
}

fbt._ = jest.fn();
fbt._.mockImplementation(function(wrappedJSON, args) {
  const unwrappedJson = unwrap(wrappedJSON);
  const jsfbt = unwrappedJson.jsfbt;
  return fbtRuntime._(unwrappedJson.type === 'text' ? jsfbt : jsfbt.t, args);
});

fbt._.getCallString = function(index) {
  return unwrap(fbt._.mock.calls[index][0]);
};

fbt._param = function(name, value, variations) {
  return fbtRuntime._param(name, value, variations);
};

fbt._plural = function(count, label, value) {
  return fbtRuntime._plural(count, label, value);
};

fbt._pronoun = function(usage, gender, options) {
  return fbtRuntime._pronoun(usage, gender, options);
};

fbt._enum = function(value, range) {
  return fbtRuntime._enum(value, range);
};

fbt._subject = function(value) {
  return fbtRuntime._subject(value);
};

module.exports = fbt;
