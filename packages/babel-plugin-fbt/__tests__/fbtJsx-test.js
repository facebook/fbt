/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 */

jest.autoMockOff();

const {
  payload,
  transform,
  transformKeepJsx,
  withFbtRequireStatement,
} = require('../FbtTestUtil');
const {FbtVariationType} = require('../translate/IntlVariations');
const {TestUtil} = require('fb-babel-plugin-utils');

const testData = {
  'should convert simple strings': {
    input: withFbtRequireStatement(
      `var x = <fbt desc="It's simple">A simple string</fbt>;`,
    ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'A simple string',
          desc: "It's simple",
        })}
      );`,
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

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'A simple string',
          desc: "It's simple",
        })}
      );`,
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

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'Preamble {parm}',
          desc: 'Test trailing space when not last child',
        })}, [
          fbt._param("parm",blah)
        ]
      );
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

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'Preamble {parm}',
          desc: 'Test trailing space when not last child',
        })}, [
          fbt._param("parm",blah)
        ]);
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

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'A simple string... with some other stuff.',
          desc: 'moar lines',
        })});
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

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'Squelched white space... with some other stuff.',
          desc: 'squelched',
        })});
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

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'text',
          jsfbt: '{one} {two} {three}',
          desc: 'squelched',
        })}, [
          fbt._param("one",one),
          fbt._param("two",two),
          fbt._param("three",three)
        ]);`,
    ),
  },

  'should handle params': {
    input: withFbtRequireStatement(
      `var x = <fbt desc="a message!">
          A parameterized message to:
          <fbt:param name="personName">{theName}</fbt:param>
        </fbt>;`,
    ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'A parameterized message to: {personName}',
          desc: 'a message!',
        })}, [
          fbt._param("personName",theName)
        ]);`,
    ),
  },

  'should handle empty string': {
    input: withFbtRequireStatement(
      `var x = <fbt desc="a message!">
        A parameterized message to:
        <fbt:param name="emptyString"> </fbt:param>
      </fbt>;`,
    ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'A parameterized message to: {emptyString}',
          desc: 'a message!',
        })}, [
          fbt._param("emptyString", ' ')
        ]);`,
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

    output: withFbtRequireStatement(
      `fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'Here it is',
          desc: 'A very long description that we will concatenate a few times',
          project: 'Withaproject',
        })}
      );`,
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

    output: withFbtRequireStatement(
      `fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'Here it is',
          desc:
            'A very long description that will be a template across multiple lines',
          project: 'Withaproject',
        })}
      );`,
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

    output: withFbtRequireStatement(
      `var x = React.createElement("div", null, fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'A nested string',
          desc: 'nested!',
        })}
      ));`,
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

    output: withFbtRequireStatement(
      `React.createElement("div", null,
        fbt._(
          ${payload({
            type: 'text',
            jsfbt: '{time} by {user name}',
            desc: '...',
          })}, [
          fbt._param("time",formatDate(date, "F d, Y")),
          fbt._param("user name",
          React.createElement(Link, {href: {url:user.link}},
            user.name
          ))
        ])
      );`,
    ),
  },

  'should handle enums (with array values)': {
    input: withFbtRequireStatement(
      `var x = <fbt desc="enums!">
        Click to see
        <fbt:enum enum-range={{
          id1:"groups",
          id2:"photos",
          id3:"videos"}}
          value={id}
        />
      </fbt>;`,
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
        })}, [
          fbt._enum(id, {"id1":"groups","id2":"photos","id3":"videos"})
        ]
      );`,
    ),
  },

  'should handle enums with more text': {
    input: withFbtRequireStatement(
      `var x = <fbt desc="enums!">
        Click to see
        <fbt:enum enum-range={{
          id1:"groups",
          id2:"photos",
          id3:"videos"}}
          value={id}
        />
        Hey-hey!
      </fbt>;`,
    ),

    output: withFbtRequireStatement(
      `var x = fbt._(
        ${payload({
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
        })}, [
          fbt._enum(id, {"id1":"groups","id2":"photos","id3":"videos"})
        ]
      );`,
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
        })}, [
          fbt._param("count", c, [0])
        ]
      );`,
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
        })},[
          fbt._param("count", c, [0])
        ]
      );`,
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

    output: withFbtRequireStatement(
      `fbt._(
        ${payload({
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
        })}, [
          fbt._param("count", getNum(), [0, someNum])
        ]
      )`,
    ),
  },

  'should insert param value for same-param': {
    input: withFbtRequireStatement(
      `<fbt desc="d">str
        <fbt:param name="foo">{Bar}</fbt:param> and
        <fbt:same-param name="foo"/>
      </fbt>`,
    ),

    output: withFbtRequireStatement(
      `fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'str {foo} and {foo}',
          desc: 'd',
        })}, [
          fbt._param("foo",Bar)
        ]
      )`,
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

    output: withFbtRequireStatement(
      `fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'lol',
          desc:
            'hi how are you today im doing well i guess how is your ' +
            'mother is she well yeah why not lets go home and never come back.',
        })}
      )`,
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

    output: withFbtRequireStatement(
      `fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'Hello, {guest}!',
          desc: 'Greating in i18n demo',
          project: '',
        })}, [
          fbt._param("guest", guest)
        ]
      )`,
    ),
  },

  'should handle single expression with concentated strings': {
    input: withFbtRequireStatement(
      `<fbt desc="foo">
        {"foo" + "bar"}
      </fbt>`,
    ),

    output: withFbtRequireStatement(
      `fbt._(
        ${payload({
          type: 'text',
          jsfbt: 'foobar',
          desc: 'foo',
          project: '',
        })})`,
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

    throws: true,
  },

  'should ignore non-expression children in fbt:param': {
    input: withFbtRequireStatement(
      `<fbt desc="some-desc">
        <fbt:param name="foo">
          !{foo}!
        </fbt:param>
      </fbt>`,
    ),

    output: withFbtRequireStatement(
      `fbt._(
        ${payload({
          type: 'text',
          jsfbt: '{foo}',
          desc: 'some-desc',
        })}, [fbt._param("foo", foo)]);`,
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

    output: withFbtRequireStatement(
      `fbt._(
        ${payload({
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
        })}, [
          fbt._param("foo", foo),
          fbt._enum(x, {"x": "x", "y": "y"}),
          fbt._param("bar", bar, [0, n])
        ]
      );`,
    ),
  },

  'should support html escapes': {
    input: withFbtRequireStatement(
      `<fbt desc="foo &quot;bar&quot;">&times;</fbt>`,
    ),

    output: withFbtRequireStatement(
      `fbt._(
        ${payload({
          type: 'text',
          jsfbt: '\xD7',
          desc: 'foo "bar"',
          project: '',
        })})`,
    ),
  },

  'should handle object pronoun': {
    input: withFbtRequireStatement(
      `<fbt desc={"d"} project={"p"}>
          I know <fbt:pronoun type="object" gender={gender}/>.
        </fbt>;`,
    ),

    output: withFbtRequireStatement(
      `fbt._(
        ${payload({
          type: 'table',
          jsfbt: {
            t: {
              '0': 'I know this.',
              '1': 'I know her.',
              '2': 'I know him.',
              '*': 'I know them.',
            },
            m: [null],
          },
          desc: 'd',
          project: 'p',
        })}, [
          fbt._pronoun(0, gender)
        ]
      );`,
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

    output: withFbtRequireStatement(
      `fbt._(
        ${payload({
          type: 'table',
          jsfbt: {
            t: {
              '0': 'I know this.',
              '1': 'I know her.',
              '2': 'I know him.',
              '*': 'I know them.',
            },
            m: [
              {
                type: FbtVariationType.PRONOUN,
              },
            ],
          },
          desc: 'd',
          project: 'p',
        })}, [
          fbt._pronoun(0, gender)
        ]
      );`,
    ),
  },

  'should handle subject+reflexive pronouns': {
    input:
      // eslint-disable-next-line fb-www/gender-neutral-language
      // She wished herself a happy birthday.
      withFbtRequireStatement(
        `<fbt desc={"d"} project={"p"}>
          <fbt:pronoun type="subject" gender={gender} capitalize={true} human={true}/>
          wished <fbt:pronoun type="reflexive" gender={gender} human={true}/> a happy birthday.
        </fbt>;`,
      ),

    output: withFbtRequireStatement(
      `fbt._(
        ${payload({
          type: 'table',
          jsfbt: {
            t: {
              '1': {
                '1': 'She wished herself a happy birthday.',
              },
              '2': {
                '2': 'He wished himself a happy birthday.',
              },
              '*': {
                '*': 'They wished themselves a happy birthday.',
              },
            },
            m: [null, null],
          },
          desc: 'd',
          project: 'p',
        })},
        [
          fbt._pronoun(3, gender, {human: 1}),
          fbt._pronoun(2, gender, {human: 1}),
        ]
      );`,
    ),
  },

  'should handle subject+reflexive pronouns (react native)': {
    input:
      // eslint-disable-next-line fb-www/gender-neutral-language
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

    output: withFbtRequireStatement(
      `fbt._(
        ${payload({
          type: 'table',
          jsfbt: {
            t: {
              '1': {
                '1': 'She wished herself a happy birthday.',
              },
              '2': {
                '2': 'He wished himself a happy birthday.',
              },
              '*': {
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
        })}, [
          fbt._pronoun(3, gender, {human: 1}),
          fbt._pronoun(2, gender, {human: 1}),
        ]
      );`,
    ),
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

    throws: true,
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

    output: withFbtRequireStatement(
      `fbt._(
        ${payload({
          type: 'text',
          jsfbt: '{foo}',
          desc: 'some-desc',
        })}, [
          fbt._param("foo", foo)
        ]
      )`,
    ),
  },
};

describe('Test declarative (jsx) fbt syntax translation', () =>
  TestUtil.testSection(testData, transform));

describe('Test fbt transforms without the jsx transform', () => {
  it('not nested', () => {
    expect(
      transformKeepJsx(`
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
      transformKeepJsx(`
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
      transformKeepJsx(`
        const fbt = require("fbt");
        let x = <fbt desc="" doNotExtract>Test</fbt>;
      `),
    ).toMatchSnapshot();
  });

  it('short bool syntax for number attribute', () => {
    expect(
      transformKeepJsx(`
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
        transformKeepJsx(`
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
        transformKeepJsx(`
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
        transformKeepJsx(`
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
        transformKeepJsx(`
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

  // TODO(T78914132): actually, we should NOT insert a space between two <fbt:plural>
  // that don't neighbor raw text to match Hack fbt parity.
  // But there's not much point fixing this before the fbt autoparam work.
  // See Hack fbt equivalent: https://fburl.com/intl/zkacwqtj
  // See also JS fbt fiddle: https://fburl.com/intl/ha5dryng
  it(`[legacy buggy behavior] <fbt:pronoun> should insert a space character between two fbt constructs that don't neighbor raw text`, () =>
    expect(
      transformKeepJsx(`
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
