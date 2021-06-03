/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 * @flow
 */

'strict';

import type {
  FbtTableKey,
  PatternHash,
  PatternString,
} from '../../../../runtime/shared/FbtTable';
import type {FbtTypeValue} from '../FbtConstants';
import type {
  FbtSiteHashifiedTableJSFBTTree,
  FbtSiteHashToText,
} from './FbtSiteBase';
import type {
  IntlFbtVariationTypeValue,
  IntlVariationMaskValue,
} from './IntlVariations';

const {FbtType} = require('../FbtConstants');
const {objMap} = require('../FbtUtil');
const {
  FbtSiteBase,
  FbtSiteMetaEntryBase,
  getVariationMaskFromType,
} = require('./FbtSiteBase');
const {FbtVariationType} = require('./IntlVariations');
const invariant = require('invariant');
const nullthrows = require('nullthrows');

/**
 * The old format of fbt() or <fbt /> source data.
 * `jsfbt` payload can be either a string or a tree depending on the `type` field.
 */
type SourceDataJSON =
  | {
      hashToText: FbtSiteHashToText,
      type: 'table',
      jsfbt: {|
        t: TableJSFBTTree,
        m: $ReadOnlyArray<?JSFBTMetaEntry>,
      |},
      project: string,
    }
  | {
      hashToText: FbtSiteHashToText,
      type: 'text',
      jsfbt: PatternString,
      project: string,
    };

type SerializedFbtSite = {|
  _t: FbtTypeValue,
  h2t: FbtSiteHashToText,
  p: string,
  _d?: {|
    t: FbtSiteHashifiedTableJSFBTTree,
    m: $ReadOnlyArray<?JSFBTMetaEntry>,
  |},
|};

// TODO: yq9 Flowify metadata entry and add flow strict-local
type JSFBTMetaEntry = any;

type TableJSFBTTree =
  | PatternString
  | $ReadOnly<{|[key: FbtTableKey]: TableJSFBTTree|}>;

/**
 * This is the OLD way to represent a fbt() or <fbt /> source data from a callsite.
 * An FbtSite is built from data in the json format of `SourceDataJSON`.
 */
class FbtSite extends FbtSiteBase<FbtSiteMetaEntry, FbtSiteHashToText> {
  +_type: FbtTypeValue;

  constructor(
    type: FbtTypeValue,
    hashToText: FbtSiteHashToText,
    tableData?: {|
      m: $ReadOnlyArray<?JSFBTMetaEntry>,
      t: FbtSiteHashifiedTableJSFBTTree,
    |},
    project: string,
  ) {
    const hasTableData = tableData !== undefined;
    invariant(
      (type === FbtType.TEXT || hasTableData) &&
        !(type === FbtType.TEXT && hasTableData),
      'TEXT types sould have no table data and TABLE require it',
    );
    let tableOrHash;
    if (type === FbtType.TEXT) {
      invariant(
        Object.keys(hashToText).length === 1,
        'TEXT types should be a singleton entry',
      );
      tableOrHash = Object.keys(hashToText)[0];
    } else {
      tableOrHash = nullthrows(tableData).t;
    }
    super(
      hashToText,
      tableOrHash,
      hasTableData ? FbtSiteMetadata.wrap(nullthrows(tableData).m) : [],
      project,
    );
    this._type = type;
  }

  getType(): FbtTypeValue {
    return this._type;
  }

  /**
   * Replaces leaves in our table with corresponding hashes
   * @param entry Represents a recursive descent into the table
   * @param textToHash Reverse mapping of hashToText for leaf lookups
   */
  static _hashifyLeaves(
    entry: TableJSFBTTree,
    textToHash: {[text: PatternString]: PatternHash},
  ): FbtSiteHashifiedTableJSFBTTree {
    return typeof entry === 'string'
      ? textToHash[entry]
      : objMap(entry, branch => FbtSite._hashifyLeaves(branch, textToHash));
  }

  /**
   * From a run of collectFbt using TextPackager.
   * NOTE: this is NOT the output of serialize
   */
  static fromScan(json: SourceDataJSON): FbtSite {
    let tableData;
    if (json.type === FbtType.TABLE) {
      const textToHash = {};
      for (const k in json.hashToText) {
        const text = json.hashToText[k];
        invariant(
          textToHash[text] === undefined,
          "Duplicate texts pointing to different hashes shouldn't be possible",
        );
        textToHash[text] = k;
      }
      tableData = {
        t: FbtSite._hashifyLeaves(json.jsfbt.t, textToHash),
        m: json.jsfbt.m,
      };
    }
    const fbtSite = new FbtSite(
      json.type,
      json.hashToText,
      tableData,
      json.project,
    );
    return fbtSite;
  }

  serialize(): SerializedFbtSite {
    const json = {
      _t: this.getType(),
      h2t: this.getHashToLeaf(),
      p: this.getProject(),
    };
    if (this._type === FbtType.TABLE) {
      return {
        ...json,
        _d: {
          t: this.table,
          m: FbtSiteMetadata.unwrap(this.metadata),
        },
      };
    }
    return json;
  }

  static deserialize(json: SerializedFbtSite): FbtSite {
    return new FbtSite(json._t, json.h2t, json._d, json.p);
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

class FbtSiteMetaEntry extends FbtSiteMetaEntryBase {
  +mask: ?IntlVariationMaskValue;

  static wrap(entry: JSFBTMetaEntry): FbtSiteMetaEntry {
    FbtSiteMetaEntry._validate(entry);
    return new this(
      entry.type || null,
      entry.token || null,
      entry.mask || null,
    );
  }

  hasVariationMask(): boolean {
    if (this.token === null) {
      return false;
    }
    if (this.type === null) {
      return this.mask !== null;
    }
    return getVariationMaskFromType(this.type) !== undefined;
  }

  getVariationMask(): ?IntlVariationMaskValue {
    invariant(
      this.hasVariationMask() === true,
      'check hasVariationMask to avoid this invariant',
    );
    if (this.type === null) {
      return this.mask;
    } else {
      return getVariationMaskFromType(this.type);
    }
  }

  unwrap(): JSFBTMetaEntry {
    const entry = {};
    if (this.token !== null) {
      entry.token = this.token;
    }
    if (this.mask !== null) {
      entry.mask = this.mask;
    }
    if (this.type !== null) {
      entry.type = this.type;
    }
    return entry;
  }

  constructor(
    type: ?IntlFbtVariationTypeValue,
    token: ?string,
    mask: ?IntlVariationMaskValue,
  ) {
    super(type, token);
    this.mask = mask;
  }

  static _validate(entry) {
    const type = entry.type || null;
    const token = entry.token || null;
    const mask = entry.mask || null;
    if (type === null) {
      invariant(
        token !== null && mask !== null,
        'token and mask should be specified when there is not type',
      );
    } else {
      invariant(
        mask === null,
        'mask should not be specified when there is type',
      );
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

module.exports = {
  FbtSite,
  FbtSiteMetaEntry,
};
