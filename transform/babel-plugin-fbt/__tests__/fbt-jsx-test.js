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

const FbtVariationType = {
  GENDER: 1,
  NUMBER: 2,
  PRONOUN: 3,
};

const testData = {
  'should convert simple strings': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = <fbt desc="It\'s simple">A simple string</fbt>;',

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

  'should filter comment and empty expressions from children': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = <fbt desc="It\'s simple">{\n}A sim{/*\nignore\n\nme\n*/}ple s{ }tri{}ng{/*ignore me*/}</fbt>;',

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

  'should strip out newlines': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = ' +
      '<fbt desc="Test trailing space when not last child">\n' +
      '  Preamble ' +
      '  <fbt:param name="parm">{blah}</fbt:param>\n' +
      '</fbt>;\n' +
      'baz();',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'Preamble {parm}',
        desc: 'Test trailing space when not last child',
      }) +
      ',[\nfbt._param("parm",blah)]\n);\nbaz();',
  },

  'should strip out newlines in Reactish <Fbt>': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = ' +
      '<Fbt desc="Test trailing space when not last child">\n' +
      '  Preamble ' +
      '  <FbtParam name="parm">{blah}</FbtParam>\n' +
      '</Fbt>;\n' +
      'baz();',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'Preamble {parm}',
        desc: 'Test trailing space when not last child',
      }) +
      ',[\nfbt._param("parm",blah)]\n);\nbaz();',
  },

  'should strip out more newlines': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = ' +
      '<fbt desc="moar lines">\n' +
      '  A simple string...\n' +
      '  with some other stuff.\n' +
      '</fbt>;\n' +
      'baz();',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'A simple string... with some other stuff.',
        desc: 'moar lines',
      }) +
      ');\nbaz();',
  },

  'Squelch whitespace when in an expression': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = ' +
      '<fbt desc="squelched">\n' +
      '  {"Squelched white space... "}\n' +
      '  with some\n' +
      ' {` other stuff.`}\n' +
      '</fbt>;\n' +
      'baz();',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'Squelched white space... with some other stuff.',
        desc: 'squelched',
      }) +
      '\n\n\n);\nbaz();',
  },

  'Enable explicit whitespace': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = ' +
      '<fbt desc="squelched">\n' +
      '  <fbt:param name="one">{one}</fbt:param>\n' +
      '  {" "}\n' +
      '  <fbt:param name="two">{two}</fbt:param>\n' +
      '  {` `}\n' +
      '  <fbt:param name="three">{three}</fbt:param>\n' +
      '</fbt>;',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
        type: 'text',
        jsfbt: '{one} {two} {three}',
        desc: 'squelched',
      }) +
      ',[\nfbt._param("one",one),\n\n' +
      'fbt._param("two",two),\n' +
      'fbt._param("three",three)]\n);',
  },

  'should handle params': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = ' +
      '<fbt desc="a message!">\n' +
      '  A parameterized message to:\n' +
      '  <fbt:param name="personName">{theName}</fbt:param>\n' +
      '</fbt>;',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'A parameterized message to: {personName}',
        desc: 'a message!',
      }) +
      ',[\n\nfbt._param("personName",theName)]\n);',
  },

  'should handle empty string': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = ' +
      '<fbt desc="a message!">\n' +
      '  A parameterized message to:\n' +
      '  <fbt:param name="emptyString"> </fbt:param>\n' +
      '</fbt>;',

    output:
      'const fbt = require("fbt");\n' +
      'var x = fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'A parameterized message to: {emptyString}',
        desc: 'a message!',
      }) +
      ',[\n\nfbt._param("emptyString",\' \')]\n);',
  },

  'should handle concatenated descriptions': {
    input:
      'const fbt = require("fbt");\n' +
      '<fbt desc={"A very long description " + "that we will concatenate " + ' +
      '"a few times"}\n project={"With" + "a" + "project"}>\n' +
      '  Here it is\n' +
      '</fbt>;',

    output:
      'const fbt = require("fbt");\n' +
      'fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'Here it is',
        desc: 'A very long description that we will concatenate a few times',
        project: 'Withaproject',
      }) +
      '\n);',
  },

  'should handle template descriptions': {
    input:
      'const fbt = require("fbt");\n' +
      '<fbt desc={`A very long description\n  that will be a \n template across ' +
      'multiple lines`}\n project={"With" + "a" + "project"}>\n' +
      '  Here it is\n' +
      '</fbt>;',

    output:
      'const fbt = require("fbt");\n' +
      'fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'Here it is',
        desc:
          'A very long description that will be a template across multiple lines',
        project: 'Withaproject',
      }) +
      '\n);',
  },

  'should be able to nest within React nodes': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = ' +
      '  <div>\n' +
      '    <fbt desc="nested!">\n' +
      '      A nested string\n' +
      '    </fbt>\n' +
      '  </div>;',

    output:
      'const fbt = require("fbt");\n' +
      'var x =   React.createElement("div", null,   fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'A nested string',
        desc: 'nested!',
      }) +
      ') );',
  },

  'should be able to house arbitrary markup within fbt:param nodes': {
    input:
      'const fbt = require("fbt");\n' +
      '<div>\n' +
      '  <fbt desc="...">\n' +
      '    <fbt:param name="time">{formatDate(date, "F d, Y")}</fbt:param>\n' +
      '     by \n' +
      '    <fbt:param name="user name">\n' +
      '      <Link href={{url:user.link}}>\n' +
      '        {user.name}\n' +
      '      </Link>\n' +
      '    </fbt:param>\n' +
      '  </fbt>\n' +
      '</div>;',

    output:
      'const fbt = require("fbt");\n' +
      'React.createElement("div", null, \n  ' +
      'fbt._(' +
      payload({
        type: 'text',
        jsfbt: '{time} by {user name}',
        desc: '...',
      }) +
      ',[\n' +
      'fbt._param("time",formatDate(date, "F d, Y")),\n\n' +
      'fbt._param("user name",\n' +
      'React.createElement(Link, {href: {url:user.link}}, \n' +
      '        user.name\n' +
      '      ))]\n\n' +
      ')\n);',
  },

  'should handle enums (with array values)': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = ' +
      '  <fbt desc="enums!">\n' +
      '    Click to see\n' +
      '    <fbt:enum enum-range={{id1:"groups",\n' +
      '                           id2:"photos",\n' +
      '                           id3:"videos"}}\n' +
      '              value={id} />\n' +
      '  </fbt>;',

    output:
      'const fbt = require("fbt");\n' +
      'var x = ' +
      '  fbt._(' +
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
      ',[\n\nfbt._enum(id,' +
      '{"id1":"groups","id2":"photos","id3":"videos"})]);',
  },

  'should handle enums with more text': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = ' +
      '  <fbt desc="enums!">\n' +
      '    Click to see\n' +
      '    <fbt:enum enum-range={{id1:"groups",\n' +
      '                           id2:"photos",\n' +
      '                           id3:"videos"}}\n' +
      '              value={id} />\n' +
      '    Hey-hey!\n' +
      '  </fbt>;',

    output:
      'const fbt = require("fbt");\n' +
      'var x = ' +
      '  fbt._(' +
      payload({
        type: 'table',
        jsfbt: {
          t: {
            id1: 'Click to see groups Hey-hey!',
            id2: 'Click to see photos Hey-hey!',
            id3: 'Click to see videos Hey-hey!',
          },
          m: [null],
        },
        desc: 'enums!',
      }) +
      ',[\n\nfbt._enum(id,' +
      '{"id1":"groups","id2":"photos","id3":"videos"})]);',
  },

  'should handle variations': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = ' +
      '  <fbt desc="variations!">\n' +
      '    Click to see\n' +
      '   <fbt:param name="count" number="true">{c}</fbt:param>\n' +
      '  links\n' +
      '  </fbt>;',

    output:
      'const fbt = require("fbt");\n' +
      'var x =   fbt._(' +
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
      ',[\n\nfbt._param("count",c, [0])]\n\n);',
  },

  'should handle number={true} - (same output as above test)': {
    input:
      'const fbt = require("fbt");\n' +
      'var x = ' +
      '  <fbt desc="variations!">\n' +
      '    Click to see\n' +
      '   <fbt:param name="count" number={true}>{c}</fbt:param>\n' +
      '  links\n' +
      '  </fbt>;',

    output:
      'const fbt = require("fbt");\n' +
      'var x =   fbt._(' +
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
      ',[\n\nfbt._param("count",c, [0])]\n\n);',
  },

  'should correctly destruct expression values in options': {
    input:
      'const fbt = require("fbt");\n' +
      '<fbt desc="d">str\n' +
      '  <fbt:param name="count" number={someNum}>\n' +
      '    {getNum()}\n' +
      '  </fbt:param>' +
      '</fbt>',

    output:
      'const fbt = require("fbt");\n' +
      'fbt._(' +
      payload({
        type: 'table',
        jsfbt: {
          t: {
            '*': 'str {count}',
          },
          m: [
            {
              token: 'count',
              type: FbtVariationType.NUMBER,
            },
          ],
        },
        desc: 'd',
      }) +
      ',[\nfbt._param("count",\ngetNum(),[0,someNum])]\n)',
  },

  'should insert param value for same-param': {
    input:
      'const fbt = require("fbt");\n' +
      '<fbt desc="d">str\n' +
      '  <fbt:param name="foo">{Bar}</fbt:param> and ' +
      '  <fbt:same-param name="foo"/>' +
      '</fbt>',

    output:
      'const fbt = require("fbt");\n' +
      'fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'str {foo} and {foo}',
        desc: 'd',
      }) +
      ',[fbt._param("foo",Bar)])',
  },

  'should treat multiline descs as a single line': {
    input: [
      'const fbt = require("fbt");\n' + '<fbt ',
      'desc="hi how are you today im doing well i guess',
      'how is your mother is she well yeah why not lets go',
      'home and never come back.">',
      'lol',
      '</fbt>',
    ].join('\n'),

    output:
      'const fbt = require("fbt");\n' +
      'fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'lol',
        desc:
          'hi how are you today im doing well i guess how is your ' +
          'mother is she well yeah why not lets go home and never come back.',
      }) +
      ')',
  },

  'should not insert extra space': {
    input: [
      'const fbt = require("fbt");\n' + '<fbt desc="Greating in i18n demo">',
      '  Hello, <fbt:param name="guest">',
      '  {guest}',
      '</fbt:param>!',
      '</fbt>',
    ].join('\n'),

    output:
      'const fbt = require("fbt");\n' +
      'fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'Hello, {guest}!',
        desc: 'Greating in i18n demo',
        project: '',
      }) +
      ', [fbt._param("guest",guest)])',
  },

  'should handle single expression with binary': {
    input: [
      'const fbt = require("fbt");\n' + '<fbt desc="foo">',
      '  {"foo" + "bar"}',
      '</fbt>',
    ].join('\n'),

    output:
      'const fbt = require("fbt");\n' +
      'fbt._(' +
      payload({
        type: 'text',
        jsfbt: 'foobar',
        desc: 'foo',
        project: '',
      }) +
      ')',
  },

  'should throw on invalid attributes in fbt:param': {
    input:
      'const fbt = require("fbt");\n' +
      '<fbt desc="some-desc">\n' +
      '  <fbt:param name="foo" qux="foo" desc="foo-desc">\n' +
      '    {foo}\n' +
      '  </fbt:param>\n' +
      '</fbt>',

    throws: true,
  },

  'should ignore non-expression children in fbt:param': {
    input:
      'const fbt = require("fbt");\n' +
      '<fbt desc="some-desc">\n' +
      '  <fbt:param name="foo">\n' +
      '    !{foo}!\n' +
      '  </fbt:param>\n' +
      '</fbt>',

    output:
      'const fbt = require("fbt");\n' +
      'fbt._(' +
      payload({
        type: 'text',
        jsfbt: '{foo}',
        desc: 'some-desc',
      }) +
      ', [fbt._param("foo", foo)]);',
  },

  'should maintain order of params and enums': {
    input:
      'const fbt = require("fbt");\n' +
      '<fbt desc="some-desc">\n' +
      '  Hello, \n' +
      '  <fbt:param name="foo">\n' +
      '    {foo}\n' +
      '  </fbt:param>\n' +
      '  <fbt:enum enum-range={["x", "y"]} value={x} />\n' +
      '  <fbt:param name="bar" number={n}>\n' +
      '    {bar}\n' +
      '  </fbt:param>\n' +
      '</fbt>',

    output:
      'const fbt = require("fbt");\n' +
      'fbt._(' +
      payload({
        type: 'table',
        jsfbt: {
          t: {
            x: {
              '*': 'Hello, {foo}x{bar}',
            },
            y: {
              '*': 'Hello, {foo}y{bar}',
            },
          },
          m: [
            null,
            {
              token: 'bar',
              type: FbtVariationType.NUMBER,
            },
          ],
        },
        desc: 'some-desc',
      }) +
      ', [fbt._param("foo", foo), ' +
      'fbt._enum(x, {"x": "x", "y": "y"}), fbt._param("bar", bar, [0, n])]);',
  },

  'should support html escapes': {
    input: [
      'const fbt = require("fbt");\n' + '<fbt desc="foo">&times;</fbt>',
    ].join('\n'),

    output:
      'const fbt = require("fbt");\n' +
      'fbt._(' +
      payload({
        type: 'text',
        jsfbt: '\xD7',
        desc: 'foo',
        project: '',
      }) +
      ')',
  },

  'should handle object pronoun': {
    input:
      // Wish her a happy birthday.
      'const fbt = require("fbt");\n' +
      '<fbt desc={"d"} project={"p"}>\n' +
      'Wish <fbt:pronoun type="object" gender={gender}/> a happy birthday.\n' +
      '</fbt>;\n',

    output:
      'const fbt = require("fbt");\n' +
      'fbt._(' +
      payload({
        type: 'table',
        jsfbt: {
          t: {
            '1': 'Wish her a happy birthday.',
            '2': 'Wish him a happy birthday.',
            '*': 'Wish them a happy birthday.',
          },
          m: [null],
        },
        desc: 'd',
        project: 'p',
      }) +
      ', [fbt._pronoun(0,gender)]);',
  },

  'should handle object pronoun (react native)': {
    input:
      // Wish her a happy birthday.
      'const fbt = require("fbt");\n' +
      '<fbt desc={"d"} project={"p"}>\n' +
      'Wish <fbt:pronoun type="object" gender={gender}/> a happy birthday.\n' +
      '</fbt>;\n',

    options: {
      reactNativeMode: true,
    },

    output:
      'const fbt = require("fbt");\n' +
      'fbt._(' +
      payload({
        type: 'table',
        jsfbt: {
          t: {
            '1': 'Wish her a happy birthday.',
            '2': 'Wish him a happy birthday.',
            '*': 'Wish them a happy birthday.',
          },
          m: [
            {
              type: FbtVariationType.PRONOUN,
            },
          ],
        },
        desc: 'd',
        project: 'p',
      }) +
      ', [fbt._pronoun(0,gender)]);',
  },

  'should handle subject+reflexive pronouns': {
    input:
      // She wished herself a happy birthday.
      'const fbt = require("fbt");\n' +
      '<fbt desc={"d"} project={"p"}>\n' +
      '<fbt:pronoun type="subject" gender={gender} capitalize={true}/>' +
      ' wished ' +
      '<fbt:pronoun type="reflexive" gender={gender}/>' +
      ' a happy birthday.\n' +
      '</fbt>;\n',

    output:
      'const fbt = require("fbt");\n' +
      'fbt._(' +
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
        desc: 'd',
        project: 'p',
      }) +
      ', [fbt._pronoun(3,gender),fbt._pronoun(2,gender)]);',
  },

  'should handle subject+reflexive pronouns (react native)': {
    input:
      // She wished herself a happy birthday.
      'const fbt = require("fbt");\n' +
      '<fbt desc={"d"} project={"p"}>\n' +
      '<fbt:pronoun type="subject" gender={gender} capitalize={true}/>' +
      ' wished ' +
      '<fbt:pronoun type="reflexive" gender={gender}/>' +
      ' a happy birthday.\n' +
      '</fbt>;\n',

    options: {
      reactNativeMode: true,
    },

    output:
      'const fbt = require("fbt");\n' +
      'fbt._(' +
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
          m: [
            {
              type: FbtVariationType.PRONOUN,
            },
            {
              type: FbtVariationType.PRONOUN,
            },
          ],
        },
        desc: 'd',
        project: 'p',
      }) +
      ', [fbt._pronoun(3,gender),fbt._pronoun(2,gender)]);',
  },

  'fbt:param with multiple children should error': {
    input:
      'const fbt = require("fbt");\n' +
      '<fbt desc="some-desc">\n' +
      '  <fbt:param name="foo">\n' +
      '    {foo}\n' +
      '    {bar}\n' +
      '  </fbt:param>\n' +
      '</fbt>\n',

    throws: true,
  },

  'fbt:param with multiple empty expression containers should be ok': {
    input:
      'const fbt = require("fbt");\n' +
      '<fbt desc="some-desc">\n' +
      '  <fbt:param name="foo">\n' +
      '    {}\n' +
      '    {/* comment */}\n' +
      '    {foo}\n' +
      '    {}\n' +
      '  </fbt:param>\n' +
      '</fbt>\n',

    output:
      'const fbt = require("fbt");\n' +
      'fbt._(' +
      payload({
        type: 'text',
        jsfbt: '{foo}',
        desc: 'some-desc',
      }) +
      ',[fbt._param("foo",foo)])',
  },
};

describe('Test declarative (jsx) fbt syntax translation', () =>
  testUtil.testSection(testData, transform));
