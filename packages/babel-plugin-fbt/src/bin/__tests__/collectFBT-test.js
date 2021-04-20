/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 */

'use strict';

const {packagerTypes} = require('../collectFbtConstants');
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
      '--packager=' + (options.packagerType ?? packagerTypes.NONE),
      '--fbt-common-path=' + commonPath,
    ];
    if (options.react_native_mode) {
      collectOptions.push('--react-native-mode');
    }
    if (options.genOuterTokenName) {
      collectOptions.push('--gen-outer-token-name');
    }
    if (options.genFbtNodes) {
      collectOptions.push('--gen-fbt-nodes');
    }
    if (options.customCollector) {
      collectOptions.push('--custom-collector', options.customCollector);
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
    expect(res).toMatchSnapshot();
  });

  it('should still extract strings if file-level doNotExtract is set to false', () => {
    var res = collect(
      [
        '// @fbt {"project": "someproject", "doNotExtract": false}',
        "const fbt = require('fbt');",
        '<fbt desc="foo">bar</fbt>',
      ].join('\n'),
    );
    expect(res).toMatchSnapshot();
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

  it('should still extract strings when in-line doNotExtract is set to false despite the file-level has doNotExtract set to true', () => {
    var res = collect(
      [
        '// @fbt {"project": "someproject", "doNotExtract": true}',
        "const fbt = require('fbt');",
        '<fbt desc="foo" doNotExtract="false">bar</fbt>',
      ].join('\n'),
    );

    expect(res.phrases.length).toEqual(1);
  });

  it('should still extract strings if in-line doNotExtract is set to false', () => {
    var res = collect(
      [
        "const fbt = require('fbt');",
        '<fbt desc="foo" doNotExtract="false">bar</fbt>',
      ].join('\n'),
    );

    expect(res).toMatchSnapshot();
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

    expect(res).toMatchSnapshot();
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

    expect(res).toMatchSnapshot();
  });

  it('should extract common strings', () => {
    var res = collect(
      "const fbt = require('fbt');<fbt common={true}>Required</fbt>;",
    );

    expect(res).toMatchSnapshot();
  });

  it('should extract fbt.c strings', () => {
    var res = collect("const fbt = require('fbt');fbt.c('Required');");

    expect(res).toMatchSnapshot();
  });

  // TODO(T40113359): re-enable these tests once the fbt runtime callsites have been implemented
  xit('should dedupe fbt:plurals', () => {
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

    expect(res).toMatchSnapshot();
  });

  describe('When using string templates', () => {
    it('should extract correctly with just string contents', () => {
      const res = collect(
        [
          "const fbt = require('fbt');",
          'const uh = 0;',
          'fbt(`simple`, "ok");',
        ].join('\n'),
      );

      expect(res).toMatchSnapshot();
    });

    it('should extract correctly with a param', () => {
      const res = collect(
        [
          "const fbt = require('fbt');",
          'const uh = 0;',
          'fbt(`testing ${fbt.param("it", uh)} works`, "great");',
        ].join('\n'),
      );

      expect(res).toMatchSnapshot();
    });

    it('should extract correctly with the param being first', () => {
      const res = collect(
        [
          "const fbt = require('fbt');",
          'const uh = 0;',
          'fbt(`${fbt.param("it", uh)} still works`, "well");',
        ].join('\n'),
      );

      expect(res).toMatchSnapshot();
    });

    it('should extract correctly multiple params', () => {
      const res = collect(
        [
          "const fbt = require('fbt');",
          'const uh = 0;',
          'fbt(`${fbt.param("1", uh)} ${fbt.param("2", uh)} ${fbt.sameParam("3")} 4`, "counting");',
        ].join('\n'),
      );

      expect(res).toMatchSnapshot();
    });

    // TODO(T40113359): re-enable these tests once the fbt runtime callsites have been implemented
    xit('should extract correctly supports tables ie fbt:enum', () => {
      const res = collect(
        [
          "const fbt = require('fbt');",
          'const uh = 0;',
          "fbt(`${fbt.enum(uh, {0:'a', 1:'b'})} ${fbt.param(\"2\", uh)}\n" +
            '${fbt.sameParam("3")} 4`, "counting");',
        ].join('\n'),
      );
      expect(res).toMatchSnapshot();
    });

    // TODO(T40113359): re-enable these tests once the fbt runtime callsites have been implemented
    xit('should extract correctly name, pronoun, plural', () => {
      const res = collect(
        [
          "const fbt = require('fbt');",
          "const IntlVariations = require('IntlVariations');",
          'const gender = IntlVariations.GENDER_FEMALE;',
          "fbt(`${fbt.name('name', 'Sally', gender)} sells ${fbt.pronoun('possessive', gender)} ${fbt.plural('item', 5)}`, 'desc');",
        ].join('\n'),
      );
      expect(res).toMatchSnapshot();
    });

    // TODO(T40113359): re-enable these tests once the fbt runtime callsites have been implemented
    xit('should extract correctly name, pronoun, plural (react native)', () => {
      const res = collect(
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
      expect(res).toMatchSnapshot();
    });
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

  it('should extract strings from a custom collector', () => {
    expect(
      collect('nothing in JS code', {
        customCollector: path.resolve(__dirname, 'CustomFbtCollector.js'),
      }),
    ).toMatchSnapshot();
  });

  // TODO(T40113359): re-enable these tests once the fbt runtime callsites have been implemented
  xit('should expose the outer token names if needed', () => {
    expect(
      collect(
        `const fbt = require('fbt');
        <fbt desc="Expose outer token name when script option is given">
          Hello
          <i>World</i>
        </fbt>`,
        {
          genOuterTokenName: true,
        },
      ),
    ).toMatchSnapshot();
  });

  // TODO(T40113359): re-enable these tests once the fbt runtime callsites have been implemented
  xit('should not expose the outer token names by default', () => {
    expect(
      collect(
        `const fbt = require('fbt');
        <fbt desc="Do not expose outer token name by default">
          Hello
          <i>World</i>
        </fbt>`,
        {},
      ),
    ).toMatchSnapshot();
  });

  describe('fbt nodes:', () => {
    // TODO(T40113359): re-enable these tests once the fbt runtime callsites have been implemented
    xit('should expose the FbtElementNodes when needed', () => {
      const ret = collect(
        `const fbt = require('fbt');
          <fbt desc="some desc">
            This is a
            <a className="neatoLink" href="https://somewhere.random" tabindex={123} id={"uniq"}>
              link
            </a>
          </fbt>`,
        {packagerType: packagerTypes.TEXT, genFbtNodes: true},
      );

      const {fbtElementNodes} = ret;

      // Check overall data structure
      expect(ret).toMatchSnapshot();

      // Check some core data integrity
      expect(fbtElementNodes.length).toBe(1);
      expect(fbtElementNodes[0].children[1].phraseIndex).toBe(1);
      expect(fbtElementNodes[0].phraseIndex).toBe(0);
      expect(ret.childParentMappings).toEqual({1: 0});
      expect(ret.phrases.length).toBe(2);
    });

    // TODO(T40113359): re-enable these tests once the fbt runtime callsites have been implemented
    xit('should expose the FbtElementNodes where there are two nested React elements', () => {
      const ret = collect(
        `const fbt = require('fbt');
        <fbt desc="example 1">
          <fbt:param name="name" gender={this.state.ex1Gender}>
            <b className="padRight">{this.state.ex1Name}</b>
          </fbt:param>
          has shared
          <a className="neatoLink" href="#" tabindex={123} id={"uniq"}>
            <strong>
              <fbt:plural
                many="photos"
                showCount="ifMany"
                count={this.state.ex1Count}>
                a photo
              </fbt:plural>
            </strong>
          </a>
          with you
        </fbt>;`,
        {packagerType: packagerTypes.TEXT, genFbtNodes: true},
      );

      const {fbtElementNodes} = ret;

      // Check overall data structure
      expect(ret).toMatchSnapshot();

      // Check some core data integrity
      expect(fbtElementNodes.length).toBe(1);
      expect(fbtElementNodes[0].children[2].phraseIndex).toBe(1);
      expect(fbtElementNodes[0].phraseIndex).toBe(0);
      expect(ret.childParentMappings).toEqual({
        1: 0,
        2: 1,
      });
      expect(ret.phrases.length).toBe(3);
    });
  });
});
