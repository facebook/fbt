/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 * @format
 */

/* eslint max-len: ["warn", 120] */

'use strict';

import type {EnumManifest} from '../../FbtEnumRegistrar';
import type {
  ChildParentMappings,
  Errors,
  IFbtCollector,
  PackagerPhrase,
} from '../FbtCollector';

/**
 * Dummy fbt collector for testing.
 */
class CustomFbtCollector implements IFbtCollector {
  collectFromOneFile(
    _source: string,
    _filename: ?string,
    _fbtEnumManifest?: EnumManifest,
  ): void {}

  collectFromFiles(
    _files: Array<string>,
    _fbtEnumManifest?: EnumManifest,
  ): boolean {
    throw new Error('Not implemented');
  }

  getPhrases(): Array<PackagerPhrase> {
    return [
      {
        col_beg: 8,
        col_end: 14,
        filepath: '',
        jsfbt: {
          m: [],
          t: {
            desc: 'description',
            text: 'Hello {=World}!',
            tokenAliases: {},
          },
        },
        line_beg: 3,
        line_end: 5,
        project: '',
      },
      {
        col_beg: 16,
        col_end: 38,
        filepath: '',
        jsfbt: {
          m: [],
          t: {
            desc: 'In the phrase: "Hello {=World}!"',
            text: 'World',
            tokenAliases: {},
            outerTokenName: '=World',
          },
        },
        line_beg: 4,
        line_end: 4,
        project: '',
      },
    ];
  }

  getChildParentMappings(): ChildParentMappings {
    return {
      // We need an object keyed by numbers only
      // eslint-disable-next-line no-useless-computed-key
      [1]: 0,
    };
  }

  getErrors(): Errors {
    return {};
  }
}

module.exports = CustomFbtCollector;
