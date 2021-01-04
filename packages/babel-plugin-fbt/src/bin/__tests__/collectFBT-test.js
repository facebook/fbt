/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 *
 * @emails oncall+internationalization
 * @format
 */
'use strict';

const childProcess = require('child_process');
const path = require('path');

const commonPath = path.resolve(__dirname, 'FbtCommonForTests.json');

describe('collectFbt', () => {
  function collect(source, options = {}) {
    const scriptPath = path.join(
      // Find the actual module root path
      // It's dependent on the "main" path set in package.json
      // See https://stackoverflow.com/a/49455609/104598
      path.dirname(require.resolve('babel-plugin-fbt')),
      'bin',
      'collectFbt',
    );
    const collectOptions = [
      scriptPath,
      '--packager=none',
      '--fbt-common-path=' + commonPath,
    ];
    if (options.react_native_mode || false) {
      collectOptions.push('--react-native-mode');
    }

    var child = childProcess.spawnSync(
      process.env.NODE_BINARY || 'node',
      collectOptions,
      {input: source},
    );

    if (
      (child.stderr && child.stderr.toString() !== '') ||
      child.error ||
      child.status !== 0
    ) {
      throw new Error(
        (child.stderr && child.stderr.toString()) ||
          child.error ||
          'Child process exited with code ' + child.status,
      );
    }

    const stdout = child.stdout.toString();
    try {
      return JSON.parse(stdout);
    } catch (error) {
      error.message += `\nstdout:\n----\n${stdout}\n----`;
      throw error;
    }
  }

  it('should extract strings', () => {
    var res = collect('const fbt = require(\'fbt\');<fbt desc="foo">bar</fbt>');

    var expected = {
      type: 'text',
      desc: 'foo',
      jsfbt: 'bar',
    };

    var actual = {};
    Object.keys(expected).map(key => (actual[key] = res.phrases[0][key]));

    expect(actual).toEqual(expected);
  });

  it('should still extract strings if file-level doNotExtract is set to false', () => {
    var res = collect(
      [
        '// @fbt {"project": "someproject", "doNotExtract": false}',
        "const fbt = require('fbt');",
        '<fbt desc="foo">bar</fbt>',
      ].join('\n'),
    );

    var expected = {
      type: 'text',
      desc: 'foo',
      jsfbt: 'bar',
    };

    var actual = {};
    Object.keys(expected).map(key => (actual[key] = res.phrases[0][key]));

    expect(actual).toEqual(expected);
  });

  it('should not extract strings if file-level doNotExtract is set to true', () => {
    var res = collect(
      [
        '// @fbt {"project": "someproject", "doNotExtract": true}',
        "const fbt = require('fbt');",
        '<fbt desc="foo">bar</fbt>',
      ].join('\n'),
    );

    expect(res.phrases.length).toEqual(0);
  });

  it('should still extract strings if in-line doNotExtract is set to false', () => {
    var res = collect(
      [
        "const fbt = require('fbt');",
        '<fbt desc="foo" doNotExtract="false">bar</fbt>',
      ].join('\n'),
    );

    var expected = {
      type: 'text',
      desc: 'foo',
      jsfbt: 'bar',
    };

    var actual = {};
    Object.keys(expected).map(key => (actual[key] = res.phrases[0][key]));

    expect(actual).toEqual(expected);
  });

  it('should not extract strings if in-line doNotExtract is set to true', () => {
    var res = collect(
      [
        "const fbt = require('fbt');",
        '<fbt desc="foo" doNotExtract="true">bar</fbt>',
      ].join('\n'),
    );

    expect(res.phrases.length).toEqual(0);
  });

  it('should still extract strings if fbt call param doNotExtract is set to false', () => {
    var res = collect(
      [
        "const fbt = require('fbt');",
        'fbt("bar", "foo", {doNotExtract: false});',
      ].join('\n'),
    );

    var expected = {
      type: 'text',
      desc: 'foo',
      jsfbt: 'bar',
    };

    var actual = {};
    Object.keys(expected).map(key => (actual[key] = res.phrases[0][key]));

    expect(actual).toEqual(expected);
  });

  it('should not extract strings if fbt call param doNotExtract is set to true', () => {
    var res = collect(
      [
        "const fbt = require('fbt');",
        'fbt("bar", "foo", {doNotExtract: true});',
      ].join('\n'),
    );

    expect(res.phrases.length).toEqual(0);
  });

  it('should not throw because of CSX', () => {
    var res = collect(
      [
        "const fbt = require('fbt');",
        '/**@csx*/',
        '<fbt desc="foo">bar</fbt>;',
        '<Foo options:key="bar" />',
      ].join('\n'),
    );

    var expected = {
      type: 'text',
      desc: 'foo',
      jsfbt: 'bar',
    };

    var actual = {};
    Object.keys(expected).map(key => (actual[key] = res.phrases[0][key]));

    expect(actual).toEqual(expected);
  });

  it('should extract common strings', () => {
    var res = collect(
      "const fbt = require('fbt');<fbt common={true}>Required</fbt>;",
    );

    var expected = {
      type: 'text',
      desc: 'Indicates an editor field is required.',
      jsfbt: 'Required',
    };

    var actual = {};
    Object.keys(expected).map(key => (actual[key] = res.phrases[0][key]));

    expect(actual).toEqual(expected);
  });

  it('should extract fbt.c strings', () => {
    var res = collect("const fbt = require('fbt');fbt.c('Required');");

    var expected = {
      type: 'text',
      desc: 'Indicates an editor field is required.',
      jsfbt: 'Required',
    };

    var actual = {};
    Object.keys(expected).map(key => (actual[key] = res.phrases[0][key]));

    expect(actual).toEqual(expected);
  });

  it('should dedupe fbt:plurals', () => {
    var res = collect(
      [
        `const fbt = require('fbt');`,
        `<fbt desc="desc...">`,
        `  There`,
        `  <fbt:plural count={num} many="are">is</fbt:plural>{' '}`,
        `  <fbt:plural count={num} showCount="yes"
             value={intlNumUtils.formatNumberWithThousandDelimiters(x)}>`,
        `    photo`,
        `  </fbt:plural>.`,
        `</fbt>`,
      ].join('\n'),
    );
    expect(res).toEqual({
      childParentMappings: {},
      phrases: [
        {
          col_beg: 0,
          col_end: 6,
          desc: 'desc...',
          jsfbt: {
            m: [
              null,
              {
                singular: true,
                token: 'number',
                type: 2,
              },
            ],
            t: {
              '*': {
                '*': 'There are {number} photos.',
              },
              _1: {
                _1: 'There is 1 photo.',
              },
            },
          },
          line_beg: 2,
          line_end: 9,
          project: '',
          type: 'table',
        },
      ],
    });
  });

  it('should extract correctly from templates', () => {
    // using templates with just string contents
    var res = collect(
      [
        "const fbt = require('fbt');",
        'const uh = 0;',
        'fbt(`simple`, "ok");',
      ].join('\n'),
    );

    var expected = {
      type: 'text',
      desc: 'ok',
      jsfbt: 'simple',
    };

    actual = {};
    Object.keys(expected).map(key => (actual[key] = res.phrases[0][key]));

    expect(actual).toEqual(expected);

    // with a param
    res = collect(
      [
        "const fbt = require('fbt');",
        'const uh = 0;',
        'fbt(`testing ${fbt.param("it", uh)} works`, "great");',
      ].join('\n'),
    );

    expected = {
      type: 'text',
      desc: 'great',
      jsfbt: 'testing {it} works',
    };

    var actual = {};
    Object.keys(expected).map(key => (actual[key] = res.phrases[0][key]));

    expect(actual).toEqual(expected);

    // with the param being first
    res = collect(
      [
        "const fbt = require('fbt');",
        'const uh = 0;',
        'fbt(`${fbt.param("it", uh)} still works`, "well");',
      ].join('\n'),
    );

    expected = {
      type: 'text',
      desc: 'well',
      jsfbt: '{it} still works',
    };

    actual = {};
    Object.keys(expected).map(key => (actual[key] = res.phrases[0][key]));

    expect(actual).toEqual(expected);

    // multiple params
    res = collect(
      [
        "const fbt = require('fbt');",
        'const uh = 0;',
        'fbt(`${fbt.param("1", uh)} ${fbt.param("2", uh)} ${fbt.sameParam("3")} 4`, "counting");',
      ].join('\n'),
    );

    expected = {
      type: 'text',
      desc: 'counting',
      jsfbt: '{1} {2} {3} 4',
    };

    actual = {};
    Object.keys(expected).map(key => (actual[key] = res.phrases[0][key]));

    expect(actual).toEqual(expected);

    // supports tables ie fbt:enum
    res = collect(
      [
        "const fbt = require('fbt');",
        'const uh = 0;',
        "fbt(`${fbt.enum(uh, {0:'a', 1:'b'})} ${fbt.param(\"2\", uh)}\n" +
          '${fbt.sameParam("3")} 4`, "counting");',
      ].join('\n'),
    );
    expected = {
      type: 'table',
      desc: 'counting',
      jsfbt: {
        m: [null],
        t: {
          0: 'a {2} {3} 4',
          1: 'b {2} {3} 4',
        },
      },
    };
    actual = {};
    Object.keys(expected).map(key => (actual[key] = res.phrases[0][key]));
    expect(actual).toEqual(expected);

    // name, pronoun, plural
    res = collect(
      [
        "const fbt = require('fbt');",
        "const IntlVariations = require('IntlVariations');",
        'const gender = IntlVariations.GENDER_FEMALE;',
        "fbt(`${fbt.name('name', 'Sally', gender)} sells ${fbt.pronoun('possessive', gender)} ${fbt.plural('item', 5)}`, 'desc');",
      ].join('\n'),
    );
    expected = {
      type: 'table',
      desc: 'desc',
      jsfbt: {
        m: [
          {
            token: 'name',
            type: 1,
          },
          null,
          null,
        ],
        t: {
          '*': {
            '*': {
              '*': '{name} sells their items',
              _1: '{name} sells their item',
            },
            1: {
              '*': '{name} sells her items',
              _1: '{name} sells her item',
            },
            2: {
              '*': '{name} sells his items',
              _1: '{name} sells his item',
            },
          },
        },
      },
    };
    actual = {};
    Object.keys(expected).map(key => (actual[key] = res.phrases[0][key]));
    expect(actual).toEqual(expected);

    // name, pronoun, plural (react native)
    res = collect(
      [
        "const fbt = require('fbt');",
        "const IntlVariations = require('IntlVariations');",
        'const gender = IntlVariations.GENDER_FEMALE;',
        "fbt(`${fbt.name('name', 'Sally', gender)} sells ${fbt.pronoun('possessive', gender)} ${fbt.plural('item', 5)}`, 'desc');",
      ].join('\n'),
      {
        react_native_mode: true,
      },
    );
    expected = {
      type: 'table',
      desc: 'desc',
      jsfbt: {
        m: [
          {
            token: 'name',
            type: 1,
          },
          {
            type: 3,
          },
          {
            type: 2,
          },
        ],
        t: {
          '*': {
            '*': {
              '*': '{name} sells their items',
              _1: '{name} sells their item',
            },
            1: {
              '*': '{name} sells her items',
              _1: '{name} sells her item',
            },
            2: {
              '*': '{name} sells his items',
              _1: '{name} sells his item',
            },
          },
        },
      },
    };
    actual = {};
    Object.keys(expected).map(key => (actual[key] = res.phrases[0][key]));
    expect(actual).toEqual(expected);
  });

  it('should throw on invalid template use', () => {
    var test = () =>
      collect(
        [
          "const fbt = require('fbt');",
          'const bad = () => {};',
          'fbt(`dont do ${bad()} stuff`, "ok");',
        ].join('\n'),
      );
    expect(test).toThrow();
  });
});
