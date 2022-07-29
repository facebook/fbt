/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

jest.autoMockOff();

const {FbtSite} = require('../FbtSite');

describe('FbtSite: testing fromScan', () => {
  let fbtSite;

  beforeEach(() => {
    fbtSite = FbtSite.fromScan({
      hashToLeaf: {
        'gVKMc/8jq5vnYR5v2bb32g==': {
          text: '{name} has shared {=[number] photos} with you',
          desc: 'example 1',
        },
        'PqPPir8Kg9xSlqdednPFOg==': {
          text: '{name} has shared {=a photo} with you',
          desc: 'example 1',
        },
      },
      jsfbt: {
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
      project: 'fbt-demo-project',
      col_beg: 10,
      col_end: 20,
      line_beg: 9,
      line_end: 10,
      filepath: 'Example.react.js',
    });
  });

  it('should compute hashToTokenAliases property as expected', () => {
    expect(fbtSite.getHashToTokenAliases()).toEqual({
      'gVKMc/8jq5vnYR5v2bb32g==': {
        '=[number] photos': '=m2',
      },
      'PqPPir8Kg9xSlqdednPFOg==': {
        '=a photo': '=m2',
      },
    });
  });

  it('should compute hashifiedTableJSFBTTree property as expected', () => {
    expect(fbtSite.getTableOrHash()).toEqual({
      '*': {
        '*': 'gVKMc/8jq5vnYR5v2bb32g==',
        _1: 'PqPPir8Kg9xSlqdednPFOg==',
      },
    });
  });
});
