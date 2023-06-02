/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

import type {TokenAliases} from '..';
import type {
  PatternHash,
  PatternString,
} from '../../../../runtime/shared/FbtTable';
import type {CollectFbtOutputPhrase} from '../bin/collectFbt.js';
import type {
  JSFBTMetaEntry,
  TableJSFBTTree,
  TableJSFBTTreeBranch,
} from '../index';
import type {
  FbtSiteHashifiedTableJSFBTTree,
  FbtSiteHashToTextAndDesc,
} from './FbtSiteBase';
import type {
  IntlFbtVariationTypeValue,
  IntlVariationMaskValue,
} from './IntlVariations';

const {objMap} = require('../FbtUtil');
const {coerceToTableJSFBTTreeLeaf, onEachLeaf} = require('../JSFbtUtil');
const {
  FbtSiteBase,
  FbtSiteMetaEntryBase,
  getVariationMaskFromType,
} = require('./FbtSiteBase');
const {FbtVariationType} = require('./IntlVariations');
const invariant = require('invariant');
const nullthrows = require('nullthrows');

type TextAndDescConcatenation = string;

type TextAndDescToHash = {|
  [textAndDesc: TextAndDescConcatenation]: PatternHash,
|};

type FbtSiteHashToTokenAliases = {|
  [hash: PatternHash]: ?TokenAliases,
|};

type SerializedFbtSite = {|
  h2a: FbtSiteHashToTokenAliases,
  h2t: FbtSiteHashToTextAndDesc,
  p: string,
  _d: {|t: FbtSiteHashifiedTableJSFBTTree, m: $ReadOnlyArray<?JSFBTMetaEntry>|},
|};

/**
 * Represents an <fbt>'s data source in the format of `SourceDataJSON`.
 *
 * E.g
 * {
 *  hashToLeaf: {
 *    hash: {text: '', desc: ''},
 *    ...
 *  },
 *  jsfbt: {
 *    t: {
 *      '*': {
 *        text: '',
 *        desc: '',
 *        tokenAliases: {...}
 *      },
 *      ....
 *    },
 *    m: [levelMetadata,...],
 *  }
 * }
 */
class FbtSite extends FbtSiteBase<FbtSiteMetaEntry, FbtSiteHashToTextAndDesc> {
  +_hashToTokenAliases: FbtSiteHashToTokenAliases;

  constructor(
    hashToTextAndDesc: FbtSiteHashToTextAndDesc,
    tableData: {|
      m: $ReadOnlyArray<?JSFBTMetaEntry>,
      t: FbtSiteHashifiedTableJSFBTTree,
    |},
    project: string,
    hashToTokenAliases: FbtSiteHashToTokenAliases,
  ) {
    super(
      hashToTextAndDesc,
      tableData.t,
      FbtSiteMetadata.wrap(tableData.m),
      project,
    );
    this._hashToTokenAliases = hashToTokenAliases;
  }

  getHashToTokenAliases(): FbtSiteHashToTokenAliases {
    return this._hashToTokenAliases;
  }

  static fromScan(json: CollectFbtOutputPhrase): FbtSite {
    const textAndDescToHash: TextAndDescToHash = {};
    const {hashToLeaf, jsfbt} = json;
    invariant(hashToLeaf != null, 'Expected hashToLeaf to be defined');
    invariant(jsfbt != null, 'Expect a non-void jsfbt table');
    for (const hash in hashToLeaf) {
      const textAndDesc = this._serializeTextAndDesc(
        hashToLeaf[hash].text,
        hashToLeaf[hash].desc,
      );
      invariant(
        textAndDescToHash[textAndDesc] == null,
        "Duplicate text+desc pairs pointing to different hashes shouldn't be possible",
      );
      textAndDescToHash[textAndDesc] = hash;
    }
    const tableData = {
      t: FbtSite._hashifyLeaves(jsfbt.t, textAndDescToHash),
      m: jsfbt.m,
    };
    const hashToTokenAliases: FbtSiteHashToTokenAliases = {};
    onEachLeaf({jsfbt}, leaf => {
      const hash =
        textAndDescToHash[this._serializeTextAndDesc(leaf.text, leaf.desc)];
      if (leaf.tokenAliases != null) {
        hashToTokenAliases[hash] = leaf.tokenAliases;
      }
    });

    return new FbtSite(hashToLeaf, tableData, json.project, hashToTokenAliases);
  }

  /**
   * Replaces leaves in our table with corresponding hashes
   * @param entry Represents a recursive descent into the table
   * @param textAndDescToHash Reverse mapping of hashToLeaf for leaf lookups
   */
  static _hashifyLeaves(
    entry: $ReadOnly<TableJSFBTTree>,
    textAndDescToHash: $ReadOnly<TextAndDescToHash>,
  ): FbtSiteHashifiedTableJSFBTTree {
    // $FlowFixMe[incompatible-indexer]
    // $FlowFixMe[incompatible-variance]
    // $FlowFixMe[incompatible-call]
    const leaf = coerceToTableJSFBTTreeLeaf(entry);
    return leaf != null
      ? textAndDescToHash[this._serializeTextAndDesc(leaf.text, leaf.desc)]
      : objMap(
          // $FlowExpectedError[incompatible-cast] `entry` must be TableJSFBTTreeBranch type
          (entry: $ReadOnly<TableJSFBTTreeBranch>),
          branch => FbtSite._hashifyLeaves(branch, textAndDescToHash),
        );
  }

  /**
   * Strings with different hashes might have the same text, so we need to use
   * description to uniquely identify a string.
   * For example, in
   *  <fbt>
   *   <fbt:pronoun gender={$ex->getGender()} type="subject" human={true} />
   *   has shared <a href={link}>a photo</a>.
   *  </fbt>
   * `<a href={link}>a photo</a>` generates multiple strings with the same text:
   * {text: 'a photo', desc: 'In the phrase: She has shared {a photo}.'}
   * {text: 'a photo', desc: 'In the phrase: He has shared {a photo}.'}
   * ....
   */
  static _serializeTextAndDesc(
    text: PatternString,
    desc: string,
  ): TextAndDescConcatenation {
    return JSON.stringify({text, desc});
  }
}

// TODO: T92487383 Sync FbtSiteMetaEntry to the FbtSiteBase class.
class FbtSiteMetaEntry extends FbtSiteMetaEntryBase {
  +_range: ?$ReadOnlyArray<string>;

  constructor(
    type: ?IntlFbtVariationTypeValue,
    token: ?string,
    range: ?$ReadOnlyArray<string>,
  ) {
    super(type, token);
    this._range = range;
  }

  hasVariationMask(): boolean {
    return getVariationMaskFromType(this.type) != null;
  }

  getVariationMask(): IntlVariationMaskValue {
    invariant(
      this.hasVariationMask(),
      'check hasVariationMask to avoid this invariant',
    );
    return nullthrows(getVariationMaskFromType(this.type));
  }

  static wrap(entry: $ReadOnly<JSFBTMetaEntry>): FbtSiteMetaEntry {
    FbtSiteMetaEntry._validate(entry);
    return new this(
      entry.type || null,
      entry.token != null ? entry.token : null,
      entry.range || null,
    );
  }

  unwrap(): JSFBTMetaEntry {
    const {token, type} = this;

    if (type === FbtVariationType.NUMBER) {
      return {
        type: FbtVariationType.NUMBER,
        token: token != null ? token : undefined,
      };
    }

    if (type === FbtVariationType.GENDER) {
      invariant(
        token != null,
        'token should be specified for gender variation',
      );
      return {type: FbtVariationType.GENDER, token};
    }

    if (type === FbtVariationType.PRONOUN) {
      return {type: FbtVariationType.PRONOUN};
    }

    invariant(
      this._range != null,
      'range should be specified for enum variation',
    );
    return {range: this._range};
  }

  static _validate(entry: $ReadOnly<JSFBTMetaEntry>): void {
    const type = entry.type || null;
    const token = entry.token != null ? entry.token : null;
    const range = entry.range || null;
    if (type === null) {
      invariant(
        range !== null,
        'if no type is provided, this must be enum variation and thus range must be specified ',
      );
    } else {
      if (type === FbtVariationType.GENDER) {
        invariant(
          token !== null,
          'token should be specified for gender variation',
        );
      } else if (type === FbtVariationType.PRONOUN) {
        invariant(
          token === null,
          'token should not be specified for pronoun variation',
        );
      }
    }
  }
}

const FbtSiteMetadata = {
  wrap(rawEntries: $ReadOnlyArray<?JSFBTMetaEntry>): Array<?FbtSiteMetaEntry> {
    return rawEntries.map(entry => entry && FbtSiteMetaEntry.wrap(entry));
  },

  unwrap(
    metaEntries: $ReadOnlyArray<?FbtSiteMetaEntry>,
  ): Array<?JSFBTMetaEntry> {
    return metaEntries.map(entry => (entry == null ? null : entry.unwrap()));
  },
};

module.exports = {
  FbtSite,
  FbtSiteMetaEntry,
};
