/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

import React from 'react';

describe('fbs', () => {
  let fbs;
  let fbt;

  beforeEach(() => {
    jest.resetModules();
    fbs = require('fbs');
    fbt = require('fbt');
  });

  it('should have consistent Flow checks', () => {
    // eslint-disable-next-line fb-www/fbt-no-project
    const fbtText: Fbt = <fbt desc="something">blah</fbt>;
    const fbsText: Fbs = <fbs desc="something">blah</fbs>;

    // Fbs should be a subtype of Fbt
    const test1: Fbt = fbsText;
    // $FlowExpectedError[incompatible-type] Fbt isn't a a subtype of Fbs
    const test2: Fbs = fbtText;
  });

  describe('when using plain text contents', () => {
    describe('with a basic text', () => {
      it('fbs() should work', () => {
        expect(
          fbs('Hello world', 'some desc').toString(),
        ).toMatchInlineSnapshot(`"Hello world"`);
      });

      it('<fbs> should work', () => {
        expect(
          (<fbs desc="some desc">Hello world</fbs>).toString(),
        ).toMatchInlineSnapshot(`"Hello world"`);
      });
    });

    describe('with fbs:param', () => {
      it('fbs() should work', () => {
        expect(
          // NOTE how the fbs() functional API relies on using an array of content items
          // instead of the legacy string concatenation pattern.
          // See https://fburl.com/code/8qvet9j7
          fbs(
            ['Hello ', fbs.param('name', fbs('world', 'param text'))],
            'some desc',
          ).toString(),
        ).toMatchInlineSnapshot(`"Hello world"`);
      });

      it('<fbs> should work', () => {
        expect(
          (
            <fbs desc="some desc">
              Hello{' '}
              <fbs:param name="name">
                <fbs desc="param text">world</fbs>
              </fbs:param>
            </fbs>
          ).toString(),
        ).toMatchInlineSnapshot(`"Hello world"`);
      });
    });

    describe('with fbs:plural', () => {
      const count = 3;
      it('fbs() should work', () => {
        expect(
          // NOTE how the fbs() functional API relies on using an array of content items
          // instead of the legacy string concatenation pattern.
          // See https://fburl.com/code/8qvet9j7
          fbs(
            [
              'I have ',
              fbs.plural('a dream', count, {
                many: 'dreams',
                showCount: 'yes',
                value: fbs('three', 'custom UI value'),
              }),
              '.',
            ],
            'desc',
          ).toString(),
        ).toMatchInlineSnapshot(`"I have three dreams."`);
      });

      it('<fbs> should work', () => {
        expect(
          (
            <fbs desc="desc">
              I have{' '}
              <fbs:plural
                count={count}
                many="dreams"
                showCount="yes"
                value={fbs('three', 'custom UI value')}>
                a dream
              </fbs:plural>
              {'.'}
            </fbs>
          ).toString(),
        ).toMatchInlineSnapshot(`"I have three dreams."`);
      });
    });
  });

  describe('when passing down rich contents', () => {
    describe('with fbs:param', () => {
      it('fbs() should throw an error', () => {
        expect(() =>
          // NOTE how the fbs() functional API relies on using an array of content items
          // instead of the legacy string concatenation pattern.
          // See https://fburl.com/code/8qvet9j7
          fbs(
            [
              'Hello ',
              // $FlowExpectedError[incompatible-call] Pass React component for testing
              fbs.param('name', <strong>world</strong>),
            ],
            'some desc',
          ),
        ).toThrowErrorMatchingInlineSnapshot(
          `"Expected fbs parameter value to be the result of fbs(), <fbs/>, or a string; instead we got \`[object Object]\` (type: object)"`,
        );
      });

      it('<fbs> should throw an error', () => {
        expect(() => (
          <fbs desc="some desc">
            Hello{' '}
            <fbs:param name="name">
              <strong>world!</strong>
            </fbs:param>
          </fbs>
        )).toThrowErrorMatchingInlineSnapshot(
          `"Expected fbs parameter value to be the result of fbs(), <fbs/>, or a string; instead we got \`[object Object]\` (type: object)"`,
        );
      });
    });

    describe('with implicit params (nested React components)', () => {
      // No need to test fbs() in Jest for this scenario
      // since it's forbidden by the babel-plugin-fbt transform iteself.
      //
      // fbs(
      //   [
      //     'Hello ',
      //     // -> Babel transform error
      //     <strong>world</strong>,
      //   ],
      //   'some desc',
      // )

      it('<fbs> should throw an error', () => {
        expect(() => (
          <fbs desc="some desc">
            Hello <strong>world!</strong>
          </fbs>
        )).toThrowErrorMatchingInlineSnapshot(
          `"Expected fbs parameter value to be the result of fbs(), <fbs/>, or a string; instead we got \`[object Object]\` (type: object)"`,
        );
      });
    });

    describe('with fbs:plural', () => {
      const count = 3;
      it('fbs() should throw an error', () => {
        expect(() =>
          // NOTE how the fbs() functional API relies on using an array of content items
          // instead of the legacy string concatenation pattern.
          // See https://fburl.com/code/8qvet9j7
          fbs(
            [
              'I have ',
              fbs.plural('a dream', count, {
                many: 'dreams',
                showCount: 'yes',
                value: <strong>three</strong>,
              }),
              '.',
            ],
            'desc',
          ),
        ).toThrowErrorMatchingInlineSnapshot(
          `"Expected fbs plural UI value to be nullish or the result of fbs(), <fbs/>, or a string; instead we got \`[object Object]\` (type: object)"`,
        );
      });

      it('<fbs> should throw an error', () => {
        expect(() => (
          <fbs desc="desc">
            I have{' '}
            <fbs:plural
              count={count}
              many="dreams"
              showCount="yes"
              value={<strong>three</strong>}>
              a dream
            </fbs:plural>
            {'.'}
          </fbs>
        )).toThrowErrorMatchingInlineSnapshot(
          `"Expected fbs plural UI value to be nullish or the result of fbs(), <fbs/>, or a string; instead we got \`[object Object]\` (type: object)"`,
        );
      });
    });
  });
});
