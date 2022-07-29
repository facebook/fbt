/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow
 * @format
 * @oncall i18n_fbt_js
 */

/* eslint max-len: ["warn", 120] */

'use strict';

import type {PlainFbtNode} from '../../fbt-nodes/FbtNode';
import type {EnumManifest} from '../../FbtEnumRegistrar';
import type {
  ChildParentMappings,
  Errors,
  IFbtCollector,
  PackagerPhrase,
} from '../FbtCollector';

const FbtNodeType = require('../../fbt-nodes/FbtNodeType');

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

  getFbtElementNodes(): Array<PlainFbtNode> {
    // $FlowExpectedError[incompatible-type]
    const pseudoJSXOpeningElement: BabelNodeJSXOpeningElement = {
      type: 'JSXOpeningElement',
    };
    return [
      {
        phraseIndex: 0,
        children: [
          {
            type: FbtNodeType.Text,
          },
          {
            phraseIndex: 1,
            children: [
              {
                type: FbtNodeType.Text,
              },
            ],
            type: FbtNodeType.ImplicitParam,
            wrapperNode: {
              type: 'a',
              babelNode: pseudoJSXOpeningElement,
              props: {
                className: 'neatoLink',
                href: 'https://somewhere.random',
                tabindex: 123,
              },
            },
          },
        ],
        type: FbtNodeType.Element,
      },
    ];
  }

  getErrors(): Errors {
    return {};
  }
}

module.exports = CustomFbtCollector;
