/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails i18n-tests@fb.com
 * @typechecks
 * @flow
 */

/* eslint-disable fb-www/dot-notation, fb-www/fbt-no-project */
jest
  .enableAutomock()
  .unmock('IntlVariationResolver')
  .unmock('IntlVariationResolverImpl')
  .unmock('NumberFormatConsts');

const FbtNumberType = require('FbtNumberType');
const fbtRuntime = jest.requireActual('fbt');
const fbt = require('fbt');
const intlNumUtils = jest.requireActual('intlNumUtils');
const IntlVariations = jest.requireActual('IntlVariations');
const IntlViewerContext = require('IntlViewerContext');
const invariant = require('invariant');
const React = require('React');
const ReactDOM = require('ReactDOM');

describe('fbt', function() {
  // Use a locale that has FEW.
  FbtNumberType.getVariation = jest.requireActual(
    'IntlCLDRNumberType19',
  ).getVariation;

  const ONE = IntlVariations.NUMBER_ONE;
  const FEW = IntlVariations.NUMBER_FEW;
  const MALE = IntlVariations.GENDER_MALE;
  const FEMALE = IntlVariations.GENDER_FEMALE;

  it('should memoize new strings', function() {
    expect(fbtRuntime._getCachedFbt('sample string')).toEqual(undefined);

    expect(fbtRuntime._('sample string')).toEqual(
      fbtRuntime._getCachedFbt('sample string'),
    );
  });

  it('should trivially handle tokenless strings', function() {
    expect(fbt('without tokens', 'test')).toEqual('without tokens');
  });

  it('should handle common strings', function() {
    expect(fbt.c('Accept')).toEqual(
      fbt('Accept', 'Button/Link: Accept conditions'),
    );
  });

  it('should replace tokens with named values', function() {
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

  it('should remove punctuation when a value ends with it', function() {
    expect(
      fbt('They said ' + fbt.param('quote', '"Hi!"') + '.', 'test'),
    ).toEqual('They said "Hi!"');
    expect(fbt('They said ' + fbt.param('quote', 'bye') + '.', 'test')).toEqual(
      'They said bye.',
    );
  });

  it('should allow values that look like token patterns', function() {
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

  it('should support objects as token values', function() {
    // We expect that this returns an opaque React fragment instead of an array.
    // We use this to preserve identity of nested React elements.
    const argument = <div />;
    const fragment = fbt(
      'with token ' + fbt.param('token', argument) + ' here',
      'test',
    );
    const items = [];
    React.Children.forEach(fragment, function(item) {
      items.push(item);
    });
    expect(items).toEqual(['with token ', argument, ' here']);
  });

  it('should render empty string for null values', function() {
    expect(fbt(fbt.param('null_value', null), 'test')).toEqual('');
  });

  // React/fbt integration tests
  type Props = {
    value: string,
    childA: mixed,
    childB: mixed,
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

  class TestComponent extends React.Component<Props, {}> {
    render(): React.Node {
      return _render(this.props.value, this.props.childA, this.props.childB);
    }
  }

  it('should use wildcard defaults', function() {
    expect(
      fbt(
        'with something like ' +
          fbt.param('count', 42, {number: true}) +
          ' wildcards',
        'test',
      ),
    ).toEqual('with something like 42 wildcards');
  });

  it('should format numeric value', function() {
    expect(
      fbt(
        'A total amount is ' + fbt.param('count', 10000, {number: true}),
        'Test string',
      ),
    ).toEqual('A total amount is 10,000');
  });

  it('should keep literal value as is', function() {
    expect(
      fbt('A total amount is ' + fbt.param('count', 10000), 'Test string'),
    ).toEqual('A total amount is 10000');
  });

  const container = document.createElement('div');

  function renderAndExtractChildDivs(component) {
    const node = ReactDOM.findDOMNode(ReactDOM.render(component, container));
    // TODO T21716504: flow thinks ReactDOM.findDOMNode returns Text...
    invariant(node instanceof Element, 'Expected node to be an Element');
    const resultingElements = node && node.getElementsByTagName('div');
    return Array.prototype.slice.call(resultingElements, 0);
  }

  it('should not warn when unkeyed React components are params', function() {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const nodes = renderAndExtractChildDivs(
      <TestComponent value="A" childA={<div />} childB={<div />} />,
    );
    expect(nodes.length).toBe(2);
    expect(console.warn.mock.calls.length).toBe(0);
  });

  function expectChildSetsToRetainIdentity(setA, setB) {
    const nodesA = renderAndExtractChildDivs(
      <TestComponent value="A" childA={setA} childB={setB} />,
    );
    const nodesB = renderAndExtractChildDivs(
      <TestComponent value="B" childA={setA} childB={setB} />,
    );

    expect(nodesA.length).toBe(2);
    expect(nodesB.length).toBe(2);

    // Expect the child nodes be the same instances as before, only reordered.
    expect(nodesA[0]).toBe(nodesB[1]);
    expect(nodesA[1]).toBe(nodesB[0]);
  }

  it('should retain React identity when sentence order changes', function() {
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

  it('should replace QuickTranslation strings', function() {
    expect(
      fbtRuntime._(['This is a QT string', '8b0c31a270a324f26d2417a358106611']),
    ).toEqual('override');
  });

  it('should replace QuickTranslation strings with params', function() {
    expect(
      fbtRuntime._(
        ['Just a {param}', 'fakeHash3'],
        [fbtRuntime._param('param', 'substitute')],
      ),
    ).toEqual('Override a substitute');
  });

  it('should replace QuickTranslation "trees"', function() {
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

  it('should handle variated numbers', function() {
    const previousNumberTypeGetter = FbtNumberType.getVariation;
    FbtNumberType.getVariation = jest.requireActual(
      'IntlCLDRNumberType31',
    ).getVariation;
    const numToType = {
      '21': IntlVariations.NUMBER_ONE,
      '22': IntlVariations.NUMBER_TWO,
      '103': IntlVariations.NUMBER_FEW,
      '1000000': IntlVariations.NUMBER_MANY,
      '15': IntlVariations.NUMBER_OTHER,
    };
    for (const n in numToType) {
      const type = numToType[n];
      const displayNumber = intlNumUtils.formatNumberWithThousandDelimiters(n);
      expect(fbtRuntime._param('num', parseInt(n), [0])).toEqual([
        [type, '*'],
        {num: displayNumber},
      ]);
    }
    FbtNumberType.getVariation = previousNumberTypeGetter;
  });

  it('should create a tuple for fbt.subject if valid', function() {
    expect(fbtRuntime._subject(IntlVariations.GENDER_MALE)).toEqual([
      [IntlVariations.GENDER_MALE, '*'],
      null,
    ]);
    expect(() => fbtRuntime._subject(0)).toThrow('Invalid gender provided');
  });

  it('should leave non-QuickTranslation strings alone', function() {
    expect(
      fbtRuntime._(["This isn't", '8b0c31a270a324f26d2417a358106612']),
    ).toEqual("This isn't");
  });

  it('should access table with multiple tokens containing subject', function() {
    expect(
      fbt(
        'Invited by ' + fbt.plural('friend', 1, {showCount: 'yes'}) + '.',
        'Test Description',
        {subject: IntlVariations.GENDER_UNKNOWN},
      ),
    ).toEqual('Invited by 1 friend.');
  });

  it('should access table with fallback logic', function() {
    const table = {
      __vcg: 1, // viewer-context gender
      '*': {},
    };
    table['*']['A'] = {'*': 'A,UNKNOWN,OTHER {name} has {num}'};
    table['*']['A'][ONE] = 'A,UNKNOWN,ONE {name} has {num}';
    table['*']['A'][FEW] = 'A,UNKNOWN,FEW {name} has {num}';
    table['*']['B'] = {'*': 'B,UNKNOWN,OTHER {name} has {num}'};
    table['*']['B'][ONE] = 'B,UNKNOWN,ONE {name} has {num}';
    table['*']['B'][FEW] = 'B,UNKNOWN,FEW {name} has {num}';
    table[MALE] = {A: {'*': 'A,MALE,OTHER {name} has {num}'}};
    table[MALE]['A'][ONE] = 'A,MALE,ONE {name} has {num}';
    // table['*'][male]['A'][FEW] = fallback to other ^^^
    // table['*'][male]['B'] = fallback to unknown gender ^^^
    table[FEMALE] = {B: {'*': 'B,FEMALE,OTHER {name} has {num}'}};
    table[FEMALE]['B'][FEW] = 'B,FEMALE,FEW {name} has {num}';
    // table[female]['B'][ONE] = fallback to other ^^^
    // table[female]['A'] = fallback to unknown gender ^^^

    const few = fbtRuntime._param('num', 10, [0] /*Variations.NUMBER*/);
    const other = fbtRuntime._param('num', 20, [0]);
    const one = fbtRuntime._param('num', 1, [0]);
    const A = fbtRuntime._enum('A', {A: 'A', B: 'B'});
    const B = fbtRuntime._enum('B', {A: 'A', B: 'B'});
    const name = fbtRuntime._param('name', 'Bob');

    // GENDER UNKNOWN
    let tests = [
      {arg: [A, few, name], expected: 'A,UNKNOWN,FEW Bob has 10'},
      {arg: [A, one, name], expected: 'A,UNKNOWN,ONE Bob has 1'},
      {arg: [A, other, name], expected: 'A,UNKNOWN,OTHER Bob has 20'},
      {arg: [B, few, name], expected: 'B,UNKNOWN,FEW Bob has 10'},
      {arg: [B, one, name], expected: 'B,UNKNOWN,ONE Bob has 1'},
      {arg: [B, other, name], expected: 'B,UNKNOWN,OTHER Bob has 20'},
    ];
    const runTest = function(test) {
      expect(fbtRuntime._(table, test.arg)).toBe(test.expected);
    };
    tests.forEach(runTest);

    IntlViewerContext.GENDER = MALE;
    tests = [
      {arg: [A, few, name], expected: 'A,MALE,OTHER Bob has 10'},
      {arg: [A, one, name], expected: 'A,MALE,ONE Bob has 1'},
      {arg: [A, other, name], expected: 'A,MALE,OTHER Bob has 20'},
      {arg: [B, few, name], expected: 'B,UNKNOWN,FEW Bob has 10'},
      {arg: [B, one, name], expected: 'B,UNKNOWN,ONE Bob has 1'},
      {arg: [B, other, name], expected: 'B,UNKNOWN,OTHER Bob has 20'},
    ];
    tests.forEach(runTest);

    IntlViewerContext.GENDER = FEMALE;
    tests = [
      {arg: [A, few, name], expected: 'A,UNKNOWN,FEW Bob has 10'},
      {arg: [A, one, name], expected: 'A,UNKNOWN,ONE Bob has 1'},
      {arg: [A, other, name], expected: 'A,UNKNOWN,OTHER Bob has 20'},
      {arg: [B, few, name], expected: 'B,FEMALE,FEW Bob has 10'},
      {arg: [B, one, name], expected: 'B,FEMALE,OTHER Bob has 1'},
      {arg: [B, other, name], expected: 'B,FEMALE,OTHER Bob has 20'},
    ];
    tests.forEach(runTest);
  });
});
