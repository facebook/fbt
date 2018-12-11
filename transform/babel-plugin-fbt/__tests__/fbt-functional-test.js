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
 * @nolint
 * @emails oncall+internationalization
 * @format
 */

jest.autoMockOff();

const testUtil = require('../../util/test-util');
const {payload, transform} = require('../FbtTestUtil');
const {transformSync: babelTransform} = require('@babel/core');
const assert = require('assert');

const FbtVariationType = {
  GENDER: 1,
  NUMBER: 2,
  PRONOUN: 3,
};

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
  testUtil.testSection(testData, transform));

describe('Test fbt meta-data collection', () => {
  function testFbtMetadata(expected, options = {}) {
    const fbtTransform = require('../index');
    const body = Object.keys(testData).reduce((agg, k) => {
      // Strip docblocks
      if (testData[k].throws) {
        return agg;
      }
      const input = testData[k].input;
      // Drop docblock & duplicate `const fbt = require('fbt');`
      return (
        agg +
        input
          .replace(/\/\*\*(?:\/|[^*]|\*+[^*\/])*\*+\/\n/, '')
          .split('\n')
          .slice(1)
          .join('\n')
      );
    }, "const fbt = require('fbt');\n");
    let pluginOptions = {collectFbt: true};
    pluginOptions.reactNativeMode = options.reactNativeMode || false;
    transform(body, pluginOptions);
    expected = expected.map(e => (e.filepath = undefined) || e);
    fbtTransform.getExtractedStrings().forEach((actual, idx) => {
      try {
        assert.deepEqual(actual, expected[idx]);
      } catch (e) {
        throw new Error(
          'Actual:\n' +
            JSON.stringify(actual, null, ' ') +
            '\n' +
            'Expected:\n' +
            JSON.stringify(expected[idx], null, ' ') +
            '\n',
        );
      }
    });
  }

  it('should collect correct meta data', () => {
    let expected = [
      {
        line_beg: 2,
        col_beg: 8,
        line_end: 2,
        col_end: 45,
        type: 'text',
        desc: "It's simple",
        project: '',
        jsfbt: 'A simple string',
      },
      {
        line_beg: 2,
        col_beg: 54,
        line_end: 3,
        col_end: 27,
        type: 'text',
        desc:
          'With a ridiculously long description that requires concatenation',
        project: '',
        jsfbt: 'A short string',
      },
      {
        line_beg: 3,
        col_beg: 36,
        line_end: 6,
        col_end: 9,
        type: 'text',
        desc: 'blah',
        project: '',
        jsfbt: 'A simple string... with some other stuff.',
      },
      {
        line_beg: 7,
        col_beg: 14,
        line_end: 16,
        col_end: 1,
        type: 'text',
        desc: 'a',
        project: '',
        jsfbt: 'a b {name1} c d {name2} e',
      },
      {
        line_beg: 16,
        col_beg: 10,
        line_end: 23,
        col_end: 1,
        type: 'text',
        desc: 'a',
        project: '',
        jsfbt: '{name1} blah {name2}',
      },
      {
        line_beg: 25,
        col_beg: 5,
        line_end: 25,
        col_end: 38,
        type: 'text',
        desc: 'nested!',
        project: '',
        jsfbt: 'A nested string',
      },
      {
        line_beg: 26,
        col_beg: 17,
        line_end: 26,
        col_end: 119,
        type: 'text',
        desc: 'Moar params',
        project: '',
        jsfbt: 'A parameterized message to {personName}',
      },
      {
        line_beg: 26,
        col_beg: 120,
        line_end: 26,
        col_end: 209,
        type: 'text',
        desc: 'options!',
        project: 'Super Secret',
        author: 'jwatson',
        jsfbt: 'A string that moved files',
      },
      {
        line_beg: 26,
        col_beg: 218,
        line_end: 26,
        col_end: 301,
        type: 'table',
        desc: 'enums!',
        project: '',
        jsfbt: {
          t: {
            groups: 'Click to see groups',
            photos: 'Click to see photos',
            videos: 'Click to see videos',
          },
          m: [null],
        },
      },
      {
        line_beg: 26,
        col_beg: 310,
        line_end: 26,
        col_end: 400,
        type: 'table',
        desc: 'enums!',
        project: '',
        jsfbt: {
          t: {
            id1: 'Click to see groups',
            id2: 'Click to see photos',
            id3: 'Click to see videos',
          },
          m: [null],
        },
      },
      {
        line_beg: 26,
        col_beg: 409,
        line_end: 26,
        col_end: 563,
        type: 'table',
        desc: 'plurals',
        project: '',
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
      },
      {
        line_beg: 26,
        col_beg: 572,
        line_end: 26,
        col_end: 707,
        type: 'table',
        desc: 'plurals',
        project: '',
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
      },
      {
        line_beg: 26,
        col_beg: 716,
        line_end: 26,
        col_end: 789,
        type: 'table',
        desc: 'names',
        project: '',
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
      },
      {
        line_beg: 26,
        col_beg: 798,
        line_end: 26,
        col_end: 884,
        type: 'table',
        desc: 'variations!',
        project: '',
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
      },
      {
        line_beg: 26,
        col_beg: 893,
        line_end: 26,
        col_end: 961,
        type: 'text',
        desc: 'd',
        project: '',
        jsfbt: '{name1} and {name1}',
      },
      {
        line_beg: 27,
        col_beg: 0,
        line_end: 27,
        col_end: 171,
        type: 'table',
        desc: 'test variations + sameParam',
        project: '',
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
      },
      {
        line_beg: 27,
        col_beg: 180,
        line_end: 27,
        col_end: 220,
        type: 'text',
        desc: "It's simple",
        project: '',
        jsfbt: 'Also simple string',
      },
      {
        line_beg: 27,
        col_beg: 229,
        line_end: 27,
        col_end: 271,
        type: 'text',
        desc: 'desc',
        project: '',
        jsfbt: 'foobarbazqux',
      },
      {
        line_beg: 28,
        col_beg: 8,
        line_end: 28,
        col_end: 52,
        type: 'text',
        desc: 'desc',
        project: '',
        jsfbt: 'foobarbazqux',
      },
      {
        line_beg: 29,
        col_beg: 8,
        line_end: 29,
        col_end: 52,
        type: 'text',
        desc: 'desc',
        project: '',
        jsfbt: 'foobarbazqux',
      },
      {
        line_beg: 30,
        col_beg: 8,
        line_end: 30,
        col_end: 54,
        type: 'text',
        desc: 'desc',
        project: '',
        jsfbt: 'foobarbazqux',
      },
      {
        line_beg: 31,
        col_beg: 8,
        line_end: 31,
        col_end: 91,
        type: 'table',
        desc: 'enums!',
        project: '',
        jsfbt: {
          t: {
            groups: 'Hello, groups!',
            photos: 'Hello, photos!',
            videos: 'Hello, videos!',
          },
          m: [null],
        },
      },
      {
        line_beg: 31,
        col_beg: 100,
        line_end: 31,
        col_end: 293,
        type: 'table',
        desc: 'enums!',
        project: '',
        jsfbt: {
          t: {
            groups: 'Look! Groups and groups!',
            photos: 'Look! Photos and photos!',
            videos: 'Look! Videos and videos!',
          },
          m: [null],
        },
      },
      {
        line_beg: 31,
        col_beg: 303,
        line_end: 31,
        col_end: 403,
        type: 'table',
        desc: 'object pronoun',
        project: '',
        jsfbt: {
          t: {
            '1': 'You wished her a happy birthday.',
            '2': 'You wished him a happy birthday.',
            '*': 'You wished them a happy birthday.',
          },
          m: [null],
        },
      },
      {
        line_beg: 31,
        col_beg: 413,
        line_end: 31,
        col_end: 580,
        type: 'table',
        desc: 'subject+reflexive pronouns',
        project: '',
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
      },
      {
        line_beg: 31,
        col_beg: 590,
        line_end: 31,
        col_end: 685,
        type: 'table',
        desc: 'possessive pronoun',
        project: '',
        jsfbt: {
          t: {
            '1': 'It is her birthday.',
            '2': 'It is his birthday.',
            '*': 'It is their birthday.',
          },
          m: [null],
        },
      },
      {
        line_beg: 31,
        col_beg: 694,
        line_end: 34,
        col_end: 9,
        type: 'text',
        desc: 'blah',
        project: '',
        jsfbt: 'A simple string... with some other stuff.',
      },
      {
        line_beg: 35,
        col_beg: 14,
        line_end: 35,
        col_end: 200,
        type: 'table',
        desc: 'enums!',
        project: '',
        jsfbt: {
          t: {
            groups: 'Look! Groups and groups!',
            photos: 'Look! Photos and photos!',
            videos: 'Look! Videos and videos!',
          },
          m: [null],
        },
      },
    ];
    testFbtMetadata(expected);
  });

  it('should collect correct meta data (react native)', () => {
    let expected = [
      {
        line_beg: 2,
        col_beg: 8,
        line_end: 2,
        col_end: 45,
        type: 'text',
        desc: "It's simple",
        project: '',
        jsfbt: 'A simple string',
      },
      {
        line_beg: 2,
        col_beg: 54,
        line_end: 3,
        col_end: 27,
        type: 'text',
        desc:
          'With a ridiculously long description that requires concatenation',
        project: '',
        jsfbt: 'A short string',
      },
      {
        line_beg: 3,
        col_beg: 36,
        line_end: 6,
        col_end: 9,
        type: 'text',
        desc: 'blah',
        project: '',
        jsfbt: 'A simple string... with some other stuff.',
      },
      {
        line_beg: 7,
        col_beg: 14,
        line_end: 16,
        col_end: 1,
        type: 'text',
        desc: 'a',
        project: '',
        jsfbt: 'a b {name1} c d {name2} e',
      },
      {
        line_beg: 16,
        col_beg: 10,
        line_end: 23,
        col_end: 1,
        type: 'text',
        desc: 'a',
        project: '',
        jsfbt: '{name1} blah {name2}',
      },
      {
        line_beg: 25,
        col_beg: 5,
        line_end: 25,
        col_end: 38,
        type: 'text',
        desc: 'nested!',
        project: '',
        jsfbt: 'A nested string',
      },
      {
        line_beg: 26,
        col_beg: 17,
        line_end: 26,
        col_end: 119,
        type: 'text',
        desc: 'Moar params',
        project: '',
        jsfbt: 'A parameterized message to {personName}',
      },
      {
        line_beg: 26,
        col_beg: 120,
        line_end: 26,
        col_end: 209,
        type: 'text',
        desc: 'options!',
        project: 'Super Secret',
        author: 'jwatson',
        jsfbt: 'A string that moved files',
      },
      {
        line_beg: 26,
        col_beg: 218,
        line_end: 26,
        col_end: 301,
        type: 'table',
        desc: 'enums!',
        project: '',
        jsfbt: {
          t: {
            groups: 'Click to see groups',
            photos: 'Click to see photos',
            videos: 'Click to see videos',
          },
          m: [
            {
              range: ['groups', 'photos', 'videos'],
            },
          ],
        },
      },
      {
        line_beg: 26,
        col_beg: 310,
        line_end: 26,
        col_end: 400,
        type: 'table',
        desc: 'enums!',
        project: '',
        jsfbt: {
          t: {
            id1: 'Click to see groups',
            id2: 'Click to see photos',
            id3: 'Click to see videos',
          },
          m: [
            {
              range: ['id1', 'id2', 'id3'],
            },
          ],
        },
      },
      {
        line_beg: 26,
        col_beg: 409,
        line_end: 26,
        col_end: 563,
        type: 'table',
        desc: 'plurals',
        project: '',
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
            {
              type: FbtVariationType.NUMBER,
            },
            {
              token: 'number',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
          ],
        },
      },
      {
        line_beg: 26,
        col_beg: 572,
        line_end: 26,
        col_end: 707,
        type: 'table',
        desc: 'plurals',
        project: '',
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
            {
              type: FbtVariationType.NUMBER,
            },
            {
              token: 'number',
              type: FbtVariationType.NUMBER,
              singular: true,
            },
          ],
        },
      },
      {
        line_beg: 26,
        col_beg: 716,
        line_end: 26,
        col_end: 789,
        type: 'table',
        desc: 'names',
        project: '',
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
      },
      {
        line_beg: 26,
        col_beg: 798,
        line_end: 26,
        col_end: 884,
        type: 'table',
        desc: 'variations!',
        project: '',
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
      },
      {
        line_beg: 26,
        col_beg: 893,
        line_end: 26,
        col_end: 961,
        type: 'text',
        desc: 'd',
        project: '',
        jsfbt: '{name1} and {name1}',
      },
      {
        line_beg: 27,
        col_beg: 0,
        line_end: 27,
        col_end: 171,
        type: 'table',
        desc: 'test variations + sameParam',
        project: '',
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
      },
      {
        line_beg: 27,
        col_beg: 180,
        line_end: 27,
        col_end: 220,
        type: 'text',
        desc: "It's simple",
        project: '',
        jsfbt: 'Also simple string',
      },
      {
        line_beg: 27,
        col_beg: 229,
        line_end: 27,
        col_end: 271,
        type: 'text',
        desc: 'desc',
        project: '',
        jsfbt: 'foobarbazqux',
      },
      {
        line_beg: 28,
        col_beg: 8,
        line_end: 28,
        col_end: 52,
        type: 'text',
        desc: 'desc',
        project: '',
        jsfbt: 'foobarbazqux',
      },
      {
        line_beg: 29,
        col_beg: 8,
        line_end: 29,
        col_end: 52,
        type: 'text',
        desc: 'desc',
        project: '',
        jsfbt: 'foobarbazqux',
      },
      {
        line_beg: 30,
        col_beg: 8,
        line_end: 30,
        col_end: 54,
        type: 'text',
        desc: 'desc',
        project: '',
        jsfbt: 'foobarbazqux',
      },
      {
        line_beg: 31,
        col_beg: 8,
        line_end: 31,
        col_end: 91,
        type: 'table',
        desc: 'enums!',
        project: '',
        jsfbt: {
          t: {
            groups: 'Hello, groups!',
            photos: 'Hello, photos!',
            videos: 'Hello, videos!',
          },
          m: [
            {
              range: ['groups', 'photos', 'videos'],
            },
          ],
        },
      },
      {
        line_beg: 31,
        col_beg: 100,
        line_end: 31,
        col_end: 293,
        type: 'table',
        desc: 'enums!',
        project: '',
        jsfbt: {
          t: {
            groups: 'Look! Groups and groups!',
            photos: 'Look! Photos and photos!',
            videos: 'Look! Videos and videos!',
          },
          m: [
            {
              range: ['groups', 'photos', 'videos'],
            },
          ],
        },
      },
      {
        line_beg: 31,
        col_beg: 303,
        line_end: 31,
        col_end: 403,
        type: 'table',
        desc: 'object pronoun',
        project: '',
        jsfbt: {
          t: {
            '1': 'You wished her a happy birthday.',
            '2': 'You wished him a happy birthday.',
            '*': 'You wished them a happy birthday.',
          },
          m: [
            {
              type: FbtVariationType.PRONOUN,
            },
          ],
        },
      },
      {
        line_beg: 31,
        col_beg: 413,
        line_end: 31,
        col_end: 580,
        type: 'table',
        desc: 'subject+reflexive pronouns',
        project: '',
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
          m: [
            {
              type: FbtVariationType.PRONOUN,
            },
            {
              type: FbtVariationType.PRONOUN,
            },
          ],
        },
      },
      {
        line_beg: 31,
        col_beg: 590,
        line_end: 31,
        col_end: 685,
        type: 'table',
        desc: 'possessive pronoun',
        project: '',
        jsfbt: {
          t: {
            '1': 'It is her birthday.',
            '2': 'It is his birthday.',
            '*': 'It is their birthday.',
          },
          m: [
            {
              type: FbtVariationType.PRONOUN,
            },
          ],
        },
      },
      {
        line_beg: 31,
        col_beg: 694,
        line_end: 34,
        col_end: 9,
        type: 'text',
        desc: 'blah',
        project: '',
        jsfbt: 'A simple string... with some other stuff.',
      },
      {
        line_beg: 35,
        col_beg: 14,
        line_end: 35,
        col_end: 200,
        type: 'table',
        desc: 'enums!',
        project: '',
        jsfbt: {
          t: {
            groups: 'Look! Groups and groups!',
            photos: 'Look! Photos and photos!',
            videos: 'Look! Videos and videos!',
          },
          m: [
            {
              range: ['groups', 'photos', 'videos'],
            },
          ],
        },
      },
    ];
    testFbtMetadata(expected, {reactNativeMode: true});
  });
});
