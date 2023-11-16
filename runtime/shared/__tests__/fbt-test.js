/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow
 * @format
 * @oncall i18n_fbt_js
 * @typechecks
 */

/* eslint-disable fb-www/fbt-no-project */

'use strict';

import type {
  FbtResolvedPayload,
  FbtRuntimeCallInput,
  FbtTranslatedInput,
} from 'FbtHooks';
import type {IntlVariationsEnum} from 'IntlVariations';

const GenderConst = require('GenderConst');
// Warning: importing JS modules outside of beforeEach blocks is generally bad practice
// in jest tests. We might need to move these modules inside beforeEach().
// These ones can stay here for now since they have a consistent behavior across this test suite.
const IntlVariations = require('IntlVariations');

const {render} = require('@testing-library/react');
const invariant = require('invariant');
const React = require('react');

jest.mock('FbtNumberType');
jest.mock('translationOverrideListener'); // FB internal

let domContainer;
let fbt;
let fbtRuntime;

describe('fbt', () => {
  beforeEach(() => {
    jest.resetModules();
    fbtRuntime = jest.requireActual<any>('fbt');
    fbt = require('fbt');
    domContainer = document.createElement('div');
  });

  it('should memoize new strings', function () {
    expect(fbtRuntime._getCachedFbt('sample string')).toEqual(undefined);

    expect(fbtRuntime._('sample string')).toEqual(
      fbtRuntime._getCachedFbt('sample string'),
    );
  });

  it('should trivially handle tokenless strings', function () {
    expect(fbt('without tokens', 'test')).toEqual('without tokens');
  });

  it('should handle common strings', function () {
    expect(fbt.c('Accept')).toEqual(
      fbt('Accept', 'Button/Link: Accept conditions'),
    );
  });

  it('should replace tokens with named values', function () {
    expect(
      fbt('with token ' + fbt.param('token', 'A') + ' here', 'test'),
    ).toEqual('with token A here');
    expect(
      fbt(
        'with tokens ' +
          fbt.param('tokenA', 'A') +
          ' and ' +
          fbt.param('tokenB', 'B') +
          '',
        'test',
      ),
    ).toEqual('with tokens A and B');
  });

  it('should remove punctuation when a value ends with it', function () {
    expect(fbt('Play ' + fbt.param('game', 'Chess!') + '!', 'test')).toEqual(
      'Play Chess!',
    );
    expect(
      fbt("What's on your mind " + fbt.param('name', 'T.J.') + '?', 'test'),
    ).toEqual("What's on your mind T.J.?");
  });

  it('should allow values that look like token patterns', function () {
    expect(
      fbt(
        'with tokens ' +
          fbt.param('tokenA', '{tokenB}') +
          ' and ' +
          fbt.param('tokenB', 'B') +
          '',
        'test',
      ),
    ).toEqual('with tokens {tokenB} and B');
  });

  it('should support objects as token values', function () {
    // We expect that this returns an opaque React fragment instead of an array.
    // We use this to preserve identity of nested React elements.
    const argument = <div />;
    const fragment = fbt(
      'with token ' + fbt.param('token', argument) + ' here',
      'test',
    );
    const items = [];
    React.Children.forEach(fragment, function (item) {
      items.push(item);
    });
    expect(items).toEqual(['with token ', argument, ' here']);
  });

  it('should render empty string for null values', function () {
    expect(fbt(fbt.param('null_value', null), 'test')).toEqual('');
  });

  // React/fbt integration tests
  type Props = {
    value: string,
    childA: mixed,
    childB: mixed,
    ...
  };

  function _render(value: string, childA: mixed, childB: mixed) {
    // In theory, different enum values can result in different sentence
    // structures. If that happens, the React components should retain
    // their state even though they change order. We mock out a fake
    // string table to test this special case.
    const fbtFragment = fbtRuntime._(
      {
        A: 'preamble {tokenA} is before {tokenB}',
        B: 'preamble {tokenB} is after {tokenA}',
      },
      [
        fbtRuntime._param('tokenA', childA),
        fbtRuntime._param('tokenB', childB),
        fbtRuntime._enum(value, {A: 'is before', B: 'is after'}),
      ],
    );
    return <div>{fbtFragment}</div>;
  }

  class TestComponent extends React.Component<Props, void> {
    render(): React.Node {
      return _render(this.props.value, this.props.childA, this.props.childB);
    }
  }

  it('should use wildcard defaults', function () {
    expect(
      fbt(
        'with something like ' +
          fbt.param('count', 42, {number: true}) +
          ' wildcards',
        'test',
      ),
    ).toEqual('with something like 42 wildcards');
  });

  it('should format numeric value', function () {
    expect(
      fbt(
        'A total amount is ' + fbt.param('count', 10000, {number: true}),
        'Test string',
      ),
    ).toEqual('A total amount is 10,000');
  });

  it('should keep literal value as is', function () {
    expect(
      fbt('A total amount is ' + fbt.param('count', 10000), 'Test string'),
    ).toEqual('A total amount is 10000');
  });

  it('should not warn when unkeyed React components are params', function () {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const {container} = render(
      <TestComponent childA={<div />} childB={<div />} value="A" />,
    );
    expect(container.children[0].getElementsByTagName('div').length).toBe(2);
    /* $FlowFixMe[prop-missing] (>=0.99.0 site=www) This comment suppresses an
     * error found when Flow v0.99 was deployed. To see the error delete this
     * comment and run Flow. */
    expect(console.warn.mock.calls.length).toBe(0);
  });

  function expectChildSetsToRetainIdentity(
    setA: React.MixedElement,
    setB: React.MixedElement,
  ) {
    const {container: containerA} = render(
      <TestComponent childA={setA} childB={setB} value="A" />,
    );
    const nodeA = containerA.children[0];
    const {container: containerB} = render(
      <TestComponent childA={setA} childB={setB} value="B" />,
    );
    const nodeB = containerB.children[0];

    expect(nodeA.getElementsByTagName('div').length).toBe(2);
    expect(nodeB.getElementsByTagName('div').length).toBe(2);

    // Expect the child nodes be the same instances as before, only reordered.
    expect(nodeA.children[0].innerHTML).toBe(nodeB.children[1].innerHTML);
    expect(nodeA.children[1].innerHTML).toBe(nodeB.children[0].innerHTML);
  }

  it('should retain React identity when sentence order changes', function () {
    expectChildSetsToRetainIdentity(<div key="A" />, <div key="B" />);
  });

  // TODO: Allow keyed React components to use their key as the param name,
  // or transfer the param name to the React key if one is not provided.

  // it('should retain React identity with implicit keys', function() {
  //   expectChildSetsToRetainIdentity(<div />, <div />);
  // });

  // it('should retain React identity of sets when order changes', function() {
  //   expectChildSetsToRetainIdentity(
  //     [<div key="foo" />, <span key="bar" />],
  //     [<div key="foo" />, <span key="bar" />]
  //   );
  // });

  describe('when encountering duplicate token substitutions', () => {
    it('should log the duplicate token coming from the same type of construct', () => {
      expect(() =>
        fbtRuntime._('Just a {tokenName}', [
          fbtRuntime._param('tokenName', 'substitute'),
          fbtRuntime._param('tokenName', 'substitute'),
        ]),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Cannot register a substitution with token=\`tokenName\` more than once"`,
      );
    });

    it('should log the duplicate token coming from the different constructs', () => {
      expect(() =>
        fbtRuntime._('Just a {tokenName}', [
          fbtRuntime._param('tokenName', 'substitute'),
          fbtRuntime._name(
            'tokenName',
            'person name',
            IntlVariations.GENDER_UNKNOWN,
          ),
        ]),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Cannot register a substitution with token=\`tokenName\` more than once"`,
      );
    });
  });

  it('should replace QuickTranslation strings', function () {
    expect(
      fbtRuntime._(['This is a QT string', '8b0c31a270a324f26d2417a358106611']),
    ).toEqual('override');
  });

  it('should replace QuickTranslation strings with params', function () {
    expect(
      fbtRuntime._(
        ['Just a {param}', 'fakeHash3'],
        [fbtRuntime._param('param', 'substitute')],
      ),
    ).toEqual('Override a substitute');
  });

  it('should replace QuickTranslation "trees"', function () {
    const runtimeArg = {
      s: ['This is a QT with a {param}', 'fakeHash1'],
      p: ['These are QTs with a {param}', 'fakeHash2'],
    };
    expect(
      fbtRuntime._(runtimeArg, [
        fbtRuntime._param('param', 'word'),
        fbtRuntime._enum('s', {s: 'one', p: 'other'}),
      ]),
    ).toEqual('This is an override with a word');

    expect(
      fbtRuntime._(runtimeArg, [
        fbtRuntime._param('param', 'test'),
        fbtRuntime._enum('p', {s: 'one', p: 'other'}),
      ]),
    ).toEqual('These are overrides and a test');
  });

  it('should create a tuple for fbt.subject if valid', function () {
    expect(fbtRuntime._subject(IntlVariations.GENDER_MALE)).toEqual([
      [IntlVariations.GENDER_MALE, '*'],
      null,
    ]);
    expect(() => fbtRuntime._subject(0)).toThrow('Invalid gender provided');
  });

  it('should leave non-QuickTranslation strings alone', function () {
    expect(
      fbtRuntime._(["This isn't", '8b0c31a270a324f26d2417a358106612']),
    ).toEqual("This isn't");
  });

  it('should access table with multiple tokens containing subject', function () {
    expect(
      fbt(
        'Invited by ' + fbt.plural('friend', 1, {showCount: 'yes'}) + '.',
        'Test Description',
        {subject: IntlVariations.GENDER_UNKNOWN},
      ),
    ).toEqual('Invited by 1 friend.');
  });

  it('should have a return type compatible with the public Fbt type', () => {
    const fbtFunctionalResult = fbt('test', 'foo');
    const test1: Fbt = fbtFunctionalResult;
    const test2: FbtWithoutString = fbtFunctionalResult;

    const fbtJSXResult = <fbt desc="blah">test</fbt>;
    const test3: Fbt = fbtJSXResult;
    const test4: FbtWithoutString = fbtJSXResult;
  });

  it('should defer to FbtHooks.getTranslatedInput', () => {
    require('FbtHooks').register({
      getTranslatedInput(_input: FbtRuntimeCallInput): FbtTranslatedInput {
        return {table: 'ALL YOUR TRANSLATION ARE BELONG TO US', args: null};
      },
    });
    expect(fbtRuntime._('sample string', null, null)).toEqual(
      'ALL YOUR TRANSLATION ARE BELONG TO US',
    );
  });

  it('should pass extra options to FbtHooks.getFbtResult', () => {
    require('FbtHooks').register({
      getFbtResult(input: FbtResolvedPayload): mixed {
        const FbtResult = require('FbtResult');
        const {extraOptions} = input;
        const fbtResult = FbtResult.get(input).toString();
        if (extraOptions?.renderStringInBracket === 'yes') {
          return `[${fbtResult}]`;
        }
        return fbtResult;
      },
    });
    expect(fbtRuntime._('A simple string', null)).toEqual('A simple string');
    expect(
      fbtRuntime._('Another simple string', null, {
        eo: {renderStringInBracket: 'yes'},
      }),
    ).toEqual('[Another simple string]');
  });

  describe('given a string that is only made of contiguous tokens', () => {
    it('should return a list of token values without empty strings', () => {
      const fbtParams = [{value: 'hello'}, {value: 'world'}];

      expect(
        <fbt desc="...">
          <fbt:param name="hello">{fbtParams[0]}</fbt:param>
          <fbt:param name="world">{fbtParams[1]}</fbt:param>
        </fbt>,
      ).toEqual(fbtParams);

      expect(
        fbt(
          /* $FlowFixMe[incompatible-call] (>=0.121.0 site=www) This comment
           * suppresses an error found when Flow v0.121 was deployed. To see
           * the error delete this comment and run Flow. */
          fbt.param('hello', fbtParams[0]) +
            /* $FlowFixMe[incompatible-call] (>=0.121.0 site=www) This comment
             * suppresses an error found when Flow v0.121 was deployed. To see
             * the error delete this comment and run Flow. */
            fbt.param('world', fbtParams[1]),
          'desc',
        ),
      ).toEqual(fbtParams);
    });
  });

  describe(': given a string with implicit parameters', () => {
    function getFbt({
      count,
      object,
      ownerGender,
      viewer,
    }: $TEMPORARY$object<{
      count: number,
      object: $TEMPORARY$string<'comment'> | $TEMPORARY$string<'photo'>,
      ownerGender:
        | 'FEMALE_PLURAL'
        | 'FEMALE_SINGULAR'
        | 'FEMALE_SINGULAR_GUESS'
        | 'MALE_PLURAL'
        | 'MALE_SINGULAR'
        | 'MALE_SINGULAR_GUESS'
        | 'MIXED_UNKNOWN'
        | 'NEUTER_PLURAL'
        | 'NEUTER_SINGULAR'
        | 'NOT_A_PERSON'
        | 'UNKNOWN_PLURAL'
        | 'UNKNOWN_SINGULAR',
      viewer: {gender: IntlVariationsEnum, name: string},
    }>) {
      return (
        <fbt desc="description">
          <fbt:name gender={viewer.gender} name="name">
            {viewer.name}
          </fbt:name>
          clicked on
          <strong>
            <fbt:pronoun gender={GenderConst[ownerGender]} type="possessive" />
            <a href="#link">
              <fbt:enum
                enum-range={{
                  photo: 'photo',
                  comment: 'comment',
                }}
                value={object}
              />
            </a>
          </strong>{' '}
          <em>
            <fbt:plural count={count} showCount="yes">
              time
            </fbt:plural>
          </em>
        </fbt>
      );
    }

    // DEBUG: show the babel-plugin-fbt transform output
    // console.warn('getFbt = \n----\n%s\n----\n', getFbt + '');

    const combinations: {
      viewers: Array<{
        gender: IntlVariationsEnum,
        name: string,
      }>,
      ownerGenders: Array<$Keys<typeof GenderConst>>,
      objects: Array<'photo' | 'comment'>,
      counts: Array<number>,
    } = {
      viewers: [
        {
          gender: IntlVariations.GENDER_MALE,
          name: 'Bob',
        },
        {
          gender: IntlVariations.GENDER_FEMALE,
          name: 'Betty',
        },
        {
          gender: IntlVariations.GENDER_UNKNOWN,
          name: 'Kim',
        },
      ],
      ownerGenders: ['FEMALE_SINGULAR', 'MALE_SINGULAR', 'UNKNOWN_PLURAL'],
      objects: ['photo', 'comment'],
      counts: [1, 10],
    };

    combinations.viewers.forEach(viewer =>
      combinations.ownerGenders.forEach(ownerGender =>
        combinations.objects.forEach(object =>
          combinations.counts.forEach(count =>
            describe(`where
              viewer=${viewer.name},
              ownerGender=${ownerGender},
              object=${object},
              count=${count}\n`, () =>
              it(`should produce proper nested fbt results`, () => {
                expect(
                  getFbt({
                    viewer,
                    ownerGender,
                    object,
                    count,
                  }),
                ).toMatchSnapshot();
              })),
          ),
        ),
      ),
    );
  });
});
