/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

import type {Phrase, TableJSFBT, TableJSFBTTree} from '../index';

const {
  extractEnumsAndFlattenPhrases,
  shiftEnumsToTop,
} = require('../FbtShiftEnums');
const {FbtVariationType} = require('../translate/IntlVariations');

const extractEnumsAndFlattenPhrasesTestData: Array<{
  name: string,
  input: Array<Partial<Phrase>>,
  output: Array<Partial<Phrase>>,
}> = [
  {
    name: 'text and table with no enums should stay the same',
    input: [
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 1',
            text: 'Like',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [
            {
              token: 'num',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
            {
              token: 'count',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
          ],
          t: {
            _1: {
              _1: {
                desc: 'Table Desc',
                text: 'Click 1 time to see 1 photo',
                tokenAliases: {},
              },
              '*': {
                desc: 'Table Desc',
                text: 'Click 1 time to see {count} photos',
                tokenAliases: {},
              },
            },
            '*': {
              _1: {
                desc: 'Table Desc',
                text: 'Click {num} times to see 1 photo',
                tokenAliases: {},
              },
              '*': {
                desc: 'Table Desc',
                text: 'Click {num} times to see {count} photos',
                tokenAliases: {},
              },
            },
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 2',
            text: 'Comment',
            tokenAliases: {},
          },
        },
      },
    ],
    output: [
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 1',
            text: 'Like',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [
            {
              token: 'num',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
            {
              token: 'count',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
          ],
          t: {
            _1: {
              _1: {
                desc: 'Table Desc',
                text: 'Click 1 time to see 1 photo',
                tokenAliases: {},
              },
              '*': {
                desc: 'Table Desc',
                text: 'Click 1 time to see {count} photos',
                tokenAliases: {},
              },
            },
            '*': {
              _1: {
                desc: 'Table Desc',
                text: 'Click {num} times to see 1 photo',
                tokenAliases: {},
              },
              '*': {
                desc: 'Table Desc',
                text: 'Click {num} times to see {count} photos',
                tokenAliases: {},
              },
            },
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 2',
            text: 'Comment',
            tokenAliases: {},
          },
        },
      },
    ],
  },
  {
    name: 'single level enum table should be flattened to texts',
    input: [
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 1',
            text: 'Like',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [
            {
              range: ['photos', 'groups', 'comments'],
            },
          ],
          t: {
            photos: {
              desc: 'Table Desc',
              text: 'Click to see photos',
              tokenAliases: {},
            },
            groups: {
              desc: 'Table Desc',
              text: 'Click to see groups',
              tokenAliases: {},
            },
            comments: {
              desc: 'Table Desc',
              text: 'Click to see comments',
              tokenAliases: {},
            },
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 2',
            text: 'Comment',
            tokenAliases: {},
          },
        },
      },
    ],
    output: [
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 1',
            text: 'Like',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Table Desc',
            text: 'Click to see photos',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Table Desc',
            text: 'Click to see groups',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Table Desc',
            text: 'Click to see comments',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 2',
            text: 'Comment',
            tokenAliases: {},
          },
        },
      },
    ],
  },
  {
    name: 'multiple level enum table should be flattened to texts',
    input: [
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 1',
            text: 'Like',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [
            {
              range: ['here', 'there'],
            },
            {
              range: ['photos', 'groups', 'comments'],
            },
          ],
          t: {
            here: {
              photos: {
                desc: 'Table Desc',
                text: 'Click here to see photos',
                tokenAliases: {},
              },
              groups: {
                desc: 'Table Desc',
                text: 'Click here to see groups',
                tokenAliases: {},
              },
              comments: {
                desc: 'Table Desc',
                text: 'Click here to see comments',
                tokenAliases: {},
              },
            },
            there: {
              photos: {
                desc: 'Table Desc',
                text: 'Click there to see photos',
                tokenAliases: {},
              },
              groups: {
                desc: 'Table Desc',
                text: 'Click there to see groups',
                tokenAliases: {},
              },
              comments: {
                desc: 'Table Desc',
                text: 'Click there to see comments',
                tokenAliases: {},
              },
            },
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 2',
            text: 'Comment',
            tokenAliases: {},
          },
        },
      },
    ],
    output: [
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 1',
            text: 'Like',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Table Desc',
            text: 'Click here to see photos',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Table Desc',
            text: 'Click here to see groups',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Table Desc',
            text: 'Click here to see comments',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Table Desc',
            text: 'Click there to see photos',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Table Desc',
            text: 'Click there to see groups',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Table Desc',
            text: 'Click there to see comments',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 2',
            text: 'Comment',
            tokenAliases: {},
          },
        },
      },
    ],
  },
  {
    name: 'sub-tables should be extracted (one enum)',
    input: [
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 1',
            text: 'Like',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [
            {
              token: 'num',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
            {
              range: ['photos', 'posts'],
            },
          ],
          t: {
            _1: {
              photos: {
                desc: 'Table Desc',
                text: 'Click 1 time to see photos',
                tokenAliases: {},
              },
              posts: {
                desc: 'Table Desc',
                text: 'Click 1 time to see posts',
                tokenAliases: {},
              },
            },
            '*': {
              photos: {
                desc: 'Table Desc',
                text: 'Click {num} times to see photos',
                tokenAliases: {},
              },
              posts: {
                desc: 'Table Desc',
                text: 'Click {num} times to see posts',
                tokenAliases: {},
              },
            },
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 2',
            text: 'Comment',
            tokenAliases: {},
          },
        },
      },
    ],
    output: [
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 1',
            text: 'Like',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [
            {
              token: 'num',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
          ],
          t: {
            _1: {
              desc: 'Table Desc',
              text: 'Click 1 time to see photos',
              tokenAliases: {},
            },
            '*': {
              desc: 'Table Desc',
              text: 'Click {num} times to see photos',
              tokenAliases: {},
            },
          },
        },
      },
      {
        jsfbt: {
          m: [
            {
              token: 'num',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
          ],
          t: {
            _1: {
              desc: 'Table Desc',
              text: 'Click 1 time to see posts',
              tokenAliases: {},
            },
            '*': {
              desc: 'Table Desc',
              text: 'Click {num} times to see posts',
              tokenAliases: {},
            },
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 2',
            text: 'Comment',
            tokenAliases: {},
          },
        },
      },
    ],
  },
  {
    name: 'sub-tables should be extracted (multiple enums)',
    input: [
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 1',
            text: 'Like',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [
            {
              range: ['here', 'there'],
            },
            {
              token: 'num',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
            {
              range: ['photos', 'posts'],
            },
          ],
          t: {
            here: {
              _1: {
                photos: {
                  desc: 'Table Desc',
                  text: 'Click here 1 time to see photos',
                  tokenAliases: {},
                },
                posts: {
                  desc: 'Table Desc',
                  text: 'Click here 1 time to see posts',
                  tokenAliases: {},
                },
              },
              '*': {
                photos: {
                  desc: 'Table Desc',
                  text: 'Click here {num} times to see photos',
                  tokenAliases: {},
                },
                posts: {
                  desc: 'Table Desc',
                  text: 'Click here {num} times to see posts',
                  tokenAliases: {},
                },
              },
            },
            there: {
              _1: {
                photos: {
                  desc: 'Table Desc',
                  text: 'Click there 1 time to see photos',
                  tokenAliases: {},
                },
                posts: {
                  desc: 'Table Desc',
                  text: 'Click there 1 time to see posts',
                  tokenAliases: {},
                },
              },
              '*': {
                photos: {
                  desc: 'Table Desc',
                  text: 'Click there {num} times to see photos',
                  tokenAliases: {},
                },
                posts: {
                  desc: 'Table Desc',
                  text: 'Click there {num} times to see posts',
                  tokenAliases: {},
                },
              },
            },
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 2',
            text: 'Comment',
            tokenAliases: {},
          },
        },
      },
    ],
    output: [
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 1',
            text: 'Like',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [
            {
              token: 'num',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
          ],
          t: {
            _1: {
              desc: 'Table Desc',
              text: 'Click here 1 time to see photos',
              tokenAliases: {},
            },
            '*': {
              desc: 'Table Desc',
              text: 'Click here {num} times to see photos',
              tokenAliases: {},
            },
          },
        },
      },
      {
        jsfbt: {
          m: [
            {
              token: 'num',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
          ],
          t: {
            _1: {
              desc: 'Table Desc',
              text: 'Click here 1 time to see posts',
              tokenAliases: {},
            },
            '*': {
              desc: 'Table Desc',
              text: 'Click here {num} times to see posts',
              tokenAliases: {},
            },
          },
        },
      },
      {
        jsfbt: {
          m: [
            {
              token: 'num',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
          ],
          t: {
            _1: {
              desc: 'Table Desc',
              text: 'Click there 1 time to see photos',
              tokenAliases: {},
            },
            '*': {
              desc: 'Table Desc',
              text: 'Click there {num} times to see photos',
              tokenAliases: {},
            },
          },
        },
      },
      {
        jsfbt: {
          m: [
            {
              token: 'num',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
          ],
          t: {
            _1: {
              desc: 'Table Desc',
              text: 'Click there 1 time to see posts',
              tokenAliases: {},
            },
            '*': {
              desc: 'Table Desc',
              text: 'Click there {num} times to see posts',
              tokenAliases: {},
            },
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 2',
            text: 'Comment',
            tokenAliases: {},
          },
        },
      },
    ],
  },
  {
    name: 'sub-tables should be extracted (multiple enums at bottom)',
    input: [
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 1',
            text: 'Like',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [
            {
              token: 'num',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
            {
              range: ['see', 'eat'],
            },
            {
              range: ['photos', 'posts'],
            },
          ],
          t: {
            _1: {
              see: {
                photos: {
                  desc: 'Table Desc',
                  text: 'Click here 1 time to see photos',
                  tokenAliases: {},
                },
                posts: {
                  desc: 'Table Desc',
                  text: 'Click here 1 time to see posts',
                  tokenAliases: {},
                },
              },
              eat: {
                photos: {
                  desc: 'Table Desc',
                  text: 'Click here 1 time to eat photos',
                  tokenAliases: {},
                },
                posts: {
                  desc: 'Table Desc',
                  text: 'Click here 1 time to eat posts',
                  tokenAliases: {},
                },
              },
            },
            '*': {
              see: {
                photos: {
                  desc: 'Table Desc',
                  text: 'Click here {num} times to see photos',
                  tokenAliases: {},
                },
                posts: {
                  desc: 'Table Desc',
                  text: 'Click here {num} times to see posts',
                  tokenAliases: {},
                },
              },
              eat: {
                photos: {
                  desc: 'Table Desc',
                  text: 'Click here {num} times to eat photos',
                  tokenAliases: {},
                },
                posts: {
                  desc: 'Table Desc',
                  text: 'Click here {num} times to eat posts',
                  tokenAliases: {},
                },
              },
            },
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 2',
            text: 'Comment',
            tokenAliases: {},
          },
        },
      },
    ],
    output: [
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 1',
            text: 'Like',
            tokenAliases: {},
          },
        },
      },
      {
        jsfbt: {
          m: [
            {
              token: 'num',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
          ],
          t: {
            _1: {
              desc: 'Table Desc',
              text: 'Click here 1 time to see photos',
              tokenAliases: {},
            },
            '*': {
              desc: 'Table Desc',
              text: 'Click here {num} times to see photos',
              tokenAliases: {},
            },
          },
        },
      },
      {
        jsfbt: {
          m: [
            {
              token: 'num',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
          ],
          t: {
            _1: {
              desc: 'Table Desc',
              text: 'Click here 1 time to see posts',
              tokenAliases: {},
            },
            '*': {
              desc: 'Table Desc',
              text: 'Click here {num} times to see posts',
              tokenAliases: {},
            },
          },
        },
      },
      {
        jsfbt: {
          m: [
            {
              token: 'num',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
          ],
          t: {
            _1: {
              desc: 'Table Desc',
              text: 'Click here 1 time to eat photos',
              tokenAliases: {},
            },
            '*': {
              desc: 'Table Desc',
              text: 'Click here {num} times to eat photos',
              tokenAliases: {},
            },
          },
        },
      },
      {
        jsfbt: {
          m: [
            {
              token: 'num',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
          ],
          t: {
            _1: {
              desc: 'Table Desc',
              text: 'Click here 1 time to eat posts',
              tokenAliases: {},
            },
            '*': {
              desc: 'Table Desc',
              text: 'Click here {num} times to eat posts',
              tokenAliases: {},
            },
          },
        },
      },
      {
        jsfbt: {
          m: [],
          t: {
            desc: 'Text Desc 2',
            text: 'Comment',
            tokenAliases: {},
          },
        },
      },
    ],
  },
];

describe('Test removeEnumsFromPhrases', () => {
  extractEnumsAndFlattenPhrasesTestData.forEach(data =>
    it(data.name, () =>
      // $FlowFixMe[incompatible-call]
      expect(extractEnumsAndFlattenPhrases(data.input)).toEqual(data.output),
    ),
  );
});

const shiftEnumsToTopTestData: Array<{
  name: string,
  input: TableJSFBT,
  output: {
    shiftedJsfbt: TableJSFBTTree,
    enumCount: number,
  },
}> = [
  {
    name: 'text should stay the same',
    input: {
      m: [],
      t: {
        desc: '',
        text: 'Like',
        tokenAliases: {},
      },
    },
    output: {
      shiftedJsfbt: {
        desc: '',
        text: 'Like',
        tokenAliases: {},
      },
      enumCount: 0,
    },
  },
  {
    name: 'table with no enums should stay the same',
    input: {
      m: [
        {
          token: 'num',
          type: FbtVariationType.NUMBER,
          singular: true,
        },
        {
          token: 'count',
          type: FbtVariationType.NUMBER,
          singular: true,
        },
      ],
      t: {
        _1: {
          _1: {
            desc: '',
            text: 'Click 1 time to see 1 photo',
            tokenAliases: {},
          },
          '*': {
            desc: '',
            text: 'Click 1 time to see {count} photos',
            tokenAliases: {},
          },
        },
        '*': {
          _1: {
            desc: '',
            text: 'Click {num} times to see 1 photo',
            tokenAliases: {},
          },
          '*': {
            desc: '',
            text: 'Click {num} times to see {count} photos',
            tokenAliases: {},
          },
        },
      },
    },
    output: {
      shiftedJsfbt: {
        _1: {
          _1: {
            desc: '',
            text: 'Click 1 time to see 1 photo',
            tokenAliases: {},
          },
          '*': {
            desc: '',
            text: 'Click 1 time to see {count} photos',
            tokenAliases: {},
          },
        },
        '*': {
          _1: {
            desc: '',
            text: 'Click {num} times to see 1 photo',
            tokenAliases: {},
          },
          '*': {
            desc: '',
            text: 'Click {num} times to see {count} photos',
            tokenAliases: {},
          },
        },
      },
      enumCount: 0,
    },
  },
  {
    name: 'single level enum table should stay the same',
    input: {
      m: [
        {
          range: ['photos', 'groups', 'comments'],
        },
      ],
      t: {
        photos: {
          desc: '',
          text: 'Click to see photos',
          tokenAliases: {},
        },
        groups: {
          desc: '',
          text: 'Click to see groups',
          tokenAliases: {},
        },
        comments: {
          desc: '',
          text: 'Click to see comments',
          tokenAliases: {},
        },
      },
    },
    output: {
      shiftedJsfbt: {
        photos: {
          desc: '',
          text: 'Click to see photos',
          tokenAliases: {},
        },
        groups: {
          desc: '',
          text: 'Click to see groups',
          tokenAliases: {},
        },
        comments: {
          desc: '',
          text: 'Click to see comments',
          tokenAliases: {},
        },
      },
      enumCount: 1,
    },
  },
  {
    name: 'multiple level enum table should stay the same',
    input: {
      m: [
        {
          range: ['here', 'there'],
        },
        {
          range: ['photos', 'groups', 'comments'],
        },
      ],
      t: {
        here: {
          photos: {
            desc: '',
            text: 'Click here to see photos',
            tokenAliases: {},
          },
          groups: {
            desc: '',
            text: 'Click here to see groups',
            tokenAliases: {},
          },
          comments: {
            desc: '',
            text: 'Click here to see comments',
            tokenAliases: {},
          },
        },
        there: {
          photos: {
            desc: '',
            text: 'Click there to see photos',
            tokenAliases: {},
          },
          groups: {
            desc: '',
            text: 'Click there to see groups',
            tokenAliases: {},
          },
          comments: {
            desc: '',
            text: 'Click there to see comments',
            tokenAliases: {},
          },
        },
      },
    },
    output: {
      shiftedJsfbt: {
        here: {
          photos: {
            desc: '',
            text: 'Click here to see photos',
            tokenAliases: {},
          },
          groups: {
            desc: '',
            text: 'Click here to see groups',
            tokenAliases: {},
          },
          comments: {
            desc: '',
            text: 'Click here to see comments',
            tokenAliases: {},
          },
        },
        there: {
          photos: {
            desc: '',
            text: 'Click there to see photos',
            tokenAliases: {},
          },
          groups: {
            desc: '',
            text: 'Click there to see groups',
            tokenAliases: {},
          },
          comments: {
            desc: '',
            text: 'Click there to see comments',
            tokenAliases: {},
          },
        },
      },
      enumCount: 2,
    },
  },
  {
    name: 'enum level should be moved to top (one enum)',
    input: {
      m: [
        {
          token: 'num',
          type: FbtVariationType.NUMBER,
          singular: true,
        },
        {
          range: ['photos', 'posts'],
        },
      ],
      t: {
        _1: {
          photos: {
            desc: '',
            text: 'Click 1 time to see photos',
            tokenAliases: {},
          },
          posts: {
            desc: '',
            text: 'Click 1 time to see posts',
            tokenAliases: {},
          },
        },
        '*': {
          photos: {
            desc: '',
            text: 'Click {num} times to see photos',
            tokenAliases: {},
          },
          posts: {
            desc: '',
            text: 'Click {num} times to see posts',
            tokenAliases: {},
          },
        },
      },
    },
    output: {
      shiftedJsfbt: {
        photos: {
          _1: {
            desc: '',
            text: 'Click 1 time to see photos',
            tokenAliases: {},
          },
          '*': {
            desc: '',
            text: 'Click {num} times to see photos',
            tokenAliases: {},
          },
        },
        posts: {
          _1: {
            desc: '',
            text: 'Click 1 time to see posts',
            tokenAliases: {},
          },
          '*': {
            desc: '',
            text: 'Click {num} times to see posts',
            tokenAliases: {},
          },
        },
      },
      enumCount: 1,
    },
  },
  {
    name: 'enum levels should be moved to top (multiple enums)',
    input: {
      m: [
        {
          range: ['here', 'there'],
        },
        {
          token: 'num',
          type: FbtVariationType.NUMBER,
          singular: true,
        },
        {
          range: ['photos', 'posts'],
        },
      ],
      t: {
        here: {
          _1: {
            photos: {
              desc: '',
              text: 'Click here 1 time to see photos',
              tokenAliases: {},
            },
            posts: {
              desc: '',
              text: 'Click here 1 time to see posts',
              tokenAliases: {},
            },
          },
          '*': {
            photos: {
              desc: '',
              text: 'Click here {num} times to see photos',
              tokenAliases: {},
            },
            posts: {
              desc: '',
              text: 'Click here {num} times to see posts',
              tokenAliases: {},
            },
          },
        },
        there: {
          _1: {
            photos: {
              desc: '',
              text: 'Click there 1 time to see photos',
              tokenAliases: {},
            },
            posts: {
              desc: '',
              text: 'Click there 1 time to see posts',
              tokenAliases: {},
            },
          },
          '*': {
            photos: {
              desc: '',
              text: 'Click there {num} times to see photos',
              tokenAliases: {},
            },
            posts: {
              desc: '',
              text: 'Click there {num} times to see posts',
              tokenAliases: {},
            },
          },
        },
      },
    },
    output: {
      shiftedJsfbt: {
        here: {
          photos: {
            _1: {
              desc: '',
              text: 'Click here 1 time to see photos',
              tokenAliases: {},
            },
            '*': {
              desc: '',
              text: 'Click here {num} times to see photos',
              tokenAliases: {},
            },
          },
          posts: {
            _1: {
              desc: '',
              text: 'Click here 1 time to see posts',
              tokenAliases: {},
            },
            '*': {
              desc: '',
              text: 'Click here {num} times to see posts',
              tokenAliases: {},
            },
          },
        },
        there: {
          photos: {
            _1: {
              desc: '',
              text: 'Click there 1 time to see photos',
              tokenAliases: {},
            },
            '*': {
              desc: '',
              text: 'Click there {num} times to see photos',
              tokenAliases: {},
            },
          },
          posts: {
            _1: {
              desc: '',
              text: 'Click there 1 time to see posts',
              tokenAliases: {},
            },
            '*': {
              desc: '',
              text: 'Click there {num} times to see posts',
              tokenAliases: {},
            },
          },
        },
      },
      enumCount: 2,
    },
  },
  {
    name: 'enum levels should be moved to top (multiple enums at bottom)',
    input: {
      m: [
        {
          token: 'num',
          type: FbtVariationType.NUMBER,
          singular: true,
        },
        {
          range: ['see', 'eat'],
        },
        {
          range: ['photos', 'posts'],
        },
      ],
      t: {
        _1: {
          see: {
            photos: {
              desc: '',
              text: 'Click here 1 time to see photos',
              tokenAliases: {},
            },
            posts: {
              desc: '',
              text: 'Click here 1 time to see posts',
              tokenAliases: {},
            },
          },
          eat: {
            photos: {
              desc: '',
              text: 'Click here 1 time to eat photos',
              tokenAliases: {},
            },
            posts: {
              desc: '',
              text: 'Click here 1 time to eat posts',
              tokenAliases: {},
            },
          },
        },
        '*': {
          see: {
            photos: {
              desc: '',
              text: 'Click here {num} times to see photos',
              tokenAliases: {},
            },
            posts: {
              desc: '',
              text: 'Click here {num} times to see posts',
              tokenAliases: {},
            },
          },
          eat: {
            photos: {
              desc: '',
              text: 'Click here {num} times to eat photos',
              tokenAliases: {},
            },
            posts: {
              desc: '',
              text: 'Click here {num} times to eat posts',
              tokenAliases: {},
            },
          },
        },
      },
    },
    output: {
      shiftedJsfbt: {
        see: {
          photos: {
            _1: {
              desc: '',
              text: 'Click here 1 time to see photos',
              tokenAliases: {},
            },
            '*': {
              desc: '',
              text: 'Click here {num} times to see photos',
              tokenAliases: {},
            },
          },
          posts: {
            _1: {
              desc: '',
              text: 'Click here 1 time to see posts',
              tokenAliases: {},
            },
            '*': {
              desc: '',
              text: 'Click here {num} times to see posts',
              tokenAliases: {},
            },
          },
        },
        eat: {
          photos: {
            _1: {
              desc: '',
              text: 'Click here 1 time to eat photos',
              tokenAliases: {},
            },
            '*': {
              desc: '',
              text: 'Click here {num} times to eat photos',
              tokenAliases: {},
            },
          },
          posts: {
            _1: {
              desc: '',
              text: 'Click here 1 time to eat posts',
              tokenAliases: {},
            },
            '*': {
              desc: '',
              text: 'Click here {num} times to eat posts',
              tokenAliases: {},
            },
          },
        },
      },
      enumCount: 2,
    },
  },
];

describe('Test shiftEnumsToTop', () => {
  shiftEnumsToTopTestData.forEach(data =>
    it(data.name, () =>
      expect(shiftEnumsToTop(data.input)).toEqual(data.output),
    ),
  );
});
