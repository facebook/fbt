/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 */

'use strict';

const {FbtType} = require('../FbtConstants');
const {
  extractEnumsAndFlattenPhrases,
  shiftEnumsToTop,
} = require('../FbtShiftEnums');
const {FbtVariationType} = require('../translate/IntlVariations');

const extractEnumsAndFlattenPhrasesTestData = [
  {
    name: 'text and table with no enums should stay the same',
    input: [
      {type: FbtType.TEXT, jsfbt: 'Like', desc: 'Text Desc 1'},
      {
        type: FbtType.TABLE,
        jsfbt: {
          t: {
            _1: {
              _1: 'Click 1 time to see 1 photo',
              '*': 'Click 1 time to see {count} photos',
            },
            '*': {
              _1: 'Click {num} times to see 1 photo',
              '*': 'Click {num} times to see {count} photos',
            },
          },
          m: [
            {token: 'num', type: FbtVariationType.NUMBER, singular: true},
            {token: 'count', type: FbtVariationType.NUMBER, singular: true},
          ],
        },
        desc: 'Table Desc',
      },
      {type: FbtType.TEXT, jsfbt: 'Comment', desc: 'Text Desc 2'},
    ],
    output: [
      {type: FbtType.TEXT, jsfbt: 'Like', desc: 'Text Desc 1'},
      {
        type: FbtType.TABLE,
        jsfbt: {
          t: {
            _1: {
              _1: 'Click 1 time to see 1 photo',
              '*': 'Click 1 time to see {count} photos',
            },
            '*': {
              _1: 'Click {num} times to see 1 photo',
              '*': 'Click {num} times to see {count} photos',
            },
          },
          m: [
            {token: 'num', type: FbtVariationType.NUMBER, singular: true},
            {token: 'count', type: FbtVariationType.NUMBER, singular: true},
          ],
        },
        desc: 'Table Desc',
      },
      {type: FbtType.TEXT, jsfbt: 'Comment', desc: 'Text Desc 2'},
    ],
  },
  {
    name: 'single level enum table should be flattened to texts',
    input: [
      {type: FbtType.TEXT, jsfbt: 'Like', desc: 'Text Desc 1'},
      {
        type: FbtType.TABLE,
        jsfbt: {
          t: {
            photos: 'Click to see photos',
            groups: 'Click to see groups',
            comments: 'Click to see comments',
          },
          m: [{range: ['photos', 'groups', 'comments']}],
        },
        desc: 'Table Desc',
      },
      {type: FbtType.TEXT, jsfbt: 'Comment', desc: 'Text Desc 2'},
    ],
    output: [
      {type: FbtType.TEXT, jsfbt: 'Like', desc: 'Text Desc 1'},
      {type: FbtType.TEXT, jsfbt: 'Click to see photos', desc: 'Table Desc'},
      {type: FbtType.TEXT, jsfbt: 'Click to see groups', desc: 'Table Desc'},
      {type: FbtType.TEXT, jsfbt: 'Click to see comments', desc: 'Table Desc'},
      {type: FbtType.TEXT, jsfbt: 'Comment', desc: 'Text Desc 2'},
    ],
  },
  {
    name: 'multiple level enum table should be flattened to texts',
    input: [
      {type: FbtType.TEXT, jsfbt: 'Like', desc: 'Text Desc 1'},
      {
        type: FbtType.TABLE,
        jsfbt: {
          t: {
            here: {
              photos: 'Click here to see photos',
              groups: 'Click here to see groups',
              comments: 'Click here to see comments',
            },
            there: {
              photos: 'Click there to see photos',
              groups: 'Click there to see groups',
              comments: 'Click there to see comments',
            },
          },
          m: [
            {range: ['here', 'there']},
            {range: ['photos', 'groups', 'comments']},
          ],
        },
        desc: 'Table Desc',
      },
      {type: FbtType.TEXT, jsfbt: 'Comment', desc: 'Text Desc 2'},
    ],

    output: [
      {type: FbtType.TEXT, jsfbt: 'Like', desc: 'Text Desc 1'},
      {
        type: FbtType.TEXT,
        jsfbt: 'Click here to see photos',
        desc: 'Table Desc',
      },
      {
        type: FbtType.TEXT,
        jsfbt: 'Click here to see groups',
        desc: 'Table Desc',
      },
      {
        type: FbtType.TEXT,
        jsfbt: 'Click here to see comments',
        desc: 'Table Desc',
      },
      {
        type: FbtType.TEXT,
        jsfbt: 'Click there to see photos',
        desc: 'Table Desc',
      },
      {
        type: FbtType.TEXT,
        jsfbt: 'Click there to see groups',
        desc: 'Table Desc',
      },
      {
        type: FbtType.TEXT,
        jsfbt: 'Click there to see comments',
        desc: 'Table Desc',
      },
      {type: FbtType.TEXT, jsfbt: 'Comment', desc: 'Text Desc 2'},
    ],
  },
  {
    name: 'sub-tables should be extracted (one enum)',
    input: [
      {type: FbtType.TEXT, jsfbt: 'Like', desc: 'Text Desc 1'},
      {
        type: FbtType.TABLE,
        jsfbt: {
          t: {
            _1: {
              photos: 'Click 1 time to see photos',
              posts: 'Click 1 time to see posts',
            },
            '*': {
              photos: 'Click {num} times to see photos',
              posts: 'Click {num} times to see posts',
            },
          },
          m: [
            {token: 'num', type: FbtVariationType.NUMBER, singular: true},
            {range: ['photos', 'posts']},
          ],
        },
        desc: 'Table Desc',
      },
      {type: FbtType.TEXT, jsfbt: 'Comment', desc: 'Text Desc 2'},
    ],
    output: [
      {type: FbtType.TEXT, jsfbt: 'Like', desc: 'Text Desc 1'},
      {
        type: FbtType.TABLE,
        jsfbt: {
          t: {
            _1: 'Click 1 time to see photos',
            '*': 'Click {num} times to see photos',
          },
          m: [{token: 'num', type: FbtVariationType.NUMBER, singular: true}],
        },
        desc: 'Table Desc',
      },
      {
        type: FbtType.TABLE,
        jsfbt: {
          t: {
            _1: 'Click 1 time to see posts',
            '*': 'Click {num} times to see posts',
          },
          m: [{token: 'num', type: FbtVariationType.NUMBER, singular: true}],
        },
        desc: 'Table Desc',
      },
      {type: FbtType.TEXT, jsfbt: 'Comment', desc: 'Text Desc 2'},
    ],
  },
  {
    name: 'sub-tables should be extracted (multiple enums)',
    input: [
      {type: FbtType.TEXT, jsfbt: 'Like', desc: 'Text Desc 1'},
      {
        type: FbtType.TABLE,
        jsfbt: {
          t: {
            here: {
              _1: {
                photos: 'Click here 1 time to see photos',
                posts: 'Click here 1 time to see posts',
              },
              '*': {
                photos: 'Click here {num} times to see photos',
                posts: 'Click here {num} times to see posts',
              },
            },
            there: {
              _1: {
                photos: 'Click there 1 time to see photos',
                posts: 'Click there 1 time to see posts',
              },
              '*': {
                photos: 'Click there {num} times to see photos',
                posts: 'Click there {num} times to see posts',
              },
            },
          },
          m: [
            {range: ['here', 'there']},
            {token: 'num', type: FbtVariationType.NUMBER, singular: true},
            {range: ['photos', 'posts']},
          ],
        },
        desc: 'Table Desc',
      },
      {type: FbtType.TEXT, jsfbt: 'Comment', desc: 'Text Desc 2'},
    ],
    output: [
      {type: FbtType.TEXT, jsfbt: 'Like', desc: 'Text Desc 1'},
      {
        type: FbtType.TABLE,
        jsfbt: {
          t: {
            _1: 'Click here 1 time to see photos',
            '*': 'Click here {num} times to see photos',
          },
          m: [{token: 'num', type: FbtVariationType.NUMBER, singular: true}],
        },
        desc: 'Table Desc',
      },
      {
        type: FbtType.TABLE,
        jsfbt: {
          t: {
            _1: 'Click here 1 time to see posts',
            '*': 'Click here {num} times to see posts',
          },
          m: [{token: 'num', type: FbtVariationType.NUMBER, singular: true}],
        },
        desc: 'Table Desc',
      },
      {
        type: FbtType.TABLE,
        jsfbt: {
          t: {
            _1: 'Click there 1 time to see photos',
            '*': 'Click there {num} times to see photos',
          },
          m: [{token: 'num', type: FbtVariationType.NUMBER, singular: true}],
        },
        desc: 'Table Desc',
      },
      {
        type: FbtType.TABLE,
        jsfbt: {
          t: {
            _1: 'Click there 1 time to see posts',
            '*': 'Click there {num} times to see posts',
          },
          m: [{token: 'num', type: FbtVariationType.NUMBER, singular: true}],
        },
        desc: 'Table Desc',
      },
      {type: FbtType.TEXT, jsfbt: 'Comment', desc: 'Text Desc 2'},
    ],
  },
  {
    name: 'sub-tables should be extracted (multiple enums at bottom)',
    input: [
      {type: FbtType.TEXT, jsfbt: 'Like', desc: 'Text Desc 1'},
      {
        type: FbtType.TABLE,
        jsfbt: {
          t: {
            _1: {
              see: {
                photos: 'Click here 1 time to see photos',
                posts: 'Click here 1 time to see posts',
              },
              eat: {
                photos: 'Click here 1 time to eat photos',
                posts: 'Click here 1 time to eat posts',
              },
            },
            '*': {
              see: {
                photos: 'Click here {num} times to see photos',
                posts: 'Click here {num} times to see posts',
              },
              eat: {
                photos: 'Click here {num} times to eat photos',
                posts: 'Click here {num} times to eat posts',
              },
            },
          },
          m: [
            {token: 'num', type: FbtVariationType.NUMBER, singular: true},
            {range: ['see', 'eat']},
            {range: ['photos', 'posts']},
          ],
        },
        desc: 'Table Desc',
      },
      {type: FbtType.TEXT, jsfbt: 'Comment', desc: 'Text Desc 2'},
    ],
    output: [
      {type: FbtType.TEXT, jsfbt: 'Like', desc: 'Text Desc 1'},
      {
        type: FbtType.TABLE,
        jsfbt: {
          t: {
            _1: 'Click here 1 time to see photos',
            '*': 'Click here {num} times to see photos',
          },
          m: [{token: 'num', type: FbtVariationType.NUMBER, singular: true}],
        },
        desc: 'Table Desc',
      },
      {
        type: FbtType.TABLE,
        jsfbt: {
          t: {
            _1: 'Click here 1 time to see posts',
            '*': 'Click here {num} times to see posts',
          },
          m: [{token: 'num', type: FbtVariationType.NUMBER, singular: true}],
        },
        desc: 'Table Desc',
      },
      {
        type: FbtType.TABLE,
        jsfbt: {
          t: {
            _1: 'Click here 1 time to eat photos',
            '*': 'Click here {num} times to eat photos',
          },
          m: [{token: 'num', type: FbtVariationType.NUMBER, singular: true}],
        },
        desc: 'Table Desc',
      },
      {
        type: FbtType.TABLE,
        jsfbt: {
          t: {
            _1: 'Click here 1 time to eat posts',
            '*': 'Click here {num} times to eat posts',
          },
          m: [{token: 'num', type: FbtVariationType.NUMBER, singular: true}],
        },
        desc: 'Table Desc',
      },
      {type: FbtType.TEXT, jsfbt: 'Comment', desc: 'Text Desc 2'},
    ],
  },
];

describe('Test removeEnumsFromPhrases', () => {
  extractEnumsAndFlattenPhrasesTestData.forEach(data =>
    it(data.name, () =>
      expect(extractEnumsAndFlattenPhrases(data.input)).toEqual(data.output),
    ),
  );
});

const shiftEnumsToTopTestData = [
  {
    name: 'text should stay the same',
    input: 'Like',
    output: {shiftedJsfbt: 'Like', enumCount: 0},
  },
  {
    name: 'table with no enums should stay the same',
    input: {
      t: {
        _1: {
          _1: 'Click 1 time to see 1 photo',
          '*': 'Click 1 time to see {count} photos',
        },
        '*': {
          _1: 'Click {num} times to see 1 photo',
          '*': 'Click {num} times to see {count} photos',
        },
      },
      m: [
        {token: 'num', type: FbtVariationType.NUMBER, singular: true},
        {token: 'count', type: FbtVariationType.NUMBER, singular: true},
      ],
    },
    output: {
      shiftedJsfbt: {
        _1: {
          _1: 'Click 1 time to see 1 photo',
          '*': 'Click 1 time to see {count} photos',
        },
        '*': {
          _1: 'Click {num} times to see 1 photo',
          '*': 'Click {num} times to see {count} photos',
        },
      },
      enumCount: 0,
    },
  },
  {
    name: 'single level enum table should stay the same',
    input: {
      t: {
        photos: 'Click to see photos',
        groups: 'Click to see groups',
        comments: 'Click to see comments',
      },
      m: [{range: ['photos', 'groups', 'comments']}],
    },
    output: {
      shiftedJsfbt: {
        photos: 'Click to see photos',
        groups: 'Click to see groups',
        comments: 'Click to see comments',
      },
      enumCount: 1,
    },
  },
  {
    name: 'multiple level enum table should stay the same',
    input: {
      t: {
        here: {
          photos: 'Click here to see photos',
          groups: 'Click here to see groups',
          comments: 'Click here to see comments',
        },
        there: {
          photos: 'Click there to see photos',
          groups: 'Click there to see groups',
          comments: 'Click there to see comments',
        },
      },
      m: [
        {range: ['here', 'there']},
        {range: ['photos', 'groups', 'comments']},
      ],
    },
    output: {
      shiftedJsfbt: {
        here: {
          photos: 'Click here to see photos',
          groups: 'Click here to see groups',
          comments: 'Click here to see comments',
        },
        there: {
          photos: 'Click there to see photos',
          groups: 'Click there to see groups',
          comments: 'Click there to see comments',
        },
      },
      enumCount: 2,
    },
  },
  {
    name: 'enum level should be moved to top (one enum)',
    input: {
      t: {
        _1: {
          photos: 'Click 1 time to see photos',
          posts: 'Click 1 time to see posts',
        },
        '*': {
          photos: 'Click {num} times to see photos',
          posts: 'Click {num} times to see posts',
        },
      },
      m: [
        {token: 'num', type: FbtVariationType.NUMBER, singular: true},
        {range: ['photos', 'posts']},
      ],
    },
    output: {
      shiftedJsfbt: {
        photos: {
          _1: 'Click 1 time to see photos',
          '*': 'Click {num} times to see photos',
        },
        posts: {
          _1: 'Click 1 time to see posts',
          '*': 'Click {num} times to see posts',
        },
      },
      enumCount: 1,
    },
  },
  {
    name: 'enum levels should be moved to top (multiple enums)',
    input: {
      t: {
        here: {
          _1: {
            photos: 'Click here 1 time to see photos',
            posts: 'Click here 1 time to see posts',
          },
          '*': {
            photos: 'Click here {num} times to see photos',
            posts: 'Click here {num} times to see posts',
          },
        },
        there: {
          _1: {
            photos: 'Click there 1 time to see photos',
            posts: 'Click there 1 time to see posts',
          },
          '*': {
            photos: 'Click there {num} times to see photos',
            posts: 'Click there {num} times to see posts',
          },
        },
      },
      m: [
        {range: ['here', 'there']},
        {token: 'num', type: FbtVariationType.NUMBER, singular: true},
        {range: ['photos', 'posts']},
      ],
    },
    output: {
      shiftedJsfbt: {
        here: {
          photos: {
            _1: 'Click here 1 time to see photos',
            '*': 'Click here {num} times to see photos',
          },
          posts: {
            _1: 'Click here 1 time to see posts',
            '*': 'Click here {num} times to see posts',
          },
        },
        there: {
          photos: {
            _1: 'Click there 1 time to see photos',
            '*': 'Click there {num} times to see photos',
          },
          posts: {
            _1: 'Click there 1 time to see posts',
            '*': 'Click there {num} times to see posts',
          },
        },
      },
      enumCount: 2,
    },
  },
  {
    name: 'enum levels should be moved to top (multiple enums at bottom)',
    input: {
      t: {
        _1: {
          see: {
            photos: 'Click here 1 time to see photos',
            posts: 'Click here 1 time to see posts',
          },
          eat: {
            photos: 'Click here 1 time to eat photos',
            posts: 'Click here 1 time to eat posts',
          },
        },
        '*': {
          see: {
            photos: 'Click here {num} times to see photos',
            posts: 'Click here {num} times to see posts',
          },
          eat: {
            photos: 'Click here {num} times to eat photos',
            posts: 'Click here {num} times to eat posts',
          },
        },
      },
      m: [
        {token: 'num', type: FbtVariationType.NUMBER, singular: true},
        {range: ['see', 'eat']},
        {range: ['photos', 'posts']},
      ],
    },
    output: {
      shiftedJsfbt: {
        see: {
          photos: {
            _1: 'Click here 1 time to see photos',
            '*': 'Click here {num} times to see photos',
          },
          posts: {
            _1: 'Click here 1 time to see posts',
            '*': 'Click here {num} times to see posts',
          },
        },
        eat: {
          photos: {
            _1: 'Click here 1 time to eat photos',
            '*': 'Click here {num} times to eat photos',
          },
          posts: {
            _1: 'Click here 1 time to eat posts',
            '*': 'Click here {num} times to eat posts',
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
