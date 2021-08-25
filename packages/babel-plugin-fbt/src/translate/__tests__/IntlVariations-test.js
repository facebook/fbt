/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+i18n_fbt_js
 * @flow strict
 * @format
 */

'use strict';

jest.autoMockOff();

let ClientSideIntlVariations;
let IntlVariations;

describe('IntlVariations', () => {
  beforeEach(() => {
    IntlVariations = require('../IntlVariations');
  });

  describe('when compared with the client-side IntlVariations', () => {
    beforeEach(() => {
      ClientSideIntlVariations = require('../../../../../runtime/nonfb/IntlVariations');
    });

    function getPropsByPrefix(object, prefix) {
      return Object.keys(object).filter(key => key.startsWith(prefix));
    }

    it('Number config must match client-side equivalent ', () => {
      const {Number: IntlNumberVariations} = IntlVariations;
      const prefix = 'NUMBER_';
      for (const k in IntlNumberVariations) {
        expect(ClientSideIntlVariations).toHaveProperty(
          prefix + k,
          IntlNumberVariations[k],
        );
      }

      getPropsByPrefix(ClientSideIntlVariations, prefix).forEach(key =>
        expect(IntlNumberVariations).toHaveProperty(
          key.substr(prefix.length),
          ClientSideIntlVariations[key],
        ),
      );
    });

    it('Gender config must match client-side equivalent ', () => {
      const {Gender: IntlGenderVariations} = IntlVariations;
      const prefix = 'GENDER_';
      for (const k in IntlGenderVariations) {
        expect(ClientSideIntlVariations).toHaveProperty(
          prefix + k,
          IntlGenderVariations[k],
        );
      }

      getPropsByPrefix(ClientSideIntlVariations, prefix).forEach(key =>
        expect(IntlGenderVariations).toHaveProperty(
          key.substr(prefix.length),
          ClientSideIntlVariations[key],
        ),
      );
    });
  });
});
