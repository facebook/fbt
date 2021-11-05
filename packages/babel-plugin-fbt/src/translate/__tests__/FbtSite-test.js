/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 * @flow strict-local
 */

jest.autoMockOff();

const {FbtSite} = require('../FbtSite');

describe('Test serialization', () => {
  it('should serialize/deserialize as expected', () => {
    const f = new FbtSite(
      {
        'gVKMc/8jq5vnYR5v2bb32g==': {
          text: '{name} has shared {=[number] photos} with you',
          desc: 'example 1',
        },
        'PqPPir8Kg9xSlqdednPFOg==': {
          text: '{name} has shared {=a photo} with you',
          desc: 'example 1',
        },
      },
      {
        t: {
          '*': {
            '*': {
              desc: 'example 1',
              text: '{name} has shared {=[number] photos} with you',
              tokenAliases: {
                '=[number] photos': '=m2',
              },
            },
            _1: {
              desc: 'example 1',
              text: '{name} has shared {=a photo} with you',
              tokenAliases: {
                '=a photo': '=m2',
              },
            },
          },
        },
        m: [
          {
            token: 'name',
            type: 1,
          },
          {
            token: 'number',
            type: 2,
            singular: true,
          },
        ],
      },
      'fbt-demo-project',
      {
        'gVKMc/8jq5vnYR5v2bb32g==': {
          '=[number] photos': '=m2',
        },
        'PqPPir8Kg9xSlqdednPFOg==': {
          '=a photo': '=m2',
        },
      },
    );
    const original = f.serialize();
    const hydrated = FbtSite.deserialize(original).serialize();
    expect(original).toEqual(hydrated);
    expect(original).toMatchSnapshot();
  });
});
