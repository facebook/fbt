/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @format
 * @oncall i18n_fbt_js
 */

/* eslint-disable fb-www/gender-neutral-language */

jest.autoMockOff();

const {
  jsCodeFbtCallSerializer,
  snapshotTransformKeepJsx,
  withFbtRequireStatement,
} = require('./FbtTestUtil');
const {TestUtil} = require('fb-babel-plugin-utils');

expect.addSnapshotSerializer(jsCodeFbtCallSerializer);

const testData = {
  'should convert simple strings': {
    input: withFbtRequireStatement(
      `var x = <fbt desc="It's simple">A simple string</fbt>;`,
    ),
  },

  'should filter comment and empty expressions from children': {
    input: withFbtRequireStatement(
      `var x = <fbt desc="It's simple">
        {
        }A sim{/*
          ignore
          me
          */}ple s{ }tri{}ng{/*ignore me*/}</fbt>;`,
    ),
  },

  'should strip out newlines': {
    input: withFbtRequireStatement(
      `var x =
        <fbt desc="Test trailing space when not last child">
          Preamble
          <fbt:param name="parm">{blah}</fbt:param>
        </fbt>;
      baz();`,
    ),
  },

  'should strip out newlines in Reactish <Fbt>': {
    input: withFbtRequireStatement(
      `var x =
        <Fbt desc="Test trailing space when not last child">
          Preamble <FbtParam name="parm">{blah}</FbtParam>
        </Fbt>;
      baz();`,
    ),
  },

  'should strip out more newlines': {
    input: withFbtRequireStatement(
      `var x =
        <fbt desc="moar lines">
          A simple string...
          with some other stuff.
        </fbt>;
        baz();`,
    ),
  },

  'Squelch whitespace when in an expression': {
    input: withFbtRequireStatement(
      `var x =
        <fbt desc="squelched">
          {"Squelched white space... "}
          with some
          {' other stuff.'}
        </fbt>;
        baz();`,
    ),
  },

  'Enable explicit whitespace': {
    input: withFbtRequireStatement(
      `var x = <fbt desc="squelched">
        <fbt:param name="one">{one}</fbt:param>
        {" "}
        <fbt:param name="two">{two}</fbt:param>
        {\` \`}
        <fbt:param name="three">{three}</fbt:param>
      </fbt>;`,
    ),
  },

  'should handle params': {
    input: withFbtRequireStatement(
      `var x = <fbt desc="a message!">
          A parameterized message to:
          <fbt:param name="personName">{theName}</fbt:param>
        </fbt>;`,
    ),
  },

  'should handle empty string': {
    input: withFbtRequireStatement(
      `var x = <fbt desc="a message!">
        A parameterized message to:
        <fbt:param name="emptyString"> </fbt:param>
      </fbt>;`,
    ),
  },

  'should handle concatenated descriptions': {
    input: withFbtRequireStatement(
      `<fbt desc={"A very long description " + "that we will concatenate " +
        "a few times"}
        project={"With" + "a" + "project"}>
        Here it is
      </fbt>;`,
    ),
  },

  'should handle template descriptions': {
    input: withFbtRequireStatement(
      `<fbt desc={\`A very long description
        that will be a
        template across multiple lines\`}
        project={"With" + "a" + "project"}>
        Here it is
      </fbt>;`,
    ),
  },

  'should be able to nest within React nodes': {
    input: withFbtRequireStatement(
      `var x = <div>
        <fbt desc="nested!">
          A nested string
        </fbt>
      </div>;`,
    ),
  },

  'should be able to house arbitrary markup within fbt:param nodes': {
    input: withFbtRequireStatement(
      `<div>
        <fbt desc="...">
          <fbt:param name="time">{formatDate(date, "F d, Y")}</fbt:param>
           by
          <fbt:param name="user name">
            <Link href={{url:user.link}}>
              {user.name}
            </Link>
          </fbt:param>
        </fbt>
      </div>;`,
    ),
  },

  'should handle enums (with array values)': {
    input: withFbtRequireStatement(
      `var x = <fbt desc="enums!">
        Click to see
        <fbt:enum
          enum-range={[
            "groups",
            "photos",
            "videos"
          ]}
          value={id}
        />
      </fbt>;`,
    ),
  },

  'should handle enums (with object values)': {
    input: withFbtRequireStatement(
      `var x = <fbt desc="enums!">
        Click to see
        <fbt:enum
          enum-range={{
            id1: "groups",
            id2: "photos",
            id3: "videos"
          }}
          value={id}
        />
      </fbt>;`,
    ),
  },

  'should handle enums with more text': {
    input: withFbtRequireStatement(
      `var x = <fbt desc="enums!">
        Click to see
        <fbt:enum
          enum-range={{
            id1: "groups",
            id2: "photos",
            id3: "videos"
          }}
          value={id}
        />
        Hey-hey!
      </fbt>;`,
    ),
  },

  'should handle variations': {
    input: withFbtRequireStatement(
      `var x = <fbt desc="variations!">
        Click to see
        <fbt:param name="count" number="true">{c}</fbt:param>
        links
      </fbt>;`,
    ),
  },

  'should handle number={true} - (same output as above test)': {
    input: withFbtRequireStatement(
      `var x = <fbt desc="variations!">
        Click to see
        <fbt:param name="count" number={true}>{c}</fbt:param>
        links
      </fbt>;`,
    ),
  },

  'should correctly destruct expression values in options': {
    input: withFbtRequireStatement(
      `<fbt desc="d">str
        <fbt:param name="count" number={someNum}>
          {getNum()}
        </fbt:param>
      </fbt>`,
    ),
  },

  'should insert param value for same-param': {
    input: withFbtRequireStatement(
      `<fbt desc="d">str
        <fbt:param name="foo">{Bar}</fbt:param> and
        <fbt:same-param name="foo"/>
      </fbt>`,
    ),
  },

  'should treat multiline descs as a single line': {
    input: withFbtRequireStatement(
      `<fbt desc="hi how are you today im doing well i guess
        how is your mother is she well yeah why not lets go
        home and never come back.">
        lol
      </fbt>`,
    ),
  },

  'should not insert extra space': {
    input: withFbtRequireStatement(
      `<fbt desc="Greating in i18n demo">
        Hello, <fbt:param name="guest">
          {guest}
        </fbt:param>!
      </fbt>`,
    ),
  },

  'should handle single expression with concentated strings': {
    input: withFbtRequireStatement(
      `<fbt desc="foo">
        {"foo" + "bar"}
      </fbt>`,
    ),
  },

  'should throw on invalid attributes in fbt:param': {
    input: withFbtRequireStatement(
      `<fbt desc="some-desc">
        <fbt:param name="foo" qux="foo" desc="foo-desc">
          {foo}
        </fbt:param>
      </fbt>`,
    ),

    throws: `Invalid option "qux". Only allowed: number, gender, name`,
  },

  'should ignore __private attributes': {
    input: withFbtRequireStatement(
      `<fbt __self="fbt" desc="some-desc">
        <fbt:param __self="param" name="foo">
          {foo}
        </fbt:param>
      </fbt>`,
    ),
  },

  'should ignore non-expression children in fbt:param': {
    input: withFbtRequireStatement(
      `<fbt desc="some-desc">
        <fbt:param name="foo">
          !{foo}!
        </fbt:param>
      </fbt>`,
    ),
  },

  'should maintain order of params and enums': {
    input: withFbtRequireStatement(
      `<fbt desc="some-desc">
        Hello,
        <fbt:param name="foo">
          {foo}
        </fbt:param>
        <fbt:enum enum-range={["x", "y"]} value={x} />
        <fbt:param name="bar" number={n}>
          {bar}
        </fbt:param>
      </fbt>`,
    ),
  },

  'should support html escapes': {
    input: withFbtRequireStatement(
      `<fbt desc="foo &quot;bar&quot;">&times;</fbt>`,
    ),
  },

  'should support non-breasking space character': {
    // multiple spaces are normalized to a single space
    // but &nbsp characters are preserved
    input: withFbtRequireStatement(
      `<fbt desc="desc with    non-breaking&nbsp;&nbsp;&nbsp;space">
          text with    non-breaking&nbsp;&nbsp;&nbsp;space
      </fbt>`,
    ),
  },

  'should support unicode characters': {
    input: withFbtRequireStatement(
      `// A backslash \\ in comments
      <fbt desc="unicode characters">
        A copyright sign {'\\u00A9'},
        a multi byte character {'\\uD83D\\uDCA9'},
        and a backslash {'\\\\'}.
      </fbt>`,
    ),
  },

  'should handle object pronoun': {
    input: withFbtRequireStatement(
      `<fbt desc={"d"} project={"p"}>
          I know <fbt:pronoun type="object" gender={gender}/>.
        </fbt>;`,
    ),
  },

  'should handle object pronoun (react native)': {
    input: withFbtRequireStatement(
      `<fbt desc={"d"} project={"p"}>
          I know <fbt:pronoun type="object" gender={gender}/>.
        </fbt>;`,
    ),

    options: {
      reactNativeMode: true,
    },
  },

  'should handle subject+reflexive pronouns': {
    input:
      // She wished herself a happy birthday.
      withFbtRequireStatement(
        `<fbt desc={"d"} project={"p"}>
          <fbt:pronoun type="subject" gender={gender} capitalize={true} human={true}/>
          wished <fbt:pronoun type="reflexive" gender={gender} human={true}/> a happy birthday.
        </fbt>;`,
      ),
  },

  'should handle subject+reflexive pronouns (react native)': {
    input:
      // She wished herself a happy birthday.
      withFbtRequireStatement(
        `<fbt desc={"d"} project={"p"}>
          <fbt:pronoun type="subject" gender={gender} capitalize={true} human={true}/>
          wished
          <fbt:pronoun type="reflexive" gender={gender} human={true}/>
          a happy birthday.
        </fbt>;`,
      ),

    options: {
      reactNativeMode: true,
    },
  },

  'fbt:param with multiple children should error': {
    input: withFbtRequireStatement(
      `<fbt desc="some-desc">
        <fbt:param name="foo">
          {foo}
          {bar}
        </fbt:param>
      </fbt>`,
    ),

    throws: `fbt:param expects an {expression} or JSX element, and only one`,
  },

  'fbt:param with multiple empty expression containers should be ok': {
    input: withFbtRequireStatement(
      `<fbt desc="some-desc">
        <fbt:param name="foo">
          {}
          {/* comment */}
          {foo}
          {}
        </fbt:param>
      </fbt>`,
    ),
  },

  'should handle common string': {
    input: withFbtRequireStatement(`<fbt common={true}>Done</fbt>`),

    options: {
      fbtCommon: {Done: 'The description for the common string "Done"'},
    },
  },

  'should throw for strings with `common` attribute equal to false': {
    input: withFbtRequireStatement(`<fbt common={false}>Yes</fbt>`),

    options: {
      fbtCommon: {Yes: 'The description for the common string "Yes"'},
    },

    throws: `Unable to find attribute \"desc\".`,
  },

  'should throw on undefined common string': {
    input: withFbtRequireStatement(
      `<fbt common={true}>Some undefined common string</fbt>`,
    ),

    options: {},

    throws: `Unknown string \"Some undefined common string\" for <fbt common={true}>`,
  },

  'should handle fbt common attribute without value': {
    input: withFbtRequireStatement(`<fbt common>Okay</fbt>`),

    options: {
      fbtCommon: {Okay: 'The description for the common string "Okay"'},
    },
  },

  'should throw for fbt that has description and common attribute (without value)':
    {
      input: withFbtRequireStatement(`<fbt common={true} desc='d'>No</fbt>`),

      options: {fbtCommon: {No: 'The description for the common string "No"'}},

      throws: `<fbt common={true}> must not have \"desc\" attribute`,
    },
};

describe('Test declarative (jsx) fbt syntax translation', () =>
  TestUtil.testSection(testData, snapshotTransformKeepJsx, {
    matchSnapshot: true,
  }));

describe('Test fbt transforms without the jsx transform', () => {
  it('not nested', () => {
    expect(
      snapshotTransformKeepJsx(`
        const fbt = require("fbt");
        let x =
          <fbt desc="nested!">
            A nested string
          </fbt>;
      `),
    ).toMatchSnapshot(); // Should be like fbt._()
  });

  it('nested in div', () => {
    expect(
      snapshotTransformKeepJsx(`
        const fbt = require("fbt");
        let x =
          <div>
            <fbt desc="nested!">
              A nested string
            </fbt>
          </div>;
      `),
    ).toMatchSnapshot(); // Should be like <div>{fbt._()}</div>
  });

  it('short bool syntax for doNotExtract attribute', () => {
    expect(
      snapshotTransformKeepJsx(`
        const fbt = require("fbt");
        let x = <fbt desc="" doNotExtract>Test</fbt>;
      `),
    ).toMatchSnapshot();
  });

  it('short bool syntax for number attribute', () => {
    expect(
      snapshotTransformKeepJsx(`
        const fbt = require("fbt");
        let x =
          <fbt desc="">
            <fbt:param name="name" number>{'name'}</fbt:param>
          </fbt>;
      `),
    ).toMatchSnapshot();
  });

  describe('when using within template literals', () => {
    it('should work with a basic <fbt>', () => {
      expect(
        snapshotTransformKeepJsx(`
          const fbt = require("fbt");
          html\`<div>
            \${
              <fbt desc="some desc" project="some project">
                basic text
              </fbt>
            }
          </div>\`;
        `),
      ).toMatchSnapshot();
    });

    it('should work with basic <fbt> auto-parameterization', () => {
      expect(
        snapshotTransformKeepJsx(`
          const fbt = require("fbt");
          html\`<div>
            \${
              <fbt desc="some desc" project="some project">
                outer text
                <strong>
                  bold text
                </strong>
              </fbt>
            }
          </div>\`;
        `),
      ).toMatchSnapshot();
    });

    it('should dedupe plurals', () => {
      expect(
        snapshotTransformKeepJsx(`
          const fbt = require("fbt");
          <fbt desc="desc...">
            There
            <fbt:plural count={num} many="are">is</fbt:plural>{' '}
            <fbt:plural count={num} showCount="yes" value={hi()}>
              photo
            </fbt:plural>.
          </fbt>
        `),
      ).toMatchSnapshot();
    });

    it('should work with a nested <fbt> within an <fbt:param>', () => {
      expect(
        snapshotTransformKeepJsx(`
          const fbt = require("fbt");
          html\`<div>
            \${
              <fbt desc="some desc" project="some project">
                outer text
                <fbt:param name="param text">
                  {
                    html\`<strong>
                      \${
                        <fbt desc="inner string">
                          inner text
                          <fbt:param name="inner param">
                            {'bold'}
                          </fbt:param>
                        </fbt>
                      }
                    </strong>\`
                  }
                </fbt:param>
              </fbt>
            }
          </div>\`;
        `),
      ).toMatchSnapshot();
    });
  });

  // TODO(T94644387) fix preserving whitespace for JSX text
  it('should fail to preserve whitespace in text when preserveWhitespace=true (known bug)', () => {
    expect(
      snapshotTransformKeepJsx(`
        const fbt = require('fbt');
        <fbt desc="desc with 3   spaces" preserveWhitespace={true}>
          Some text with 3   spaces in between.
        </fbt>;
      `),
    ).toMatchSnapshot();
  });

  // TODO(T78914132): actually, we should NOT insert a space between two <fbt:plural>
  // that don't neighbor raw text to match Hack fbt parity.
  // But there's not much point fixing this before the fbt autoparam work.
  // See Hack fbt equivalent: https://fburl.com/intl/zkacwqtj
  // See also JS fbt fiddle: https://fburl.com/intl/ha5dryng
  it(`[legacy buggy behavior] <fbt:pronoun> should insert a space character between two fbt constructs that don't neighbor raw text`, () =>
    expect(
      snapshotTransformKeepJsx(`
        const fbt = require("fbt");
        <fbt desc="">
          You can add
          <fbt:plural count={count} many="these">
            this
          </fbt:plural>
          <fbt:plural count={count} many="tags">
            tag
          </fbt:plural>
          to anything.
        </fbt>
      `),
    ).toMatchSnapshot());
});

describe(
  'Test common fbt with value-less `common` attribute should have same ' +
    'runtime call as the regular common fbt',
  () => {
    const options = {
      fbtCommon: {Submit: 'The description for the common string "Submit"'},
    };
    expect(
      snapshotTransformKeepJsx(
        `
        const fbt = require("fbt");
        let x = <fbt common>Submit</fbt>;
      `,
        options,
      ),
    ).toEqual(
      snapshotTransformKeepJsx(
        `
        const fbt = require("fbt");
        let x = <fbt common={true}>Submit</fbt>;
      `,
        options,
      ),
    );
  },
);
