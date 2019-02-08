/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 */

jest.autoMockOff();

const {FbtSite} = require('../FbtSite');

describe('Test serialization', () => {
  it('should serialize/deserialize as expected', () => {
    const f = new FbtSite(
      'table',
      {
        a: 'text1',
        b: 'text2',
      },
      {
        t: {},
        m: [],
      },
      'p',
    );
    const original = f.serialize();
    const hydrated = FbtSite.deserialize(original).serialize();
    expect(original).toEqual(hydrated);
  });
});
