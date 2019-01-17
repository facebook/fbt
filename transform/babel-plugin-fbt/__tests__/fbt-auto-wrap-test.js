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

const {TestUtil} = require('fb-babel-plugin-utils');
const {payload, transform} = require('../FbtTestUtil');
const {transformSync: babelTransform} = require('@babel/core');

const testData = {
  'should auto wrap a simple test with one level': {
    input:
      "const fbt = require('fbt');" +
      '<fbt desc="d">\n' +
      '<link href="#">\n' +
      'Your friends\n' +
      '</link>\n' +
      'liked your video\n' +
      '</fbt>;',

    output:
      "const fbt = require('fbt');" +
      'fbt._(' +
      payload({
        type: 'text',
        jsfbt: '{=Your friends} liked your video',
        desc: 'd',
      }) +
      ',[\n\nfbt._param("=Your friends",' +
      'React.createElement("link", { href: "#" },   fbt._( ' +
      payload({
        type: 'text',
        jsfbt: 'Your friends',
        desc: 'In the phrase: "{=Your friends} liked your video"',
      }) +
      ') )' +
      ')]\n\n);',
  },

  'should auto wrap a simple test with a nested level': {
    input:
      "const fbt = require('fbt');" +
      '<fbt desc="d">\n' +
      '<Link href="#">\n' +
      'Your friends\n' +
      '<b>\n' +
      'liked\n' +
      '</b>\n' +
      '</Link>\n' +
      'your video\n' +
      '</fbt>;',

    output:
      "const fbt = require('fbt');" +
      'fbt._(' +
      payload({
        type: 'text',
        jsfbt: '{=Your friends liked} your video',
        desc: 'd',
      }) +
      ',[\n\nfbt._param("=Your friends liked",' +
      'React.createElement( ' +
      'Link, { href: "#" },   fbt._( ' +
      payload({
        type: 'text',
        jsfbt: 'Your friends {=liked}',
        desc: 'In the phrase: "{=Your friends liked} your video"',
      }) +
      ',[\n\nfbt._param("=liked", ' +
      'React.createElement("b", null, fbt._( ' +
      payload({
        type: 'text',
        jsfbt: 'liked',
        desc: 'In the phrase: "Your friends {=liked} your video"',
      }) +
      ') ' +
      ')' +
      ')])' +
      ')' +
      ')]\n\n);',
  },
};

describe('Test jsx auto-wrapping of implicit parameters', () =>
  TestUtil.testSection(testData, transform));

describe('Equality between auto-wrapped and manually wrapped params', () => {
  it('should wrap a single unwrapped <fbt> child and a string above', () => {
    expect(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<fbt:param name="=This is a nested">\n' +
          '<b>\n' +
          '<fbt desc="In the phrase: ' +
          '&quot;{=This is a nested} test&quot;">\n' +
          'This is\n' +
          '<fbt:param name="=a nested">\n' +
          '<link href="#">\n' +
          '<fbt desc="In the phrase: ' +
          '&quot;This is {=a nested} test&quot;">\n' +
          'a nested\n' +
          '</fbt>\n' +
          '</link>\n' +
          '</fbt:param>\n' +
          '</fbt>\n' +
          '</b>\n' +
          '</fbt:param>\n' +
          'test\n' +
          '</fbt>;',
      ),
    ).toEqual(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<b>\n' +
          'This is\n' +
          '<link href="#">\n' +
          'a nested\n' +
          '</link>\n' +
          '</b>\n' +
          'test\n' +
          '</fbt>;',
      ),
    );
  });

  it('should wrap a single unwrapped <fbt> child and a string below', () => {
    expect(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<div href="#">\n' +
          'this is\n' +
          '</div>\n' +
          'a singly nested test\n' +
          '</fbt>;',
      ),
    ).toEqual(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<fbt:param name="=this is">\n' +
          '<div href="#">\n' +
          '<fbt desc=' +
          '"In the phrase: &quot;{=this is} a singly nested test&quot;">\n' +
          'this is\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          'a singly nested test\n' +
          '</fbt>;',
      ),
    );
  });

  it('should wrap two unwrapped <fbt> children', () => {
    expect(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<div>\n' +
          'wrap once\n' +
          '</div>\n' +
          '<div>\n' +
          'wrap twice\n' +
          '</div>\n' +
          '</fbt>;',
      ),
    ).toEqual(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<fbt:param name="=wrap once">\n' +
          '<div>\n' +
          '<fbt desc=' +
          '"In the phrase: &quot;{=wrap once}{=wrap twice}&quot;">\n' +
          'wrap once\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '<fbt:param name="=wrap twice">\n' +
          '<div>\n' +
          '<fbt desc=' +
          '"In the phrase: &quot;{=wrap once}{=wrap twice}&quot;">\n' +
          'wrap twice\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '</fbt>;',
      ),
    );
  });

  it('should wrap two unwrapped <fbt> children and 1 nested', () => {
    expect(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<div>\n' +
          'wrap once\n' +
          '<div>\n' +
          'and also\n' +
          '</div>\n' +
          '</div>\n' +
          '<div>\n' +
          'wrap twice\n' +
          '</div>\n' +
          'complicated\n' +
          '</fbt>;',
      ),
    ).toEqual(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<fbt:param name="=wrap once and also">\n' +
          '<div>\n' +
          '<fbt desc="In the phrase: &quot;{=wrap once and also}' +
          '{=wrap twice} complicated&quot;">\n' +
          'wrap once\n' +
          '<fbt:param name="=and also">\n' +
          '<div>\n' +
          '<fbt desc="In the phrase: &quot;wrap once ' +
          '{=and also}{=wrap twice} complicated&quot;">\n' +
          'and also\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '<fbt:param name="=wrap twice">\n' +
          '<div>\n' +
          '<fbt desc="In the phrase: ' +
          '&quot;{=wrap once and also}{=wrap twice} complicated&quot;">\n' +
          'wrap twice\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          'complicated\n' +
          '</fbt>;',
      ),
    );
  });

  it('should wrap an outer and inner child', () => {
    expect(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<div href="#">\n' +
          '<div href="#">\n' +
          'this is\n' +
          '</div>\n' +
          'a doubly\n' +
          '</div>\n' +
          'nested test\n' +
          '</fbt>;',
      ),
    ).toEqual(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<fbt:param name="=this is a doubly">\n' +
          '<div href="#">\n' +
          '<fbt desc=' +
          '"In the phrase: &quot;{=this is a doubly} nested test&quot;">\n' +
          '<fbt:param name="=this is">\n' +
          '<div href="#">\n' +
          '<fbt desc="In the phrase: ' +
          '&quot;{=this is} a doubly nested test&quot;">\n' +
          'this is\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          'a doubly\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          'nested test\n' +
          '</fbt>;',
      ),
    );
  });

  it('should wrap two children with one nested level', () => {
    expect(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<div href="#">\n' +
          '<div href="#">\n' +
          'this is\n' +
          '</div>\n' +
          'a doubly\n' +
          '</div>\n' +
          'nested test\n' +
          '<div href="#">\n' +
          'with an additional level\n' +
          '</div>\n' +
          '</fbt>;',
      ),
    ).toEqual(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<fbt:param name="=this is a doubly">\n' +
          '<div href="#">\n' +
          '<fbt desc="In the phrase: &quot;{=this is a doubly} ' +
          'nested test {=with an additional level}&quot;">\n' +
          '<fbt:param name="=this is">\n' +
          '<div href="#">\n' +
          '<fbt desc="In the phrase: &quot;{=this is} ' +
          'a doubly nested test {=with an additional level}&quot;">\n' +
          'this is\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          'a doubly\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          'nested test\n' +
          '<fbt:param name="=with an additional level">\n' +
          '<div href="#">\n' +
          '<fbt desc="In the phrase: &quot;{=this is a doubly}' +
          ' nested test {=with an additional level}&quot;">\n' +
          'with an additional level\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '</fbt>;',
      ),
    );
  });

  it('should wrap a <fbt> child next to an explicit <fbt:param>', () => {
    expect(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<fbt:param name="explicit param next to">\n' +
          '<div>\n' +
          '<fbt desc="d2">\n' +
          'explicit param next to\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '<div>\n' +
          'an implicit param\n' +
          '</div>\n' +
          '</fbt>;',
      ),
    ).toEqual(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<fbt:param name="explicit param next to">\n' +
          '<div>\n' +
          '<fbt desc="d2">\n' +
          'explicit param next to\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '<fbt:param name="=an implicit param">\n' +
          '<div>\n' +
          '<fbt desc="In the phrase: ' +
          '&quot;{=explicit param next to}{=an implicit param}&quot;">\n' +
          'an implicit param\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '</fbt>;',
      ),
    );
  });

  it('should wrap a <fbt> child nested in an explicit <fbt:param>', () => {
    expect(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<fbt:param name="explicit fbt param">\n' +
          '<div>\n' +
          '<fbt desc="d2">\n' +
          'explicit fbt param\n' +
          '<div>\n' +
          'with a nested implicit param\n' +
          '</div>\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '</fbt>;',
      ),
    ).toEqual(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<fbt:param name="explicit fbt param">\n' +
          '<div>\n' +
          '<fbt desc="d2">\n' +
          'explicit fbt param\n' +
          '<fbt:param name="=with a nested implicit param">\n' +
          '<div>\n' +
          '<fbt desc="In the phrase: &quot;explicit fbt param ' +
          '{=with a nested implicit param}&quot;">\n' +
          'with a nested implicit param\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '</fbt>;',
      ),
    );
  });

  it(
    'should wrap a string next to an explicit <fbt:param> that has a' +
      'implicit <fbt:param> within it',
    () => {
      expect(
        transform(
          "const fbt = require('fbt');" +
            '<fbt desc="d">\n' +
            'outer string that should not appear in inner desc\n' +
            '<fbt:param name="explicit fbt param">\n' +
            '<div>\n' +
            '<fbt desc="d2">\n' +
            'explicit fbt param\n' +
            '<div>\n' +
            'with a nested implicit param\n' +
            '</div>\n' +
            '</fbt>\n' +
            '</div>\n' +
            '</fbt:param>\n' +
            '</fbt>;',
        ),
      ).toEqual(
        transform(
          "const fbt = require('fbt');" +
            '<fbt desc="d">\n' +
            'outer string that should not appear in inner desc\n' +
            '<fbt:param name="explicit fbt param">\n' +
            '<div>\n' +
            '<fbt desc="d2">\n' +
            'explicit fbt param\n' +
            '<fbt:param name="=with a nested implicit param">\n' +
            '<div>\n' +
            '<fbt desc="In the phrase: &quot;explicit fbt param ' +
            '{=with a nested implicit param}&quot;">\n' +
            'with a nested implicit param\n' +
            '</fbt>\n' +
            '</div>\n' +
            '</fbt:param>\n' +
            '</fbt>\n' +
            '</div>\n' +
            '</fbt:param>\n' +
            '</fbt>;',
        ),
      );
    },
  );

  it('should work with multiple <fbt> calls in one file', () => {
    expect(
      transform(
        "const fbt = require('fbt');" +
          '<div>\n' +
          '<fbt desc="one">\n' +
          '<div href="#">\n' +
          'first\n' +
          '</div>\n' +
          'fbt call\n' +
          '</fbt>\n' +
          '<fbt desc="two">\n' +
          '<div href="#">\n' +
          'second\n' +
          '</div>\n' +
          'test\n' +
          '</fbt>\n' +
          '</div>;',
      ),
    ).toEqual(
      transform(
        "const fbt = require('fbt');" +
          '<div>\n' +
          '<fbt desc="one">\n' +
          '<fbt:param name="=first">\n' +
          '<div href="#">\n' +
          '<fbt desc=' +
          '"In the phrase: &quot;{=first} fbt call&quot;">\n' +
          'first\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          'fbt call\n' +
          '</fbt>\n' +
          '<fbt desc="two">\n' +
          '<fbt:param name="=second">\n' +
          '<div href="#">\n' +
          '<fbt desc=' +
          '"In the phrase: &quot;{=second} test&quot;">\n' +
          'second\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          'test\n' +
          '</fbt>\n' +
          '</div>;',
      ),
    );
  });

  it('should wrap two nested next to each other', () => {
    expect(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<div href="#">\n' +
          'one\n' +
          '<div href="#">\n' +
          'two\n' +
          '</div>\n' +
          '</div>\n' +
          '<div href="#">\n' +
          'three\n' +
          '<div href="#">\n' +
          'four\n' +
          '</div>\n' +
          '</div>\n' +
          '</fbt>;',
      ),
    ).toEqual(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<fbt:param name="=one two">\n' +
          '<div href="#">\n' +
          '<fbt desc=' +
          '"In the phrase: &quot;{=one two}{=three four}&quot;">\n' +
          'one\n' +
          '<fbt:param name="=two">\n' +
          '<div href="#">\n' +
          '<fbt desc=' +
          '"In the phrase: &quot;one {=two}{=three four}&quot;">\n' +
          'two\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '<fbt:param name="=three four">\n' +
          '<div href="#">\n' +
          '<fbt desc=' +
          '"In the phrase: &quot;{=one two}{=three four}&quot;">\n' +
          'three\n' +
          '<fbt:param name="=four">\n' +
          '<div href="#">\n' +
          '<fbt desc=' +
          '"In the phrase: &quot;{=one two}three {=four}&quot;">\n' +
          'four\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '</fbt>;',
      ),
    );
  });

  it('should wrap two nested next to each other with an extra level', () => {
    expect(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<div href="#">\n' +
          'one\n' +
          '<div href="#">\n' +
          'two\n' +
          '<div href="#">\n' +
          'test\n' +
          '</div>\n' +
          '</div>\n' +
          '</div>\n' +
          '<div href="#">\n' +
          'three\n' +
          '<div href="#">\n' +
          'four\n' +
          '</div>\n' +
          '</div>\n' +
          '</fbt>;',
      ),
    ).toEqual(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<fbt:param name="=one two test">\n' +
          '<div href="#">\n' +
          '<fbt desc=' +
          '"In the phrase: &quot;{=one two test}{=three four}&quot;">\n' +
          'one\n' +
          '<fbt:param name="=two test">\n' +
          '<div href="#">\n' +
          '<fbt desc=' +
          '"In the phrase: &quot;one {=two test}' +
          '{=three four}&quot;">\n' +
          'two\n' +
          '<fbt:param name="=test">\n' +
          '<div href="#">\n' +
          '<fbt desc=' +
          '"In the phrase: &quot;one two {=test}' +
          '{=three four}&quot;">\n' +
          'test\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '<fbt:param name="=three four">\n' +
          '<div href="#">\n' +
          '<fbt desc=' +
          '"In the phrase: &quot;{=one two test}{=three four}&quot;">\n' +
          'three\n' +
          '<fbt:param name="=four">\n' +
          '<div href="#">\n' +
          '<fbt desc=' +
          '"In the phrase: &quot;{=one two test}' +
          'three {=four}&quot;">\n' +
          'four\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '</fbt>;',
      ),
    );
  });

  it('should wrap a single unwrapped <fbt> child and a string above', () => {
    expect(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<fbt:param name="=This is a nested">\n' +
          '<b>\n' +
          '<fbt desc="In the phrase: ' +
          '&quot;{=This is a nested} test&quot;">\n' +
          'This is\n' +
          '<fbt:param name="=a nested">\n' +
          '<link href="#">\n' +
          '<fbt desc="In the phrase: ' +
          '&quot;This is {=a nested} test&quot;">\n' +
          'a nested\n' +
          '</fbt>\n' +
          '</link>\n' +
          '</fbt:param>\n' +
          '</fbt>\n' +
          '</b>\n' +
          '</fbt:param>\n' +
          'test\n' +
          '</fbt>;',
      ),
    ).toEqual(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<b>\n' +
          'This is\n' +
          '<link href="#">\n' +
          'a nested\n' +
          '</link>\n' +
          '</b>\n' +
          'test\n' +
          '</fbt>;',
      ),
    );
  });

  it('should wrap explicit params nested in implicit params with []', () => {
    expect(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<div>\n' +
          'this is a test\n' +
          '<fbt:param name="to make sure that explicit params under an ' +
          'implicit node">\n' +
          '<link>\n' +
          '<fbt desc="d2">\n' +
          'to make sure that explicit tags\n' +
          '<b>\n' +
          'under an implicit node\n' +
          '</b>\n' +
          '</fbt>\n' +
          '</link>\n' +
          '</fbt:param>\n' +
          '<fbt:param name="and ones that are next to each other">\n' +
          '<link>\n' +
          '<fbt desc="d3">\n' +
          'and ones that are next\n' +
          '<b>\n' +
          'to each other\n' +
          '</b>\n' +
          '</fbt>\n' +
          '</link>\n' +
          '</fbt:param>\n' +
          'under an implicit tag are wrapped with [ ]\n' +
          '</div>\n' +
          '<fbt:param name="but free standing ones are not">\n' +
          '<link>\n' +
          '<fbt desc="d3">\n' +
          'but free standing ones\n' +
          '<b>\n' +
          'are not\n' +
          '</b>\n' +
          '</fbt>\n' +
          '</link>\n' +
          '</fbt:param>\n' +
          '</fbt>;',
      ),
    ).toEqual(
      transform(
        "const fbt = require('fbt');" +
          '<fbt desc="d">\n' +
          '<fbt:param name="=this is a test [to make sure that explicit ' +
          'params under an implicit node][and ones that are next to each other]' +
          ' under an implicit tag are wrapped with [ ]">\n' +
          '<div>\n' +
          '<fbt desc=' +
          '"In the phrase: &quot;{=this is a test [to make sure that ' +
          'explicit params under an implicit node][and ones that are next' +
          ' to each other] under an implicit tag are wrapped with [ ]}' +
          '{=but free standing ones are not}&quot;">\n' +
          'this is a test\n' +
          '<fbt:param name="to make sure that explicit params under an ' +
          'implicit node">\n' +
          '<link>\n' +
          '<fbt desc="d2">\n' +
          'to make sure that explicit tags\n' +
          '<b>\n' +
          'under an implicit node\n' +
          '</b>\n' +
          '</fbt>\n' +
          '</link>\n' +
          '</fbt:param>\n' +
          '<fbt:param name="and ones that are next to each other">\n' +
          '<link>\n' +
          '<fbt desc="d3">\n' +
          'and ones that are next\n' +
          '<b>\n' +
          'to each other\n' +
          '</b>\n' +
          '</fbt>\n' +
          '</link>\n' +
          '</fbt:param>\n' +
          'under an implicit tag are wrapped with [ ]\n' +
          '</fbt>\n' +
          '</div>\n' +
          '</fbt:param>\n' +
          '<fbt:param name="but free standing ones are not">\n' +
          '<link>\n' +
          '<fbt desc="d3">\n' +
          'but free standing ones\n' +
          '<b>\n' +
          'are not\n' +
          '</b>\n' +
          '</fbt>\n' +
          '</link>\n' +
          '</fbt:param>\n' +
          '</fbt>;',
      ),
    );
  });
});
