/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

const {packagerTypes} = require('../collectFbtConstants');
const {
  buildCollectFbtOutput,
  getFbtCollector,
  getPackagers,
} = require('../collectFbtUtils');
const fs = require('graceful-fs');
const path = require('path');
const fbtCommonPath = path.resolve(__dirname, 'FbtCommonForTests.json');

describe('collectFbt', () => {
  function collect(source, options = {}) {
    const opts = {
      generateOuterTokenName: options.genOuterTokenName,
      plugins: [],
      presets: [],
      reactNativeMode: options.react_native_mode,
      transform: null,
      fbtCommonPath,
    };
    const fbtCollector = getFbtCollector(opts, {}, options.customCollector);
    const packager = options.packagerType ?? packagerTypes.NONE;
    const packagers = getPackagers(
      packager,
      path.join(__dirname, '../md5Texts'),
    );
    if (options.multipleFiles) {
      fs.hasOwnProperty = () => Object.hasOwnProperty; // For jest.spyOn
      jest.spyOn(fs, 'readFileSync').mockImplementation(path => source[path]);
      fbtCollector.collectFromFiles(Object.keys(source));
    } else {
      fbtCollector.collectFromOneFile(source);
    }
    const output = buildCollectFbtOutput(fbtCollector, packagers, {
      terse: options.terse,
      genFbtNodes: options.genFbtNodes,
    });
    // Mimic collectFbt output: strip undefined fields, and normalize objects
    return JSON.parse(JSON.stringify(output));
  }

  it('should extract fbt strings', () => {
    const res = collect(
      'const fbt = require(\'fbt\');<fbt desc="foo">bar</fbt>',
    );
    expect(res).toMatchSnapshot();
  });

  it('should extract fbs strings', () => {
    const res = collect(
      'const fbs = require(\'fbs\');<fbs desc="foo">bar</fbs>',
    );
    expect(res).toMatchSnapshot();
  });

  it('should extract the author from Docblock', () => {
    const res = collect(
      [
        '// @fbt {"project": "someproject", "author": "Sponge Bob"}',
        "const fbt = require('fbt');",
        '<fbt desc="foo">bar</fbt>',
      ].join('\n'),
    );
    expect(res).toMatchSnapshot();
  });

  it('should still extract strings if file-level doNotExtract is set to false', () => {
    const res = collect(
      [
        '// @fbt {"project": "someproject", "doNotExtract": false}',
        "const fbt = require('fbt');",
        '<fbt desc="foo">bar</fbt>',
      ].join('\n'),
    );
    expect(res).toMatchSnapshot();
  });

  it('should not extract strings if file-level doNotExtract is set to true', () => {
    const res = collect(
      [
        '// @fbt {"project": "someproject", "doNotExtract": true}',
        "const fbt = require('fbt');",
        '<fbt desc="foo">bar</fbt>',
      ].join('\n'),
    );

    expect(res.phrases.length).toEqual(0);
  });

  it('should still extract strings when in-line doNotExtract is set to false despite the file-level has doNotExtract set to true', () => {
    const res = collect(
      [
        '// @fbt {"project": "someproject", "doNotExtract": true}',
        "const fbt = require('fbt');",
        '<fbt desc="foo" doNotExtract="false">bar</fbt>',
      ].join('\n'),
    );

    expect(res.phrases.length).toEqual(1);
  });

  it('should still extract strings if in-line doNotExtract is set to false', () => {
    const res = collect(
      [
        "const fbt = require('fbt');",
        '<fbt desc="foo" doNotExtract="false">bar</fbt>',
      ].join('\n'),
    );

    expect(res).toMatchSnapshot();
  });

  it('should not extract strings if in-line doNotExtract is set to true', () => {
    const res = collect(
      [
        "const fbt = require('fbt');",
        '<fbt desc="foo" doNotExtract="true">bar</fbt>',
      ].join('\n'),
    );

    expect(res.phrases.length).toEqual(0);
  });

  it('should still extract strings if fbt call param doNotExtract is set to false', () => {
    const res = collect(
      [
        "const fbt = require('fbt');",
        'fbt("bar", "foo", {doNotExtract: false});',
      ].join('\n'),
    );

    expect(res).toMatchSnapshot();
  });

  it('should not extract strings if fbt call param doNotExtract is set to true', () => {
    const res = collect(
      [
        "const fbt = require('fbt');",
        'fbt("bar", "foo", {doNotExtract: true});',
      ].join('\n'),
    );

    expect(res.phrases.length).toEqual(0);
  });

  it('should not throw because of CSX', () => {
    const res = collect(
      [
        "const fbt = require('fbt');",
        '/**@csx*/',
        '<fbt desc="foo">bar</fbt>;',
        '<Foo options:key="bar" />',
      ].join('\n'),
    );

    expect(res).toMatchSnapshot();
  });

  it('should extract common strings from <fbt common={true}>', () => {
    const res = collect(`
      const fbt = require('fbt');
      <fbt common={true}>Required</fbt>;
    `);

    expect(res).toMatchSnapshot();
  });

  it('should extract fbt.c strings', () => {
    const res = collect(`
      const fbt = require('fbt');
      fbt.c('Required');
    `);

    expect(res).toMatchSnapshot();
  });

  it('should dedupe fbt:plurals', () => {
    const res = collect(
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
          'fbt(`${fbt.param("1", uh)} ${fbt.param("2", uh)} ${fbt.sameParam("2")} 3`, "counting");',
        ].join('\n'),
      );

      expect(res).toMatchSnapshot();
    });

    it('should extract correctly supports tables ie fbt:enum', () => {
      const res = collect(
        [
          "const fbt = require('fbt');",
          'const uh = 0;',
          "fbt(`${fbt.enum(uh, {0:'a', 1:'b'})} ${fbt.param(\"2\", uh)}\n" +
            '${fbt.sameParam("2")} 3`, "counting");',
        ].join('\n'),
      );
      expect(res).toMatchSnapshot();
    });

    it('should extract correctly name, pronoun, plural', () => {
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

    it('should extract correctly name, pronoun, plural (react native)', () => {
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
    const test = () =>
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

  it('should expose the outer token names if needed', () => {
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

  it('should not expose the outer token names by default', () => {
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

  it('should expose the subject option on top level and inner phrases', () => {
    expect(
      collect(
        `const fbt = require('fbt');
        <fbt desc="expose subject" subject={aSubject}>
          You
          <i>see the world</i>
        </fbt>`,
        {},
      ),
    ).toMatchSnapshot();
  });

  it('should create correct child parent mapping for multiple files', () => {
    expect(
      collect(
        {
          'example1.react.js': `
            const fbt = require('fbt');
            <fbt desc="some desc">
              This is a{' '}
              <b>
                bold with <i>italic inside</i>
              </b>.
            </fbt>`,
          './example2.react.js.in': `
            const fbt = require('fbt');
            <fbt desc="some desc">
              Link:
              <a href="https://somewhere.random">link</a>
            </fbt>`,
        },
        {
          multipleFiles: true,
        },
      ),
    ).toMatchSnapshot();
  });

  describe('fbt nodes:', () => {
    it('should expose the FbtElementNodes when needed', () => {
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

    it('should expose the FbtElementNodes where there are two nested React elements', () => {
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
