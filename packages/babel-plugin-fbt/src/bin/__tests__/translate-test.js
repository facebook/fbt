/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 * @flow
 */

'use strict';

const {jsCodeNonASCIICharSerializer} = require('../../FbtTestUtil');
const {processJSON} = require('../translateUtils');

expect.addSnapshotSerializer(jsCodeNonASCIICharSerializer);

describe('translate-test.js', () => {
  describe('should translate new jsfbt payload', () => {
    for (const options of [{jenkins: false, hashModule: false}]) {
      describe(`with option=${JSON.stringify(options)}:`, () => {
        testTranslateNewPhrases(options);
      });
    }

    function testTranslateNewPhrases(options) {
      it('should translate string with no variation', () => {
        const result = processJSON(
          {
            phrases: [
              {
                hashToLeaf: {
                  '2dcba29d4a842c6be5d76fe996fcd9f4': {
                    text: 'Your FBT Demo',
                    desc: 'title',
                  },
                },
                filepath: 'src/example/Example.react.js',
                line_beg: 130,
                col_beg: 12,
                line_end: 130,
                col_end: 49,
                project: 'fbt-demo-project',
                jsfbt: {
                  t: {
                    desc: 'title',
                    text: 'Your FBT Demo',
                    tokenAliases: {},
                  },
                  m: [],
                },
              },
            ],
            translationGroups: [
              {
                'fb-locale': 'fb_HX',
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

      it('should translate string with variations and inner strings', () => {
        const result = processJSON(
          {
            phrases: [
              {
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
                filepath: 'src/example/Example.react.js',
                line_beg: 127,
                col_beg: 8,
                line_end: 142,
                col_end: 14,
                project: 'fbt-demo-project',
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
              },
              {
                hashToLeaf: {
                  '/gj3gwqx1z8Xw233oZgOpQ==': {
                    text: '{number} photos',
                    desc:
                      'In the phrase: "{name} has shared {=[number] photos} with you"',
                  },
                  '8UZCD6gFUKN+U5UUo1I3/w==': {
                    text: 'a photo',
                    desc:
                      'In the phrase: "{name} has shared {=a photo} with you"',
                  },
                },
                filepath: 'src/example/Example.react.js',
                line_beg: 133,
                col_beg: 10,
                line_end: 140,
                col_end: 14,
                project: 'fbt-demo-project',
                jsfbt: {
                  t: {
                    '*': {
                      '*': {
                        desc:
                          'In the phrase: "{name} has shared {=[number] photos} with you"',
                        text: '{number} photos',
                        tokenAliases: {},
                      },
                      _1: {
                        desc:
                          'In the phrase: "{name} has shared {=a photo} with you"',
                        text: 'a photo',
                        tokenAliases: {},
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
              },
            ],
            translationGroups: [
              {
                'fb-locale': 'fb_HX',
                translations: {
                  'gVKMc/8jq5vnYR5v2bb32g==': {
                    tokens: ['name'],
                    types: [3],
                    translations: [
                      {
                        translation:
                          '{name} \u05e9\u05d9\u05ea\u05e4\u05d4 \u05d0\u05d9\u05ea\u05da {=[number] photos}',
                        id: 108537963,
                        variations: {'0': 2},
                      },
                      {
                        translation:
                          '{name} \u05e9\u05d9\u05ea\u05e3 \u05d0\u05d9\u05ea\u05da {=[number] photos}',
                        id: 108537953,
                        variations: {'0': 1},
                      },
                      {
                        translation:
                          '{name} \u05e9\u05d9\u05ea\u05e3/\u05e9\u05d9\u05ea\u05e4\u05d4 \u05d0\u05d9\u05ea\u05da {=[number] photos}',
                        id: 108537972,
                        variations: {'0': 3},
                      },
                    ],
                  },
                  'PqPPir8Kg9xSlqdednPFOg==': {
                    tokens: ['name'],
                    types: [3],
                    translations: [
                      {
                        translation:
                          '{name} \u05e9\u05d9\u05ea\u05e4\u05d4 \u05d0\u05d9\u05ea\u05da {=a photo}',
                        id: 108537963,
                        variations: {'0': 2},
                      },
                      {
                        translation:
                          '{name} \u05e9\u05d9\u05ea\u05e3 \u05d0\u05d9\u05ea\u05da {=a photo}',
                        id: 108537953,
                        variations: {'0': 1},
                      },
                      {
                        translation:
                          '{name} \u05e9\u05d9\u05ea\u05e3/\u05e9\u05d9\u05ea\u05e4\u05d4 \u05d0\u05d9\u05ea\u05da {=a photo}',
                        id: 108537972,
                        variations: {'0': 3},
                      },
                    ],
                  },
                  '/gj3gwqx1z8Xw233oZgOpQ==': {
                    tokens: [],
                    types: [],
                    translations: [
                      {
                        translation:
                          '{number} \u05ea\u05de\u05d5\u05e0\u05d5\u05ea',
                        id: 107911344,
                        variations: {},
                      },
                    ],
                  },
                  '8UZCD6gFUKN+U5UUo1I3/w==': {
                    tokens: [],
                    types: [],
                    translations: [
                      {
                        translation: '\u05ea\u05de\u05d5\u05e0\u05d4',
                        id: 107911340,
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

      it(
        'should translate string with metadata entries that create no ' +
          'hidden variation. Note: this string was collected in RN mode.',
        () => {
          const result = processJSON(
            {
              phrases: [
                {
                  hashToLeaf: {
                    'vHtEb4ph7GJGeRkjtEHcPA==': {
                      text: 'she shared a photo.',
                      desc: 'Example enum',
                    },
                    'j9fTl1uOEIuslim41sMkdQ==': {
                      text: 'he shared a photo.',
                      desc: 'Example enum',
                    },
                    'sNncqVnQfCGCeJNXsLObVw==': {
                      text: 'they shared a photo.',
                      desc: 'Example enum',
                    },
                  },
                  filepath: 'src/example/Example.react.js',
                  line_beg: 127,
                  col_beg: 6,
                  line_end: 130,
                  col_end: 12,
                  project: 'fbt-demo-project',
                  jsfbt: {
                    t: {
                      '1': {
                        desc: 'Example enum',
                        text: 'she shared a photo.',
                      },
                      '2': {
                        desc: 'Example enum',
                        text: 'he shared a photo.',
                      },
                      '*': {
                        desc: 'Example enum',
                        text: 'they shared a photo.',
                      },
                    },
                    m: [
                      {
                        type: 3,
                      },
                    ],
                  },
                },
              ],
              translationGroups: [
                {
                  'fb-locale': 'fb_HX',
                  translations: {
                    'vHtEb4ph7GJGeRkjtEHcPA==': {
                      tokens: [],
                      types: [],
                      translations: [
                        {
                          translation: '\u05e9\u05dd\u05e9\u05dd',
                          variations: {},
                        },
                      ],
                    },
                    'j9fTl1uOEIuslim41sMkdQ==': {
                      tokens: [],
                      types: [],
                      translations: [
                        {
                          translation: '\u05e9\u05dd\u05dd',
                          variations: {},
                        },
                      ],
                    },
                    'sNncqVnQfCGCeJNXsLObVw==': {
                      tokens: [],
                      types: [],
                      translations: [
                        {
                          translation: '\u05e9\u05dd\u05e9',
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
        },
      );

      it('should translate string with enum', () => {
        const result = processJSON(
          {
            phrases: [
              {
                hashToLeaf: {
                  '2PhpGvvUtmT5RTpv8Kqf0w==': {
                    text: '{name} has a link to share! View link.',
                    desc: 'Example enum',
                  },
                  'nwcWZzo5dAQX38+P1IaY6A==': {
                    text: '{name} has a page to share! View page.',
                    desc: 'Example enum',
                  },
                  '/3R5GnCZ5eU3EgRAiLf1vA==': {
                    text: '{name} has a photo to share! View photo.',
                    desc: 'Example enum',
                  },
                  'wGYWno21D5FWihP/v0boFw==': {
                    text: '{name} has a post to share! View post.',
                    desc: 'Example enum',
                  },
                  '/giEGYE5cqdJVvtszgdPLg==': {
                    text: '{name} has a video to share! View video.',
                    desc: 'Example enum',
                  },
                },
                filepath: 'src/example/Example.react.js',
                line_beg: 127,
                col_beg: 6,
                line_end: 133,
                col_end: 12,
                project: 'fbt-demo-project',
                jsfbt: {
                  t: {
                    LINK: {
                      desc: 'Example enum',
                      text: '{name} has a link to share! View link.',
                    },
                    PAGE: {
                      desc: 'Example enum',
                      text: '{name} has a page to share! View page.',
                    },
                    PHOTO: {
                      desc: 'Example enum',
                      text: '{name} has a photo to share! View photo.',
                    },
                    POST: {
                      desc: 'Example enum',
                      text: '{name} has a post to share! View post.',
                    },
                    VIDEO: {
                      desc: 'Example enum',
                      text: '{name} has a video to share! View video.',
                    },
                  },
                  m: [null],
                },
              },
            ],
            translationGroups: [
              {
                'fb-locale': 'fb_HX',
                translations: {
                  '2PhpGvvUtmT5RTpv8Kqf0w==': {
                    tokens: [],
                    types: [],
                    translations: [
                      {
                        translation: '{name} \u05e9\u05dd',
                        variations: {},
                      },
                    ],
                  },
                  'nwcWZzo5dAQX38+P1IaY6A==': {
                    tokens: [],
                    types: [],
                    translations: [
                      {
                        translation: '{name} \u05e9\u05dd\u05dd',
                        variations: {},
                      },
                    ],
                  },
                  '/3R5GnCZ5eU3EgRAiLf1vA==': {
                    tokens: [],
                    types: [],
                    translations: [
                      {
                        translation: '{name} \u05e9\u05dd\u05dd\u05dd',
                        variations: {},
                      },
                    ],
                  },
                  'wGYWno21D5FWihP/v0boFw==': {
                    tokens: [],
                    types: [],
                    translations: [
                      {
                        translation: '{name} \u05e9\u05dd\u05dd\u05dd\u05dd',
                        variations: {},
                      },
                    ],
                  },
                  '/giEGYE5cqdJVvtszgdPLg==': {
                    tokens: [],
                    types: [],
                    translations: [
                      {
                        translation:
                          '{name} \u05e9\u05dd\u05dd\u05dd\u05dd\u05dd',
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
  });
});
