/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Same set of 'usage' values as in :fbt:pronoun::type. Must match
 * PRONOUN_USAGE in fbt.js.
 * NOTE: Using 'usage' here, whereas :fbt:pronoun uses 'type'. It's confusing,
 * but fbt() already uses 'type' as the tag within the fbt table data for the
 * to-be-localized text.
 *
 * @format
 * @emails oncall+i18n_fbt_js
 * @flow strict-local
 */

/*eslint max-len: ["error", 100]*/

import type {ValidPronounUsagesType} from '../../../runtime/shared/FbtRuntimeTypes';

export type FbtOptionValue = string | boolean | BabelNode;
export type FbtOptionValues<K> = {|[K]: ?FbtOptionValue|};
export type FbtOptionConfig<K> = {|[K]: {[optionValue: string]: true} | true|};
// export type FbtCallSiteOptions = {[$Keys<typeof ValidFbtOptions>]: ?FbtOptionValue};
export type FbtCallSiteOptions = $Shape<{|
  author?: ?FbtOptionValue,
  // TODO(T56277500) Refine to expected type: string
  common?: ?FbtOptionValue,
  doNotExtract?: ?boolean,
  // TODO(T56277500) Refine to expected type: boolean
  preserveWhitespace?: ?FbtOptionValue,
  project: string,
  // TODO(T56277500) Refine to expected type: BabelNode
  subject?: ?FbtOptionValue,
|}>;

// JS module names without the "React FBT" variant
export type JSModuleNameType = 'fbt' | 'fbs';
export type ValidPronounUsagesKey = $Keys<ValidPronounUsagesType>;
export type FbtTypeValue = $Values<typeof FbtType>;

const keyMirror = require('fbjs/lib/keyMirror');

const SENTINEL = '__FBT__';

const PluralRequiredAttributes = {
  count: true,
};

const ShowCount = {
  yes: true,
  no: true,
  ifMany: true,
};

const ShowCountKeys: $ObjMapi<typeof ShowCount, <K>(K) => K> = keyMirror(
  ShowCount,
);

const PluralOptions = {
  value: true, // optional value to replace token (rather than count)
  showCount: ShowCount,
  name: true, // token
  many: true,
};

const ValidPluralOptions = {
  ...PluralOptions,
  ...PluralRequiredAttributes,
};

const ValidPronounUsages: ValidPronounUsagesType = {
  object: 0,
  possessive: 1,
  reflexive: 2,
  subject: 3,
};

const ValidPronounUsagesKeys: $ObjMapi<
  typeof ValidPronounUsages,
  <K>(K) => K,
> = keyMirror(ValidPronounUsages);

const ValidPronounOptions = {
  human: {true: true, false: true},
  capitalize: {true: true, false: true},
};

const PronounRequiredAttributes = {
  type: true, // See ValidPronounUsages for valid strings
  gender: true,
};

/**
 * Valid options allowed in the fbt(...) calls.
 */
const ValidFbtOptions = {
  author: true,
  common: true,
  doNotExtract: true,
  preserveWhitespace: true,
  project: true,
  subject: true,
};

const FbtBooleanOptions = {
  preserveWhitespace: true,
  doNotExtract: true,
};

const FbtCallMustHaveAtLeastOneOfTheseAttributes = ['desc', 'common'];

const FbtRequiredAttributes = {
  desc: true,
};

const PLURAL_PARAM_TOKEN = 'number';

const RequiredParamOptions = {
  name: true,
};

const ValidParamOptions = {
  number: true,
  gender: true,
  ...RequiredParamOptions,
};

const FbtType = {
  TABLE: 'table',
  TEXT: 'text',
};

const JSModuleName = {
  FBT: 'fbt',
  REACT_FBT: 'Fbt',
  FBS: 'fbs',
};

// Used to help detect the usage of the JS fbt/fbs API inside a JS file
const ModuleNameRegExp: RegExp = new RegExp(
  `\\b(?:${Object.values(JSModuleName).join('|')})\\b`,
);

const FBT_ENUM_MODULE_SUFFIX = '$FbtEnum';

module.exports = {
  FBT_ENUM_MODULE_SUFFIX,
  FbtBooleanOptions,
  FbtCallMustHaveAtLeastOneOfTheseAttributes,
  FbtRequiredAttributes,
  FbtType,
  JSModuleName,
  ModuleNameRegExp,
  PLURAL_PARAM_TOKEN,
  PluralOptions,
  PluralRequiredAttributes,
  PronounRequiredAttributes,
  RequiredParamOptions,
  SENTINEL,
  ShowCountKeys,
  ValidFbtOptions,
  ValidParamOptions,
  ValidPluralOptions,
  ValidPronounOptions,
  ValidPronounUsages,
  ValidPronounUsagesKeys,
};
