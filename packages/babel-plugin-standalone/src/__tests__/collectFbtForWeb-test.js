/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+internationalization
 */

'use strict';

import typeof FbtStandalone from '../index';

describe('collectFbtForWeb', () => {
  describe('when comparing normal and bundled JS code', () => {
    const fbtStandaloneSrc = require('../index');
    // $FlowExpectedError[untyped-import]
    const fbtStandaloneDist = (require('../../dist'): FbtStandalone);

    function collect(fbtStandalone, source) {
      return fbtStandalone.collectFbtPayloadFromSource(
        source,
        {
          genFbtNodes: true,
        },
        {},
      );
    }

    // TODO(T40113359): re-enable these tests once the fbt runtime callsites have been implemented
    xit('can extract the same JS fbt payload', () => {
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
