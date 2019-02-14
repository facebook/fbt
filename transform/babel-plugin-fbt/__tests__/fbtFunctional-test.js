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

const {payload, transform} = require('../FbtTestUtil');
const {FbtVariationType} = require('../translate/IntlVariations.js');
const {TestUtil} = require('fb-babel-plugin-utils');

const testData = {
  'should convert simple strings': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = fbt("A simple string", "It\'s simple");',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'A simple string',
        desc: "It's simple",
      }) +
      ');',
  },

  'should allow description concatenation': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = fbt("A short string", "With a ridiculously long description ' +
      'that" + \n " requires concatenation");',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'A short string',
        desc:
          'With a ridiculously long description that ' +
          'requires concatenation',
      }) +
      ');',
  },

  'should maintain newlines': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = fbt(\n' +
      '  "A simple string... " +\n' +
      '  "with some other stuff.",\n' +
      '  "blah"' +
      ');\n' +
      'baz();',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'A simple string... with some other stuff.',
        desc: 'blah',
      }) +
      '\n\n\n);\nbaz();',
  },

  'should maintain newlines within arguments': {
    input:
      'const fbt = require("fbt");\n' +
      'var z = fbt("a" +\n' +
      '" b " +\n' +
      'fbt.param("name1", val1) +\n' +
      '" c " +\n' +
      '// comments\n' +
      '" d " +\n' +
      'fbt.param("name2", val2) +\n' +
      '" e ",\n' +
      '"a"\n' +
      ');',

    output:
      'const fbt = require("fbt");\n' +
      'var z = fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'a b {name1} c d {name2} e',
        desc: 'a',
      }) +
      ',[\n\nfbt._param("name1",val1),\n' +
      '\n\n\nfbt._param("name2",val2)]\n\n\n);',
  },

  'should maintain intra-argument newlines': {
    input:
      'const fbt = require("fbt");\n' +
      'var z = fbt(fbt.param("name1",\n' +
      'foo ?\n' +
      'bar :\n' +
      'qux) +\n' +
      '" blah " +\n' +
      'fbt.param("name2", qux),\n' +
      '"a"\n);',

    output:
      'const fbt = require("fbt");\n' +
      'var z = fbt._(' +
      payload({
        type: 'text',
        jsfbt: '{name1} blah {name2}',
        desc: 'a',
      }) +
      ',[fbt._param("name1",\nfoo ?\nbar :\nqux),\n\n' +
      'fbt._param("name2",qux)]\n\n);',
  },

  'should be able to nest within React nodes': {
    input:
      'const fbt = require("fbt");\n' +
      'var React = require("react");\n' +
      'var x = ' +
      '  <div>\n' +
      '    {fbt("A nested string", "nested!")}\n' +
      '  </div>;',

    output:
      'const fbt = require("fbt");\n' +
      'var React = require("react");\nvar x = React.createElement(' +
      '"div", null, \n    ' +
      'fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'A nested string',
        desc: 'nested!',
      }) +
      ')\n  );',
  },

  'should handle params': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = fbt("A parameterized message to " + ' +
      'fbt.param("personName", truthy ? ifTrue : ifFalse), ' +
      '"Moar params");',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'A parameterized message to {personName}',
        desc: 'Moar params',
      }) +
      ',[fbt._param("personName",truthy ? ifTrue : ifFalse)]);',
  },

  'should accept well-formed options': {
    input:
      'const fbt = require("fbt");\n' +
      'fbt("A string that moved files", "options!", ' +
      '{author: "jwatson", project:"Super Secret"});',

    output:
      'const fbt = require("fbt");\n' +
      'fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'A string that moved files',
        desc: 'options!',
        project: 'Super Secret',
      }) +
      ');',
  },

  'should handle enums (with array values)': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = fbt("Click to see " + ' +
      'fbt.enum("groups", ["groups", "photos", "videos"]), "enums!");',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
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
      }) +
      ',[fbt._enum("groups",{"groups":"groups","photos":"photos",' +
      '"videos":"videos"})]);',
  },

  'should handle enums (with value map)': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = fbt("Click to see " + ' +
      'fbt.enum("id1", {id1:"groups",id2:"photos",id3:"videos"}), "enums!");',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
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
      }) +
      ',[fbt._enum("id1",{"id1":"groups","id2":"photos","id3":"videos"})]);',
  },

  // TODO: T14482415 Consolidate duplicate plural/param values
  'should handle plurals': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = fbt("There " + ' +
      'fbt.plural("was ", count, {showCount: "no", many: "were "}) + ' +
      'fbt.plural("a like", count, {showCount: "ifMany", many: "likes"})' +
      ', "plurals");',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
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
      }) +
      ',[fbt._plural(count), fbt._plural(count, "number")]);',
  },

  'should handle multiple plurals with no showCount (i.e. no named params)': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = fbt("There " + ' +
      'fbt.plural("is ", count, {many: "are "}) + ' +
      'fbt.plural("a like", count, {showCount: "ifMany", many: "likes"}), "plurals");',
    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
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
      }) +
      ',[fbt._plural(count), fbt._plural(count, "number")]);',
  },

  'should throw on bad showCount value': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = fbt("There were " + ' +
      'fbt.plural("a like", count, {showCount: "badkey"}), "plurals");',
    throws: true,
  },

  'should throw on unknown options': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = fbt("There were " + ' +
      'fbt.plural("a like", count, {whatisthis: "huh?"}), "plurals");',
    throws: true,
  },

  'should handle names': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = fbt("You just friended " + ' +
      'fbt.name("name", personname, gender), "names");',
    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
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
      }) +
      ',[fbt._name("name", personname, gender)]);',
  },

  'should handle variations': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = fbt("Click to see " + ' +
      'fbt.param("count", c, {number: true}) + " links", "variations!");',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
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
      }) +
      ',[fbt._param("count",c, [0])]);',
  },

  'should insert param in place of fbt.sameParam if it exists': {
    input:
      'const fbt = require("fbt");\n' +
      'var z = fbt(fbt.param("name1", val1) + " and " +' +
      'fbt.sameParam("name1"), "d");',

    output:
      'const fbt = require("fbt");\n' +
      'var z = fbt._(' +
      payload({
        type: 'text',
        jsfbt: '{name1} and {name1}',
        desc: 'd',
      }) +
      ',[fbt._param("name1",val1)]);',
  },

  'should handle variations + same param': {
    input:
      'const fbt = require("fbt");\n' +
      'var val = 42;\n' +
      'fbt("You have " + fbt.param("count", val, {number: true}) + ' +
      '" likes. Comment on it to get more than " +  fbt.sameParam("count") + ' +
      '" likes",  "test variations + sameParam");',

    output:
      'const fbt = require("fbt");\n' +
      'var val = 42;\n' +
      'fbt._(' +
      payload({
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
      }) +
      ',[fbt._param("count",val, [0])]);',
  },

  'should get project from docblock': {
    input:
      '/** @fbt {"project": "dev"}*/\n' +
      'const fbt = require("fbt");\n' +
      'var x = fbt("Also simple string", "It\'s simple");',

    output:
      '/** @fbt {"project": "dev"}*/\n' +
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'Also simple string',
        desc: "It's simple",
        project: 'dev',
      }) +
      ');',
  },

  'should handler wrapping parens': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = fbt("foo" + "bar" + "baz" + "qux", "desc");\n' +
      'var y = fbt("foo" + ("bar" + "baz" + "qux"), "desc");\n' +
      'var z = fbt(("foo" + "bar" + "baz") + "qux", "desc");\n' +
      'var q = fbt(("foo" + "bar") + ("baz" + "qux"), "desc");\n',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'foobarbazqux',
        desc: 'desc',
      }) +
      ');\n' +
      'var y = fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'foobarbazqux',
        desc: 'desc',
      }) +
      ');\n' +
      'var z = fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'foobarbazqux',
        desc: 'desc',
      }) +
      ');\n' +
      'var q = fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'foobarbazqux',
        desc: 'desc',
      }) +
      ');\n',
  },

  'should handle enums with more text after': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = fbt("Hello, " + ' +
      'fbt.enum("groups", ["groups", "photos", "videos"]) + "!", "enums!");',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
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
      }) +
      ',[fbt._enum("groups",{"groups":"groups","photos":"photos",' +
      '"videos":"videos"})]);',
  },

  'should handle duplicate enums': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = fbt("Look! " + ' +
      'fbt.enum("groups", {groups: "Groups", photos: "Photos", videos: "Videos"}) + " and " + ' +
      'fbt.enum("groups", {groups: "groups", photos: "photos", videos: "videos"}) + "!", "enums!");',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
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
      }) +
      ',[fbt._enum("groups",{"groups":"Groups","photos":"Photos",' +
      '"videos":"Videos"})]);',
  },

  'should handle object pronoun': {
    input:
      // eslint-disable-next-line fb-www/gender-neutral-language
      // I.e. You wished her a happy birthday.
      'const fbt = require("fbt");\n' +
      'var x =' +
      '  fbt("You wished " +' +
      '    fbt.pronoun("object", gender) +' +
      '    " a happy birthday.",' +
      '    "object pronoun");',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
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
      }) +
      ',[fbt._pronoun(0,gender)]);',
  },

  'should handle subject and reflexive pronouns': {
    input:
      // eslint-disable-next-line fb-www/gender-neutral-language
      // I.e. He wished himself a happy birthday.
      'const fbt = require("fbt");\n' +
      'var x =' +
      '  fbt(fbt.pronoun("subject", gender, {capitalize:true}) +' +
      '    " wished " +' +
      '    fbt.pronoun("reflexive", gender) +' +
      '    " a happy birthday.",' +
      '    "subject+reflexive pronouns");',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
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
      }) +
      ',[fbt._pronoun(3,gender),fbt._pronoun(2,gender)]);',
  },

  'should handle possessive pronoun': {
    input:
      // eslint-disable-next-line fb-www/gender-neutral-language
      // I.e. It is her birthday.
      'const fbt = require("fbt");\n' +
      'var x =' +
      '  fbt("It is " +' +
      '    fbt.pronoun("possessive", gender) +' +
      '    " birthday.",' +
      '    "possessive pronoun");',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
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
      }) +
      ',[fbt._pronoun(1,gender)]);',
  },

  'should throw on pronoun usage not StringLiteral': {
    input:
      // Note use of variable for pronoun usage.
      'const fbt = require("fbt");\n' +
      'var u = "possessive";' +
      'var x =' +
      '  fbt("It is " +' +
      '    fbt.pronoun(u, gender) +' +
      '    " birthday.",' +
      '    "throw not StringLiteral");',

    throws: true,
  },

  'should throw on pronoun usage invalid': {
    input:
      // Note 'possession' instead of 'possessive'.
      'const fbt = require("fbt");\n' +
      'var x =' +
      '  fbt("It is " +' +
      '    fbt.pronoun("possession", gender) +' +
      '    " birthday.",' +
      '    "throw not StringLiteral");',

    throws: true,
  },

  'should maintain newlines when using templates': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = fbt(`\n' +
      '  A simple string...  \n' +
      '  with some other stuff.`,\n' +
      '  "blah"' +
      ');\n' +
      'baz();',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'A simple string... with some other stuff.',
        desc: 'blah',
      }) +
      '\n\n\n);\nbaz();',
  },

  'should handle duplicate enums in templates': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = fbt(`Look!  ' +
      '${fbt.enum("groups", {groups: "Groups", photos: "Photos", videos: "Videos"})}  and  ' +
      '${fbt.enum("groups", {groups: "groups", photos: "photos", videos: "videos"})}!`, "enums!");',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
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
      }) +
      ',[fbt._enum("groups",{"groups":"Groups","photos":"Photos",' +
      '"videos":"Videos"})]);',
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
