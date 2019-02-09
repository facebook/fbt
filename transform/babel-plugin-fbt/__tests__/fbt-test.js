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

const {TestUtil} = require('fb-babel-plugin-utils');
const {payload, transform} = require('../FbtTestUtil');
const {transformSync: babelTransform} = require('@babel/core');

function runTest(data, extra) {
  TestUtil.assertSourceAstEqual(transform(data.input, extra), data.output);
}

describe('Test extraOptions', () => {
  it('should accept "locale" extra option', () => {
    runTest(
      {
        input:
          "const fbt = require('fbt');" +
          'fbt("Foo", "Bar", {locale: locale.data});',
        output:
          "const fbt = require('fbt');" +
          'fbt._(' +
          payload({
            type: 'text',
            jsfbt: 'Foo',
            desc: 'Bar',
          }) +
          ')',
      },
      {
        extraOptions: {locale: true},
      },
    );
  });
});

describe('Test FBT subject', () => {
  it('should accept "subject" as a parameter', () => {
    runTest({
      input:
        "const fbt = require('fbt');" + 'fbt("Foo", "Bar", {subject: foo});',
      output:
        "const fbt = require('fbt');" +
        'fbt._(' +
        payload({
          type: 'table',
          jsfbt: {
            t: {'*': 'Foo'},
            m: [{token: '__subject__', type: 1}],
          },
          desc: 'Bar',
          project: '',
        }) +
        ', [fbt._subject(foo)])',
    });
  });
});

describe('Test FBT subject with templates', () => {
  it('should accept "subject" as a parameter', () => {
    runTest({
      input:
        "const fbt = require('fbt');" + 'fbt(`Foo`, "Bar", {subject: foo});',
      output:
        "const fbt = require('fbt');" +
        'fbt._(' +
        payload({
          type: 'table',
          jsfbt: {
            t: {'*': 'Foo'},
            m: [{token: '__subject__', type: 1}],
          },
          desc: 'Bar',
          project: '',
        }) +
        ', [fbt._subject(foo)])',
    });
  });
});

describe('Test double-lined params', () => {
  it('should remove the new line for param names that are two lines', () => {
    runTest({
      input:
        "const fbt = require('fbt');" +
        '<fbt desc="d">\n' +
        '<fbt:param name="two\n' +
        'lines">\n' +
        '<b>\n' +
        '<fbt desc="test">\n' +
        'simple\n' +
        '</fbt>\n' +
        '</b>\n' +
        '</fbt:param>\n' +
        'test\n' +
        '</fbt>;',

      output:
        "const fbt = require('fbt');" +
        'fbt._(' +
        payload({
          type: 'text',
          jsfbt: '{two lines} test',
          desc: 'd',
        }) +
        ',[\n\nfbt._param("two lines",' +
        'React.createElement("b", null, fbt._( ' +
        payload({
          type: 'text',
          jsfbt: 'simple',
          desc: 'test',
        }) +
        ') )' +
        ')]\n\n);',
    });
  });
});
