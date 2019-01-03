/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+internationalization
 */

const MockedFbtResultBase = jest.fn();
const ActualFbtResultBase = jest.requireActual('FbtResultBase');

// Unmock this method because it needs to be used by FbtResultBase almost all the time
MockedFbtResultBase.usingStringProxyMethod =
  ActualFbtResultBase.usingStringProxyMethod;

module.exports = MockedFbtResultBase;
