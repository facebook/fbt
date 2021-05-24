/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 * @flow
 */

'use strict';

const {jsCodeNonASCIICharSerializer} = require('../../FbtTestUtil');
const {processJSON} = require('../translateUtils');

expect.addSnapshotSerializer(jsCodeNonASCIICharSerializer);

describe('should translate old jsfbt payload', () => {
  for (const options of [{jenkins: false, hashModule: false}]) {
    describe(`with option=${JSON.stringify(options)}:`, () => {
      testTranslate(options);
    });
  }
});

function testTranslate(options) {
  it('should translate string with no variation', () => {
    const result = processJSON(
      {
        phrases: [
          {
            hashToText: {'2dcba29d4a842c6be5d76fe996fcd9f4': 'Step One'},
            filepath: 'src/App.js',
            line_beg: 36,
            col_beg: 16,
            line_end: 36,
            col_end: 56,
            desc: 'Section title',
            project: 'fbt-rn-demo-project',
            type: 'text',
            jsfbt: 'Step One',
          },
        ],
        translationGroups: [
          {
            'fb-locale': 'he_IL',
            translations: {
              '2dcba29d4a842c6be5d76fe996fcd9f4': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation: '\u05e9\u05dd',
                    variations: {},
                  },
                ],
              },
            },
          },
        ],
      },
      options,
    );
    expect(result).toMatchSnapshot();
  });

  it('should translate string with variation and metadata', () => {
    const result = processJSON(
      {
        phrases: [
          {
            hashToText: {
              'Yjqpv79V3JSE255LFP0AAA==':
                '{name} has a link to share! {=View} her link.',
              'pmznwyWXEqrG9HZwb5aGsQ==':
                '{name} has a link to share! {=View} his link.',
              '/JQB0l8rEd+B7ae/lcLlVg==':
                '{name} has a link to share! {=View} their link.',
              'fS9yqVLDDYOA627Xuxrxvw==':
                '{name} has a page to share! {=View} her page.',
              '1gXZoVTrxY6d3TSX5/KrXg==':
                '{name} has a page to share! {=View} his page.',
              'ocUjztl+ZCTxysGLukn+kw==':
                '{name} has a page to share! {=View} their page.',
              'z67lDQSKUy/LXrqrRHj3aw==':
                '{name} has a photo to share! {=View} her photo.',
              '1PKQnkF/lWmk79Tv/ys24A==':
                '{name} has a photo to share! {=View} his photo.',
              '95jC7mDsBpqzCbCA3504zw==':
                '{name} has a photo to share! {=View} their photo.',
              '7y2mltlG5nn8ihCz2AK1AQ==':
                '{name} has a post to share! {=View} her post.',
              'FT9sU8nTJmNxzV6HXQDOdA==':
                '{name} has a post to share! {=View} his post.',
              'Izavl3nyjFZGvIPhvrJYMA==':
                '{name} has a post to share! {=View} their post.',
              '9fe4WrzDx/G3g9xlON2txA==':
                '{name} has a video to share! {=View} her video.',
              'I3OyaQ+VNY1GA++1dByInA==':
                '{name} has a video to share! {=View} his video.',
              'N4hL52x52Phrk/Bzp1RkTg==':
                '{name} has a video to share! {=View} their video.',
            },
            filepath: 'src/example/Example.react.js',
            line_beg: 126,
            col_beg: 11,
            line_end: 150,
            col_end: 22,
            desc: 'Example enum & pronoun',
            project: 'fbt-demo-project',
            type: 'table',
            jsfbt: {
              t: {
                LINK: {
                  '1': '{name} has a link to share! {=View} her link.',
                  '2': '{name} has a link to share! {=View} his link.',
                  '*': '{name} has a link to share! {=View} their link.',
                },
                PAGE: {
                  '1': '{name} has a page to share! {=View} her page.',
                  '2': '{name} has a page to share! {=View} his page.',
                  '*': '{name} has a page to share! {=View} their page.',
                },
                PHOTO: {
                  '1': '{name} has a photo to share! {=View} her photo.',
                  '2': '{name} has a photo to share! {=View} his photo.',
                  '*': '{name} has a photo to share! {=View} their photo.',
                },
                POST: {
                  '1': '{name} has a post to share! {=View} her post.',
                  '2': '{name} has a post to share! {=View} his post.',
                  '*': '{name} has a post to share! {=View} their post.',
                },
                VIDEO: {
                  '1': '{name} has a video to share! {=View} her video.',
                  '2': '{name} has a video to share! {=View} his video.',
                  '*': '{name} has a video to share! {=View} their video.',
                },
              },
              m: [null, null],
            },
          },
          {
            hashToText: {
              'mmqgrx7cIVUnJZnhEIjItw==': '{=View}',
            },
            filepath: 'src/example/Example.react.js',
            line_beg: 138,
            col_beg: 18,
            line_end: 140,
            col_end: 22,
            desc: 'In the phrase: "{=} has a to share!{=View}."',
            project: 'fbt-demo-project',
            type: 'text',
            jsfbt: '{=View}',
          },
          {
            hashToText: {
              'Kb0bgdPFst+Bq13gtG2Obg==': 'View',
            },
            filepath: 'src/example/Example.react.js',
            line_beg: 139,
            col_beg: 20,
            line_end: 139,
            col_end: 40,
            desc: 'In the phrase: "{=} has a to share!{=View}."',
            project: 'fbt-demo-project',
            type: 'text',
            jsfbt: 'View',
          },
        ],
        translationGroups: [
          {
            'fb-locale': 'he_IL',
            translations: {
              'Yjqpv79V3JSE255LFP0AAA==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '\u05dc{name} \u05d9\u05e9 \u05e7\u05d9\u05e9\u05d5\u05e8 \u05db\u05d3\u05d9 \u05dc\u05e9\u05ea\u05e3! {=View} \u05d1\u05e1\u05e8\u05d8\u05d5\u05df \u05e9\u05dc\u05d4.',
                    id: 108537882,
                    variations: {},
                  },
                ],
              },
              'pmznwyWXEqrG9HZwb5aGsQ==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '\u05dc{name} \u05d9\u05e9 \u05e7\u05d9\u05e9\u05d5\u05e8 \u05db\u05d3\u05d9 \u05dc\u05e9\u05ea\u05e3! {=View} \u05d1\u05e1\u05e8\u05d8\u05d5\u05df \u05e9\u05dc\u05d5.',
                    id: 108537888,
                    variations: {},
                  },
                ],
              },
              '/JQB0l8rEd+B7ae/lcLlVg==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '\u05dc{name} \u05d9\u05e9 \u05e7\u05d9\u05e9\u05d5\u05e8 \u05db\u05d3\u05d9 \u05dc\u05e9\u05ea\u05e3! {=View} \u05d1\u05e1\u05e8\u05d8\u05d5\u05df \u05e9\u05dc\u05d5/\u05e9\u05dc\u05d4.',
                    id: 108537895,
                    variations: {},
                  },
                ],
              },
              'fS9yqVLDDYOA627Xuxrxvw==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '\u05dc{name} \u05d9\u05e9 \u05d3\u05e3 \u05db\u05d3\u05d9 \u05dc\u05e9\u05ea\u05e3! {=View} \u05d1\u05e1\u05e8\u05d8\u05d5\u05df \u05e9\u05dc\u05d4.',
                    id: 108537847,
                    variations: {},
                  },
                ],
              },
              '1gXZoVTrxY6d3TSX5/KrXg==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '\u05dc{name} \u05d9\u05e9 \u05d3\u05e3 \u05db\u05d3\u05d9 \u05dc\u05e9\u05ea\u05e3! {=View} \u05d1\u05e1\u05e8\u05d8\u05d5\u05df \u05e9\u05dc\u05d5.',
                    id: 108537856,
                    variations: {},
                  },
                ],
              },
              'ocUjztl+ZCTxysGLukn+kw==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '\u05dc{name} \u05d9\u05e9 \u05d3\u05e3 \u05db\u05d3\u05d9 \u05dc\u05e9\u05ea\u05e3! {=View} \u05d1\u05e1\u05e8\u05d8\u05d5\u05df \u05e9\u05dc\u05d5/\u05e9\u05dc\u05d4.',
                    id: 108537859,
                    variations: {},
                  },
                ],
              },
              'z67lDQSKUy/LXrqrRHj3aw==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '\u05dc{name} \u05d9\u05e9 \u05ea\u05de\u05d5\u05e0\u05d4 \u05db\u05d3\u05d9 \u05dc\u05e9\u05ea\u05e3! {=View} \u05d1\u05e1\u05e8\u05d8\u05d5\u05df \u05e9\u05dc\u05d4.',
                    id: 108537907,
                    variations: {},
                  },
                ],
              },
              '1PKQnkF/lWmk79Tv/ys24A==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '\u05dc{name} \u05d9\u05e9 \u05ea\u05de\u05d5\u05e0\u05d4 \u05db\u05d3\u05d9 \u05dc\u05e9\u05ea\u05e3! {=View} \u05d1\u05e1\u05e8\u05d8\u05d5\u05df \u05e9\u05dc\u05d5.',
                    id: 108537918,
                    variations: {},
                  },
                ],
              },
              '95jC7mDsBpqzCbCA3504zw==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '\u05dc{name} \u05d9\u05e9 \u05ea\u05de\u05d5\u05e0\u05d4 \u05db\u05d3\u05d9 \u05dc\u05e9\u05ea\u05e3! {=View} \u05d1\u05e1\u05e8\u05d8\u05d5\u05df \u05e9\u05dc\u05d5/\u05e9\u05dc\u05d4.',
                    id: 108537926,
                    variations: {},
                  },
                ],
              },
              '7y2mltlG5nn8ihCz2AK1AQ==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '\u05dc{name} \u05d9\u05e9 \u05e4\u05d5\u05e1\u05d8 \u05db\u05d3\u05d9 \u05dc\u05e9\u05ea\u05e3! {=View} \u05d1\u05e1\u05e8\u05d8\u05d5\u05df \u05e9\u05dc\u05d4.',
                    id: 108538054,
                    variations: {},
                  },
                ],
              },
              'FT9sU8nTJmNxzV6HXQDOdA==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '\u05dc{name} \u05d9\u05e9 \u05e4\u05d5\u05e1\u05d8 \u05db\u05d3\u05d9 \u05dc\u05e9\u05ea\u05e3! {=View} \u05d1\u05e1\u05e8\u05d8\u05d5\u05df \u05e9\u05dc\u05d5.',
                    id: 108538064,
                    variations: {},
                  },
                ],
              },
              'Izavl3nyjFZGvIPhvrJYMA==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '\u05dc{name} \u05d9\u05e9 \u05e4\u05d5\u05e1\u05d8 \u05db\u05d3\u05d9 \u05dc\u05e9\u05ea\u05e3! {=View} \u05d1\u05e1\u05e8\u05d8\u05d5\u05df \u05e9\u05dc\u05d5/\u05e9\u05dc\u05d4.',
                    id: 108538079,
                    variations: {},
                  },
                ],
              },
              '9fe4WrzDx/G3g9xlON2txA==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '\u05dc{name} \u05d9\u05e9 \u05e1\u05e8\u05d8\u05d5\u05df \u05db\u05d3\u05d9 \u05dc\u05e9\u05ea\u05e3! {=View} \u05d1\u05e1\u05e8\u05d8\u05d5\u05df \u05e9\u05dc\u05d4.',
                    id: 108537774,
                    variations: {},
                  },
                ],
              },
              'I3OyaQ+VNY1GA++1dByInA==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '\u05dc{name} \u05d9\u05e9 \u05e1\u05e8\u05d8\u05d5\u05df \u05db\u05d3\u05d9 \u05dc\u05e9\u05ea\u05e3! {=View} \u05d1\u05e1\u05e8\u05d8\u05d5\u05df \u05e9\u05dc\u05d5.',
                    id: 108537806,
                    variations: {},
                  },
                ],
              },
              'N4hL52x52Phrk/Bzp1RkTg==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '\u05dc{name} \u05d9\u05e9 \u05e1\u05e8\u05d8\u05d5\u05df \u05db\u05d3\u05d9 \u05dc\u05e9\u05ea\u05e3! {=View} \u05d1\u05e1\u05e8\u05d8\u05d5\u05df \u05e9\u05dc\u05d5/\u05e9\u05dc\u05d4.',
                    id: 108537784,
                    variations: {},
                  },
                ],
              },
              'mmqgrx7cIVUnJZnhEIjItw==': {
                tokens: [],
                types: [],
                translations: [
                  {translation: '{=View}', id: 107914743, variations: {}},
                ],
              },
              'Kb0bgdPFst+Bq13gtG2Obg==': {
                tokens: ['__viewing_user__'],
                types: [3],
                translations: [
                  {
                    translation: '\u05e6\u05e4\u05d9',
                    id: 108537997,
                    variations: {'0': 2},
                  },
                  {
                    translation: '\u05e6\u05e4\u05d4',
                    id: 108537992,
                    variations: {'0': 1},
                  },
                  {
                    translation: '\u05e6\u05e4\u05d4/\u05e6\u05e4\u05d9',
                    id: 108538003,
                    variations: {'0': 3},
                  },
                ],
              },
            },
          },
        ],
      },
      options,
    );
    expect(result).toMatchSnapshot();
  });

  it('should translate string with enum', () => {
    const result = processJSON(
      {
        phrases: [
          {
            hashToText: {
              'cH6DBXSH/zGfbY5tJphPOw==': '{formatted_price} every day',
              '7TiJOt0WYi//uZuRCiDUjg==': '{formatted_price} every month',
              'hHWH1jAiPit3jRJvm3kJCQ==': '{formatted_price} every week',
              '1klL6TH6yfVzscTLardoVA==': '{formatted_price} every year',
            },
            filepath: 'src/example/Example.react.js',
            line_beg: 316,
            col_beg: 20,
            line_end: 328,
            col_end: 24,
            desc:
              "Text on a shop's product detail page that tells people the frequency of a subscription order",
            project: 'fbt-demo-project',
            type: 'table',
            jsfbt: {
              t: {
                DAILY: '{formatted_price} every day',
                MONTHLY: '{formatted_price} every month',
                WEEKLY: '{formatted_price} every week',
                YEARLY: '{formatted_price} every year',
              },
              m: [null],
            },
          },
        ],
        translationGroups: [
          {
            'fb-locale': 'he_IL',
            translations: {
              'cH6DBXSH/zGfbY5tJphPOw==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '{formatted_price} \u05db\u05dc \u05d9\u05d5\u05dd',
                    id: 160566338,
                    variations: {},
                  },
                ],
              },
              '7TiJOt0WYi//uZuRCiDUjg==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '{formatted_price} \u05db\u05dc \u05d7\u05d5\u05d3\u05e9',
                    id: 160566335,
                    variations: {},
                  },
                ],
              },
              'hHWH1jAiPit3jRJvm3kJCQ==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '{formatted_price} \u05db\u05dc \u05e9\u05d1\u05d5\u05e2',
                    id: 160566334,
                    variations: {},
                  },
                ],
              },
              '1klL6TH6yfVzscTLardoVA==': {
                tokens: [],
                types: [],
                translations: [
                  {
                    translation:
                      '{formatted_price} \u05db\u05dc \u05e9\u05e0\u05d4',
                    id: 160566337,
                    variations: {},
                  },
                ],
              },
            },
          },
        ],
      },
      options,
    );
    expect(result).toMatchSnapshot();
  });
}
