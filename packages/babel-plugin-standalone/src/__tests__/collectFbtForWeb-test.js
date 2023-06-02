/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

import typeof FbtStandalone from '../index';

describe('collectFbtForWeb', () => {
  describe('when comparing normal and bundled JS code', () => {
    const fbtStandaloneSrc = require('../index');
    // Dynamic import to avoid Flow from complaining that it can't find the JS module yet.
    // It's expected since we only generate `dist/index.js` after running `yarn build`
    // upon publishing this package to npm.
    // $FlowExpectedError[unsupported-syntax]
    const fbtStandaloneDist /*: FbtStandalone */ = require('../..' +
      /* force dynamic import */ '/dist');

    // $FlowFixMe[missing-local-annot]
    function collect(fbtStandalone, source) {
      return fbtStandalone.collectFbtPayloadFromSource(
        source,
        {
          genFbtNodes: true,
        },
        {},
      );
    }

    it('can extract the same JS fbt payload', () => {
      const code = `
        const fbt = require('fbt');
        <fbt desc="description">
          Welcome to <a href="#new">World</a>!
        </fbt>
      `;

      const ret = collect(fbtStandaloneDist, code);
      expect(ret).toEqual(collect(fbtStandaloneSrc, code));
      expect(ret.phrases.length).toBe(2);
    });

    it('can expose the same JS fbt extraction errors', () => {
      const code = `
        const fbt = require('fbt');
        <fbt desc="description">
          Welcome to <fbt:pronoun buggy /> <a href="#new">
            World
          </a>!
        </fbt>
      `;

      const expectedErrorMessage = 'Unable to find attribute "type"';

      expect(() => collect(fbtStandaloneSrc, code)).toThrow(
        expectedErrorMessage,
      );
      expect(() => collect(fbtStandaloneDist, code)).toThrow(
        expectedErrorMessage,
      );
    });
  });
});
