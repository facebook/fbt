/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+i18n_fbt_js
 * @typechecks
 * @flow
 */

/* eslint-disable fb-www/fbt-no-project */

'use strict';

import type {IntlVariationsEnum} from 'IntlVariations';

jest.mock('FbtNumberType');
jest.mock('translationOverrideListener'); // FB internal

import type {FbtRuntimeCallInput, FbtTranslatedInput} from 'FbtHooks';

const GenderConst = require('GenderConst');
// Warning: importing JS modules outside of beforeEach blocks is generally bad practice
// in jest tests. We might need to move these modules inside beforeEach().
// These ones can stay here for now since they have a consistent behavior across this test suite.
const IntlVariations = require('IntlVariations');
const ReactDOM = require('ReactDOM');

const invariant = require('invariant');
const React = require('react');

let domContainer;
let fbt;
let fbtRuntime;

describe('fbt', () => {
  beforeEach(() => {
    jest.resetModules();
    fbtRuntime = jest.requireActual('fbt');
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

  function _render(value, childA, childB) {
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

  function renderAndExtractChildDivs(component) {
    const node = ReactDOM.findDOMNode(ReactDOM.render(component, domContainer));
    // flow thinks ReactDOM.findDOMNode can return a type of Text...
    invariant(node instanceof Element, 'Expected node to be an Element');
    const resultingElements = node.getElementsByTagName('div');
    // $FlowFixMe[method-unbinding] added when improving typing for this parameters
    return Array.prototype.slice.call(resultingElements, 0);
  }

  it('should not warn when unkeyed React components are params', function () {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const nodes = renderAndExtractChildDivs(
      <TestComponent childA={<div />} childB={<div />} value="A" />,
    );
    expect(nodes.length).toBe(2);
    /* $FlowFixMe[prop-missing] (>=0.99.0 site=www) This comment suppresses an
     * error found when Flow v0.99 was deployed. To see the error delete this
     * comment and run Flow. */
    expect(console.warn.mock.calls.length).toBe(0);
  });

  function expectChildSetsToRetainIdentity(setA, setB) {
    const nodesA = renderAndExtractChildDivs(
      <TestComponent childA={setA} childB={setB} value="A" />,
    );
    const nodesB = renderAndExtractChildDivs(
      <TestComponent childA={setA} childB={setB} value="B" />,
    );

    expect(nodesA.length).toBe(2);
    expect(nodesB.length).toBe(2);

    // Expect the child nodes be the same instances as before, only reordered.
    expect(nodesA[0]).toBe(nodesB[1]);
    expect(nodesA[1]).toBe(nodesB[0]);
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
    (fbtFunctionalResult: Fbt);
    (fbtFunctionalResult: FbtWithoutString);

    const fbtJSXResult = <fbt desc="blah">test</fbt>;
    (fbtJSXResult: Fbt);
    (fbtJSXResult: FbtWithoutString);
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
    function getFbt({viewer, ownerGender, object, count}) {
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

    const combinations = {
      viewers: ([
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
      ]: Array<{
        gender: IntlVariationsEnum,
        name: string,
      }>),
      ownerGenders: ([
        'FEMALE_SINGULAR',
        'MALE_SINGULAR',
        'UNKNOWN_PLURAL',
      ]: Array<$Keys<typeof GenderConst>>),
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
