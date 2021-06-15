/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+i18n_fbt_js
 * @flow strict-local
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
    (fbsText: Fbt);
    // $FlowExpectedError[incompatible-cast] Fbt isn't a a subtype of Fbs
    (fbtText: Fbs);
  });

  describe('when using plain text contents', () => {
    it('fbs() should work', () => {
      expect(
        // NOTE how the fbs() functional API relies on using an array of content items
        // instead of the legacy string concatenation pattern.
        // See https://fburl.com/code/8qvet9j7
        fbs(['Hello ', fbs.param('name', 'world')], 'some desc'),
      ).toMatchInlineSnapshot(`"Hello world"`);
    });

    it('<fbs> should work', () => {
      expect(
        <fbs desc="some desc">
          Hello <fbs:param name="name">{'world'}</fbs:param>
        </fbs>,
      ).toMatchInlineSnapshot(`"Hello world"`);
    });
  });

  describe('when attempting to use rich contents', () => {
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
          Hello <strong>world!</strong>
        </fbs>
      )).toThrowErrorMatchingInlineSnapshot(
        `"Expected fbs parameter value to be the result of fbs(), <fbs/>, or a string; instead we got \`[object Object]\` (type: object)"`,
      );
    });
  });
});
