/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @format
 * @oncall i18n_fbt_js
 */

const {
  jsCodeFbtCallSerializer,
  snapshotTransform,
  withFbtRequireStatement,
} = require('./FbtTestUtil');
const {TestUtil} = require('fb-babel-plugin-utils');

expect.addSnapshotSerializer(jsCodeFbtCallSerializer);

const testData = {
  'should auto wrap a simple test with one level': {
    input: withFbtRequireStatement(
      `<fbt desc="d">
        <link href="#">Your friends</link>
        liked your video
      </fbt>;`,
    ),
  },

  'should auto wrap a simple test with a nested level': {
    input: withFbtRequireStatement(
      `<fbt desc="d">
        <Link href="#">
          Your friends
          <b>liked</b>
        </Link>
        your video
      </fbt>;`,
    ),
  },

  'should wrap a single unwrapped <fbt> child and a string above': {
    input: withFbtRequireStatement(
      `<fbt desc="d">
        <b>
          This is
          <link href="#">a nested</link>
        </b>
        test
      </fbt>;`,
    ),
  },

  'should wrap a single unwrapped <fbt> child and a string below': {
    input: withFbtRequireStatement(
      `<fbt desc="d">
        <div href="#">this is</div>
        a singly nested test
      </fbt>;`,
    ),
  },

  'should wrap two unwrapped <fbt> children': {
    input: withFbtRequireStatement(
      `<fbt desc="d">
        <div>wrap once</div>
        <div>wrap twice</div>
      </fbt>;`,
    ),
  },

  'should wrap two unwrapped <fbt> children and 1 nested': {
    input: withFbtRequireStatement(
      `<fbt desc="d">
        <div>
          wrap once
          <div>and also</div>
        </div>
        <div>wrap twice</div>
        complicated
      </fbt>;`,
    ),
  },

  'should wrap an outer and inner child': {
    input: withFbtRequireStatement(
      `<fbt desc="d">
        <div href="#">
          <div href="#">this is</div>
          a doubly
        </div>
        nested test
      </fbt>;`,
    ),
  },

  'should wrap two children with one nested level': {
    input: withFbtRequireStatement(
      `<fbt desc="d">
        <div href="#">
          <div href="#">this is</div>
          a doubly
        </div>
        nested test
        <div href="#">with an additional level</div>
      </fbt>;`,
    ),
  },

  'should wrap a <fbt> child next to an explicit <fbt:param>': {
    input: withFbtRequireStatement(
      `<fbt desc="d">
        <fbt:param name="explicit param next to">
          <div>
            <fbt desc="d2">explicit param next to</fbt>
          </div>
        </fbt:param>
        <div>an implicit param</div>
      </fbt>;`,
    ),
  },

  'should wrap a <fbt> child nested in an explicit <fbt:param>': {
    input: withFbtRequireStatement(
      `<fbt desc="d">
        <fbt:param name="explicit fbt param">
          <div>
            <fbt desc="d2">
              explicit fbt param
              <div>with a nested implicit param</div>
            </fbt>
          </div>
        </fbt:param>
      </fbt>;`,
    ),
  },

  'should wrap a string next to an explicit <fbt:param> that has a implicit <fbt:param> within it':
    {
      input: withFbtRequireStatement(
        `<fbt desc="d">
        outer string that should not appear in inner desc
        <fbt:param name="explicit fbt param">
          <div>
            <fbt desc="d2">
              explicit fbt param
              <div>with a nested implicit param</div>
            </fbt>
          </div>
        </fbt:param>
      </fbt>;`,
      ),
    },

  'should work with multiple <fbt> calls in one file': {
    input: withFbtRequireStatement(
      `<div>
        <fbt desc="one">
          <div href="#">first</div>
          fbt call
        </fbt>
        <fbt desc="two">
          <div href="#">second</div>
          test
        </fbt>
      </div>;`,
    ),
  },

  'should wrap two nested next to each other': {
    input: withFbtRequireStatement(
      `<fbt desc="d">
        <div href="#">
          one
          <div href="#">two</div>
        </div>
        <div href="#">
          three
          <div href="#">four</div>
        </div>
      </fbt>;`,
    ),
  },

  'should wrap two nested next to each other with an extra level': {
    input: withFbtRequireStatement(
      `<fbt desc="d">
        <div href="#">
          one
          <div href="#">
            two
            <div href="#">test</div>
          </div>
        </div>
        <div href="#">
          three
          <div href="#">four</div>
        </div>
      </fbt>;`,
    ),
  },

  'should wrap explicit params nested in implicit params with []': {
    input: withFbtRequireStatement(
      `<fbt desc="d">
        <div>
          this is a test
          <fbt:param name="to make sure that explicit params under an implicit node">
            <link>
              <fbt desc="d2">
                to make sure that explicit tags
                <b>under an implicit node</b>
              </fbt>
            </link>
          </fbt:param>
          <fbt:param name="and ones that are next to each other">
            <link>
              <fbt desc="d3">
                and ones that are next
                <b>to each other</b>
              </fbt>
            </link>
          </fbt:param>
          under an implicit tag are wrapped with [ ]
        </div>
        <fbt:param name="but free standing ones are not">
          <link>
            <fbt desc="d3">
              but free standing ones
              <b>are not</b>
            </fbt>
          </link>
        </fbt:param>
      </fbt>;`,
    ),
  },

  'can handle multiple variations in nested strings': {
    input: withFbtRequireStatement(
      `<fbt desc="some-desc">
        Level 1
        <fbt:param name="foo">
          {foo}
        </fbt:param>
        <a>
          Level 2
          <fbt:name name="bar" gender={g}>
            {bar}
          </fbt:name>

          <b>
            Level 3
            <fbt:plural
              name="baz"
              count={num}
              showCount="yes">
              cat
            </fbt:plural>
          </b>
        </a>
      </fbt>`,
    ),
  },

  'can handle multiple variations in nested strings with substrings that look identical':
    {
      input: withFbtRequireStatement(
        `<fbt desc="description" subject={g0}>
          Level 1
          <a href="#new">
            {/* Substring A */}
            <fbt:pronoun type="possessive" gender={g1} /> some_pronoun
          </a>
          <b>
            Level 2
            <a href="#new">
              {/* Substring B: it looks identical to Substring A but uses another gender value */}
              <fbt:pronoun type="possessive" gender={g2} /> some_pronoun
            </a>
          </b>
        </fbt>`,
      ),
    },

  'can handle multiple variations in nested strings and a subject gender': {
    input: withFbtRequireStatement(
      `<fbt desc="description" subject={g0}>
        Level 1
        <a href="#new">
          <fbt:pronoun type="possessive" gender={g1} /> some_pronoun
        </a>
        <b>
          Level 2
          <fbt:plural
            name="foo"
            count={num}
            showCount="yes">
            cat
          </fbt:plural>
        </b>
      </fbt>`,
    ),
  },

  'prevent token name collisions among fbt constructs across all nesting levels (v1)':
    {
      input: withFbtRequireStatement(
        `<fbt desc="some-desc">
          Level 1
          <fbt:param name="foo">
            {foo}
          </fbt:param>
          <a>
            Level 2
            <fbt:name name="foo" gender={g}>
              {foo}
            </fbt:name>
          </a>
        </fbt>`,
      ),

      throws: "There's already a token called `foo` in this fbt call.",
    },

  'prevent token name collisions among fbt constructs across all nesting levels (v2)':
    {
      input: withFbtRequireStatement(
        `<fbt desc="some-desc">
          Level 1
          <fbt:param name="bar">
            {bar}
          </fbt:param>
          <a>
            Level 2
            <fbt:name name="foo" gender={g}>
              {foo}
            </fbt:name>
            <b>
              Level 3
              <fbt:plural
                name="foo"
                count={num}
                showCount="yes">
                cat
              </fbt:plural>
            </b>
          </a>
        </fbt>`,
      ),

      throws: "There's already a token called `foo` in this fbt call.",
    },
};

describe('Test jsx auto-wrapping of implicit parameters', () =>
  TestUtil.testSection(testData, snapshotTransform, {matchSnapshot: true}));
