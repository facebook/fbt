/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 * @flow strict-local
 */

'strict';

import type {
  FbtTableKey,
  PatternHash,
  PatternString,
} from '../../../../runtime/shared/FbtTable';
import type {HashToLeaf} from '../bin/FbtCollector';
import type {
  IntlFbtVariationTypeValue,
  IntlVariationMaskValue,
} from './IntlVariations';

const {FbtVariationType, Mask} = require('./IntlVariations');

export type FbtSiteHashToLeaf = FbtSiteHashToTextAndDesc | FbtSiteHashToText;

export type FbtSiteHashToTextAndDesc = HashToLeaf;

export type FbtSiteHashToText = {|
  [hash: PatternHash]: PatternString,
|};

/**
 * Jsfbt table with leaves hashified.
 */
export type FbtSiteHashifiedTableJSFBTTree =
  | PatternHash
  | {[FbtTableKey]: FbtSiteHashifiedTableJSFBTTree};

/**
 * Represents a fbt() or <fbt /> source data from a callsite and all
 * the information necessary to produce the translated payload.  It is
 * used primarily by TranslationBuilder for this process.
 *
 * FbtSiteBase defines the necessary methods required by TranslationBuilder to build
 * translated payload. Implementation of these methods could vary between different
 * types of FbtSiteBase depending on the structure of source data they represent.
 */
class FbtSiteBase<
  MetaDataEntry: FbtSiteMetaEntryBase,
  HashToLeaf: FbtSiteHashToLeaf,
> {
  +hashToLeaf: HashToLeaf;
  +project: string;
  +table: FbtSiteHashifiedTableJSFBTTree;
  +metadata: Array<?MetaDataEntry>;

  constructor(
    hashToLeaf: HashToLeaf,
    table: FbtSiteHashifiedTableJSFBTTree,
    metadata: Array<?MetaDataEntry>,
    project: string,
  ) {
    this.hashToLeaf = hashToLeaf;
    this.table = table;
    this.metadata = metadata;
    this.project = project;
  }

  getProject(): string {
    return this.project;
  }

  getHashToLeaf(): HashToLeaf {
    return this.hashToLeaf;
  }

  /**
   * For a string with variations, this looks something like:
   *
   * {
   *   "*": {
   *     ... { "*": <HASH> }
   *   }
   * }
   * For a string without variation, this is simply the HASH
   */
  getTableOrHash(): FbtSiteHashifiedTableJSFBTTree {
    return this.table;
  }

  getMetadata(): Array<?MetaDataEntry> {
    return this.metadata;
  }
}

/**
 * Represents a metadata entry in a <fbt> source data. An entry could result
 * in string variations during the translation process depending on the
 * locale we are translating the string for.
 */
class FbtSiteMetaEntryBase {
  +type: ?IntlFbtVariationTypeValue;
  +token: ?string;

  constructor(type: ?IntlFbtVariationTypeValue, token: ?string) {
    this.type = type;
    this.token = token;
  }

  getToken(): ?string {
    return this.token;
  }

  hasVariationMask(): boolean {
    throw new Error('This method must be implemented in a child class');
  }

  getVariationMask(): ?IntlVariationMaskValue {
    throw new Error('This method must be implemented in a child class');
  }
}

function getVariationMaskFromType(
  type: ?IntlFbtVariationTypeValue,
): ?IntlVariationMaskValue {
  switch (type) {
    case FbtVariationType.GENDER:
      return Mask.GENDER;
    case FbtVariationType.NUMBER:
      return Mask.NUMBER;
  }
  return null;
}

module.exports = {
  FbtSiteBase,
  FbtSiteMetaEntryBase,
  getVariationMaskFromType,
};
