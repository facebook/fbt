/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p babel_plugin_fbt --remote localhost:~/www
 *
 * @emails oncall+internationalization
 * @format
 */

jest.autoMockOff();

const {payload, transform, withFbtRequireStatement} = require('../FbtTestUtil');
const {FbtVariationType} = require('../translate/IntlVariations.js');
const {TestUtil} = require('fb-babel-plugin-utils');

const testData = {
  'should convert simple strings': {
    input: withFbtRequireStatement(
      `var x = fbt('A simple string', "It's simple");`,
    ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'A simple string',
          desc: "It's simple",
        })},
      );`,
    ),
  },

  'should allow description concatenation': {
    input: withFbtRequireStatement(
      `var x = fbt(
        'A short string',
        'With a ridiculously long description that' +
          ' requires concatenation',
      );`,
    ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'A short string',
          desc:
            'With a ridiculously long description that requires concatenation',
        })},
      );`,
    ),
  },

  'should maintain newlines': {
    input: withFbtRequireStatement(
      `var x = fbt('A simple string... ' + 'with some other stuff.', 'blah');
      baz();`,
    ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'A simple string... with some other stuff.',
          desc: 'blah',
        })},
      );
      baz();`,
    ),
  },

  // Initially needed for JS source maps accuracy
  'should maintain newlines within arguments': {
    input: withFbtRequireStatement(
      `var z = fbt(
        'a' +
          ' b ' +
          fbt.param('name1', val1) +
          ' c ' +
          // comments
          ' d ' +
          fbt.param('name2', val2) +
          ' e ',
        'a',
      );`,
    ),

    output: withFbtRequireStatement(
      `var z = fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'a b {name1} c d {name2} e',
          desc: 'a',
        })},
        [fbt._param('name1', val1), fbt._param('name2', val2)],
      );`,
    ),
  },

  // Initially needed for JS source maps accuracy
  'should maintain intra-argument newlines': {
    input: withFbtRequireStatement(
      `var z = fbt(
        fbt.param(
          'name1',
          foo ? (
            <a>
              bar
            </a>
          ) : (
            qux
          ),
        ) +
          ' blah ' +
          fbt.param('name2', qux),
        'a',
      );`,
    ),

    output: withFbtRequireStatement(
      `var z = fbt._(
        ${payload({
          type: 'text',
          jsfbt: '{name1} blah {name2}',
          desc: 'a',
        })},
        [
          fbt._param(
            'name1',
            foo
              ? React.createElement(
                  "a",
                  null,
                  "bar",
                )
              : qux,
          ),
          fbt._param('name2', qux),
        ],
      );`,
    ),
  },

  'should be able to nest within React nodes': {
    input: withFbtRequireStatement(
      `var React = require('react');
      var x = <div>{fbt('A nested string', 'nested!')}</div>;`,
    ),

    output: withFbtRequireStatement(
      `var React = require('react');
      var x = React.createElement(
        'div',
        null,
        fbt._(
          ${payload({
            type: 'text',
            jsfbt: 'A nested string',
            desc: 'nested!',
          })},
        ),
      );`,
    ),
  },

  'should handle params': {
    input: withFbtRequireStatement(
      `var x = fbt(
        'A parameterized message to ' +
          fbt.param('personName', truthy ? ifTrue : ifFalse),
        'Moar params',
      );`,
    ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'A parameterized message to {personName}',
          desc: 'Moar params',
        })},
        [fbt._param('personName', truthy ? ifTrue : ifFalse)],
      );`,
    ),
  },

  'should accept well-formed options': {
    input: withFbtRequireStatement(
      `fbt('A string that moved files', 'options!', {
          author: 'jwatson',
          project: 'Super Secret',
        });`,
    ),

    output: withFbtRequireStatement(
      `fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'A string that moved files',
          desc: 'options!',
          project: 'Super Secret',
        })},
      );`,
    ),
  },

  'should handle enums (with array values)': {
    input: withFbtRequireStatement(
      `var x = fbt(
        'Click to see ' + fbt.enum('groups', ['groups', 'photos', 'videos']),
        'enums!',
      );`,
    ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'table',
          jsfbt: {
            t: {
              groups: 'Click to see groups',
              photos: 'Click to see photos',
              videos: 'Click to see videos',
            },
            m: [null],
          },
          desc: 'enums!',
        })},
        [
          fbt._enum('groups', {
            "groups": 'groups',
            "photos": 'photos',
            "videos": 'videos',
          }),
        ],
      );`,
    ),
  },

  'should handle enums (with value map)': {
    input: withFbtRequireStatement(
      `var x = fbt(
        'Click to see ' +
          fbt.enum('id1', {id1: 'groups', id2: 'photos', id3: 'videos'}),
        'enums!',
      );`,
    ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'table',
          jsfbt: {
            t: {
              id1: 'Click to see groups',
              id2: 'Click to see photos',
              id3: 'Click to see videos',
            },
            m: [null],
          },
          desc: 'enums!',
        })},
        [
          fbt._enum('id1', {
            "id1": 'groups',
            "id2": 'photos',
            "id3": 'videos'
          })
        ],
      );`,
    ),
  },

  // TODO: T14482415 Consolidate duplicate plural/param values
  'should handle plurals': {
    input: withFbtRequireStatement(
      `var x = fbt(
        'There ' +
          fbt.plural('was ', count, {showCount: 'no', many: 'were '}) +
          fbt.plural('a like', count, {showCount: 'ifMany', many: 'likes'}),
        'plurals',
      );`,
    ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'table',
          jsfbt: {
            t: {
              '*': {
                '*': 'There were {number} likes',
                _1: 'There were a like',
              },
              _1: {
                '*': 'There was {number} likes',
                _1: 'There was a like',
              },
            },
            m: [
              null,
              {
                token: 'number',
                type: FbtVariationType.NUMBER,
                singular: true,
              },
            ],
          },
          desc: 'plurals',
        })},
        [fbt._plural(count), fbt._plural(count, 'number')],
      );`,
    ),
  },

  'should handle multiple plurals with no showCount (i.e. no named params)': {
    input: withFbtRequireStatement(
      `var x = fbt(
        'There ' +
          fbt.plural('is ', count, {many: 'are '}) +
          fbt.plural('a like', count, {showCount: 'ifMany', many: 'likes'}),
        'plurals',
      );`,
    ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'table',
          jsfbt: {
            t: {
              '*': {
                '*': 'There are {number} likes',
                _1: 'There are a like',
              },
              _1: {
                '*': 'There is {number} likes',
                _1: 'There is a like',
              },
            },
            m: [
              null,
              {
                token: 'number',
                type: FbtVariationType.NUMBER,
                singular: true,
              },
            ],
          },
          desc: 'plurals',
        })},
        [fbt._plural(count), fbt._plural(count, 'number')],
      );`,
    ),
  },

  'should throw on bad showCount value': {
    input: withFbtRequireStatement(
      `var x = fbt(
        'There were ' + fbt.plural('a like', count, {showCount: 'badkey'}),
        'plurals',
      );`,
    ),
    throws: true,
  },

  'should throw on unknown options': {
    input: withFbtRequireStatement(
      `var x = fbt(
        'There were ' + fbt.plural('a like', count, {whatisthis: 'huh?'}),
        'plurals',
      );`,
    ),
    throws: true,
  },

  'should handle names': {
    input: withFbtRequireStatement(
      `var x = fbt(
        'You just friended ' + fbt.name('name', personname, gender),
        'names',
      );`,
    ),
    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'table',
          jsfbt: {
            t: {
              '*': 'You just friended {name}',
            },
            m: [
              {
                token: 'name',
                type: FbtVariationType.GENDER,
              },
            ],
          },
          desc: 'names',
        })},
        [fbt._name('name', personname, gender)],
      );`,
    ),
  },

  'should handle variations': {
    input: withFbtRequireStatement(
      `var x = fbt(
        'Click to see ' + fbt.param('count', c, {number: true}) + ' links',
        'variations!',
      );`,
    ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'table',
          jsfbt: {
            t: {
              '*': 'Click to see {count} links',
            },
            m: [
              {
                token: 'count',
                type: FbtVariationType.NUMBER,
              },
            ],
          },
          desc: 'variations!',
        })},
        [fbt._param('count', c, [0])],
      );`,
    ),
  },

  'should insert param in place of fbt.sameParam if it exists': {
    input: withFbtRequireStatement(
      `var z = fbt(
        fbt.param('name1', val1) + ' and ' + fbt.sameParam('name1'),
        'd',
      );`,
    ),

    output: withFbtRequireStatement(
      `var z = fbt._(
        ${payload({
          type: 'text',
          jsfbt: '{name1} and {name1}',
          desc: 'd',
        })},
        [fbt._param('name1', val1)],
      );`,
    ),
  },

  'should handle variations + same param': {
    input: withFbtRequireStatement(
      `var val = 42;
      fbt(
        'You have ' +
          fbt.param('count', val, {number: true}) +
          ' likes. Comment on it to get more than ' +
          fbt.sameParam('count') +
          ' likes',
        'test variations + sameParam',
      );`,
    ),

    output: withFbtRequireStatement(
      `var val = 42;
      fbt._(
        ${payload({
          type: 'table',
          jsfbt: {
            t: {
              '*':
                'You have {count} likes. Comment on it to get more than {count} likes',
            },
            m: [
              {
                token: 'count',
                type: FbtVariationType.NUMBER,
              },
            ],
          },
          desc: 'test variations + sameParam',
        })},
        [fbt._param('count', val, [0])],
      );`,
    ),
  },

  'should get project from docblock': {
    input: `/** @fbt {"project": "dev"}*/
      ${withFbtRequireStatement(
        `var x = fbt('Also simple string', "It's simple");`,
      )}`,

    output: `/** @fbt {"project": "dev"}*/
      ${withFbtRequireStatement(
        `var x = fbt._(
          ${payload({
            type: 'text',
            jsfbt: 'Also simple string',
            desc: "It's simple",
            project: 'dev',
          })},
        );`,
      )}`,
  },

  'should handler wrapping parens': {
    input: withFbtRequireStatement(
      `var x = fbt('foo' + 'bar' + 'baz' + 'qux', 'desc');
      var y = fbt('foo' + ('bar' + 'baz' + 'qux'), 'desc');
      var z = fbt('foo' + 'bar' + 'baz' + 'qux', 'desc');
      var q = fbt('foo' + 'bar' + ('baz' + 'qux'), 'desc');`,
    ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'foobarbazqux',
          desc: 'desc',
        })},
      );
      var y = fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'foobarbazqux',
          desc: 'desc',
        })},
      );
      var z = fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'foobarbazqux',
          desc: 'desc',
        })},
      );
      var q = fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'foobarbazqux',
          desc: 'desc',
        })},
      );`,
    ),
  },

  'should handle enums with more text after': {
    input: withFbtRequireStatement(
      `var x = fbt(
        'Hello, ' + fbt.enum('groups', ['groups', 'photos', 'videos']) + '!',
        'enums!',
      );`,
    ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'table',
          jsfbt: {
            t: {
              groups: 'Hello, groups!',
              photos: 'Hello, photos!',
              videos: 'Hello, videos!',
            },
            m: [null],
          },
          desc: 'enums!',
        })},
        [
          fbt._enum('groups', {
            "groups": 'groups',
            "photos": 'photos',
            "videos": 'videos',
          }),
        ],
      );`,
    ),
  },

  'should handle duplicate enums': {
    input: withFbtRequireStatement(
      `var x = fbt(
        'Look! ' +
          fbt.enum('groups', {
            groups: 'Groups',
            photos: 'Photos',
            videos: 'Videos',
          }) +
          ' and ' +
          fbt.enum('groups', {
            groups: 'groups',
            photos: 'photos',
            videos: 'videos',
          }) +
          '!',
        'enums!',
      );`,
    ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'table',
          jsfbt: {
            t: {
              groups: 'Look! Groups and groups!',
              photos: 'Look! Photos and photos!',
              videos: 'Look! Videos and videos!',
            },
            m: [null],
          },
          desc: 'enums!',
        })},
        [
          fbt._enum('groups', {
            "groups": 'Groups',
            "photos": 'Photos',
            "videos": 'Videos',
          }),
        ],
      );`,
    ),
  },

  'should handle object pronoun': {
    input:
      // eslint-disable-next-line fb-www/gender-neutral-language
      // I.e. You wished her a happy birthday.
      withFbtRequireStatement(
        `var x = fbt(
          'You wished ' +
            fbt.pronoun('object', gender) +
            ' a happy birthday.',
          'object pronoun',
        );`,
      ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'table',
          jsfbt: {
            t: {
              '1': 'You wished her a happy birthday.',
              '2': 'You wished him a happy birthday.',
              '*': 'You wished them a happy birthday.',
            },
            m: [null],
          },
          desc: 'object pronoun',
        })},
        [fbt._pronoun(0, gender)],
      );`,
    ),
  },

  'should handle subject and reflexive pronouns': {
    input:
      // eslint-disable-next-line fb-www/gender-neutral-language
      // I.e. He wished himself a happy birthday.
      withFbtRequireStatement(
        `var x = fbt(
          fbt.pronoun('subject', gender, {capitalize: true}) +
            ' wished ' +
            fbt.pronoun('reflexive', gender) +
            ' a happy birthday.',
          'subject+reflexive pronouns',
        );`,
      ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'table',
          jsfbt: {
            t: {
              '1': {
                '0': 'She wished themself a happy birthday.',
                '1': 'She wished herself a happy birthday.',
                '2': 'She wished himself a happy birthday.',
                '*': 'She wished themselves a happy birthday.',
              },
              '2': {
                '0': 'He wished themself a happy birthday.',
                '1': 'He wished herself a happy birthday.',
                '2': 'He wished himself a happy birthday.',
                '*': 'He wished themselves a happy birthday.',
              },
              '*': {
                '0': 'They wished themself a happy birthday.',
                '1': 'They wished herself a happy birthday.',
                '2': 'They wished himself a happy birthday.',
                '*': 'They wished themselves a happy birthday.',
              },
            },
            m: [null, null],
          },
          desc: 'subject+reflexive pronouns',
        })},
        [fbt._pronoun(3, gender), fbt._pronoun(2, gender)],
      );`,
    ),
  },

  'should handle possessive pronoun': {
    input:
      // eslint-disable-next-line fb-www/gender-neutral-language
      // I.e. It is her birthday.
      withFbtRequireStatement(
        `var x = fbt(
          'It is ' + fbt.pronoun('possessive', gender) + ' birthday.',
          'possessive pronoun',
        );`,
      ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'table',
          jsfbt: {
            t: {
              '1': 'It is her birthday.',
              '2': 'It is his birthday.',
              '*': 'It is their birthday.',
            },
            m: [null],
          },
          desc: 'possessive pronoun',
        })},
        [fbt._pronoun(1, gender)],
      );`,
    ),
  },

  'should throw on pronoun usage not StringLiteral': {
    input:
      // Note use of variable for pronoun usage.
      withFbtRequireStatement(
        `var u = 'possessive';
        var x = fbt(
          'It is ' + fbt.pronoun(u, gender) + ' birthday.',
          'throw not StringLiteral',
        );`,
      ),

    throws: true,
  },

  'should throw on pronoun usage invalid': {
    input:
      // Note 'possession' instead of 'possessive'.
      withFbtRequireStatement(
        `var x = fbt(
          'It is ' + fbt.pronoun('possession', gender) + ' birthday.',
          'throw not StringLiteral',
        );`,
      ),

    throws: true,
  },
  // Initially needed for JS source maps accuracy
  // This is useful only for testing column/line coordinates
  // Newlines are not preserved in the extracted fbt string
  'should maintain newlines when using string templates': {
    input: withFbtRequireStatement(
      `var x = fbt(
          \`A simple string...
with some other stuff.\`,
          'blah',
        );
        baz();`,
    ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'A simple string... with some other stuff.',
          desc: 'blah',
        })},
      );
      baz();`,
    ),
  },

  'should deduplicate branches when fbt.enum() calls share the same key in string templates': {
    input: withFbtRequireStatement(
      `var x = fbt(
        \`Look!  \${fbt.enum('groups', {
          groups: 'Groups',
          photos: 'Photos',
          videos: 'Videos',
        })}  and  \${fbt.enum('groups', {
        "groups": 'groups',
        "photos": 'photos',
        "videos": 'videos',
      })}!\`,
        'enums!',
      );`,
    ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'table',
          jsfbt: {
            t: {
              groups: 'Look! Groups and groups!',
              photos: 'Look! Photos and photos!',
              videos: 'Look! Videos and videos!',
            },
            m: [null],
          },
          desc: 'enums!',
        })},
        [
          fbt._enum('groups', {
            "groups": 'Groups',
            "photos": 'Photos',
            "videos": 'Videos',
          }),
        ],
      );`,
    ),
  },
};

describe('Test functional fbt syntax translation', () =>
  TestUtil.testSection(testData, transform));

describe('Test fbt meta-data collection', () => {
  const fbtTransform = require('../index');

  function testFbtMetadata(options = {}) {
    for (const title in testData) {
      defineSingleTest(title, testData[title], options);
    }
  }

  function defineSingleTest(title, singleTestData, options) {
    // Skip scenarios that test an error
    if (singleTestData.throws) {
      return;
    }

    it(`for scenario "${title}"`, () => {
      // Drop docblock
      const cleanedCode = singleTestData.input.replace(
        /\/\*\*(?:\/|[^*]|\*+[^*\/])*\*+\/\n/,
        '',
      );

      const pluginOptions = {
        collectFbt: true,
        reactNativeMode: options.reactNativeMode || false,
      };
      transform(cleanedCode, pluginOptions);
      expect(fbtTransform.getExtractedStrings()).toMatchSnapshot();
    });
  }

  describe('should collect correct meta data', () => {
    testFbtMetadata();
  });

  describe('should collect correct meta data (react native)', () => {
    testFbtMetadata({reactNativeMode: true});
  });
});
