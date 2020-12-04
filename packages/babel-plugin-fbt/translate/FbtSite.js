/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 * @noflow
 */

const {FbtType} = require('../FbtConstants');
const {objMap} = require('../FbtUtil');
const {FbtVariationType, Mask} = require('./IntlVariations');
const invariant = require('invariant');

/**
 * Represents a fbt() or <fbt /> source data from a callsite and all
 * the information necessary to produce the translated payload.  It is
 * used primarily by TranslationBuilder for this process.
 */
class FbtSite {
  constructor(
    type,
    hashToText,
    tableData, // source table & metadata
    project,
  ) {
    const hasTableData = typeof tableData === 'object';
    invariant(
      type === FbtType.TEXT || hasTableData,
      'TEXT types sould have no table data and TABLE require it',
    );
    if (type === FbtType.TEXT) {
      invariant(
        Object.keys(hashToText).length === 1,
        'TEXT types should be a singleton entry',
      );
      this._tableOrHash = Object.keys(hashToText)[0];
    }
    this._type = type;
    this._hashToText = hashToText;
    if (hasTableData) {
      this._tableOrHash = tableData.t;
      this._metadata = FbtSiteMetadata.wrap(tableData.m);
    }
    this.project = project;
  }

  getHashToText() {
    return this._hashToText;
  }

  getMetadata() {
    return this._metadata || [];
  }

  getProject() {
    return this._project;
  }

  getType() {
    return this._type;
  }

  // In a type of TABLE, this looks something like:
  //
  // {"*":
  //   {... { "*": <HASH>} } }
  //
  // In a type of TEXT, this is simply the HASH
  getTableOrHash() {
    return this._tableOrHash;
  }

  // Replaces leaves in our table with corresponding hashes
  static _hashifyLeaves(
    entry, // Represents a recursive descent into the table
    textToHash, // Reverse mapping of hashToText for leaf lookups
  ) {
    return typeof entry === 'string'
      ? textToHash[entry]
      : objMap(entry, (branch, key) =>
          FbtSite._hashifyLeaves(branch, textToHash),
        );
  }

  /**
   * From a run of collectFbt using TextPackager.  NOTE: this is NOT
   * the output of serialize
   *
   * Relevant keys processed:
   * {
   *  hashToText: {hash: text},
   *  type: TABLE|TEXT
   *  jsfbt: {
   *    m: [levelMetadata,...]
   *    t: {...}
   *  } | text
   * }
   */
  static fromScan(json) {
    let tableData = json.jsfbt;
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

  serialize() {
    const json = {
      _t: this.getType(),
      h2t: this.getHashToText(),
      p: this.getProject(),
    };
    if (this._type === FbtType.TABLE) {
      json._d = {
        t: this._tableOrHash,
        m: FbtSiteMetadata.unwrap(this._metadata),
      };
    }
    return json;
  }

  static deserialize(json) {
    return new FbtSite(json._t, json.h2t, json._d, json.p);
  }
}

const FbtSiteMetadata = {
  wrap(rawEntries) {
    return rawEntries.map(entry => entry && FbtSiteMetaEntry.wrap(entry));
  },

  unwrap(metaEntries) {
    return metaEntries.map(entry => (entry === null ? null : entry.unwrap()));
  },
};

class FbtSiteMetaEntry {
  static wrap(entry) {
    FbtSiteMetaEntry._validate(entry);
    return new this(
      entry.type || null,
      entry.token || null,
      entry.mask || null,
    );
  }

  getToken() {
    return this._token;
  }

  hasVariationMask() {
    if (this._token === null) {
      return false;
    }
    if (this._type === null) {
      return this._mask !== null;
    }
    return _getVariationMaskFromType(this._type) !== undefined;
  }

  getVariationMask() {
    invariant(
      this.hasVariationMask() === true,
      'check hasVariationMask to avoid this invariant',
    );
    if (this._type === null) {
      return this._mask;
    } else {
      return _getVariationMaskFromType(this._type);
    }
  }

  unwrap() {
    const entry = {};
    if (this._token !== null) {
      entry.token = this._token;
    }
    if (this._mask !== null) {
      entry.mask = this._mask;
    }
    if (this._type !== null) {
      entry.type = this._type;
    }
    return entry;
  }

  constructor(type, token, mask) {
    this._type = type;
    this._token = token;
    this._mask = mask;
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

const _getVariationMaskFromType = function (type) {
  return _variationTypeToMask[type];
};

const _variationTypeToMask = {};
_variationTypeToMask[FbtVariationType.GENDER] = Mask.GENDER;
_variationTypeToMask[FbtVariationType.NUMBER] = Mask.NUMBER;

module.exports = {
  FbtSite,
  FbtSiteMetaEntry,
};
