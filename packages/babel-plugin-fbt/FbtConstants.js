/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Same set of 'usage' values as in :fbt:pronoun::type. Must match
 * PRONOUN_USAGE in fbt.js.
 * NOTE: Using 'usage' here, whereas :fbt:pronoun uses 'type'. It's confusing,
 * but fbt() already uses 'type' as the tag within the fbt table data for the
 * to-be-localized text.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p babel_plugin_fbt --local ~/www
 *
 * @emails oncall+internationalization
 * @flow strict
 */

/*::
export type FbtOptionValue = string | boolean | BabelNode;
// export type FbtCallSiteOptions = {[$Keys<typeof ValidFbtOptions>]: ?FbtOptionValue};
export type FbtCallSiteOptions = $Shape<{|
   author?: ?FbtOptionValue;
   // TODO(T56277500) Refine to expected type: string
   common?: ?FbtOptionValue;
   // TODO(T56277500) Refine to expected type: boolean
   doNotExtract?: ?FbtOptionValue;
   // TODO(T56277500) Refine to expected type: boolean
   preserveWhitespace?: ?FbtOptionValue;
   // TODO(T56277500) Refine to expected type: string
   project?: ?FbtOptionValue;
   // TODO(T56277500) Refine to expected type: BabelNode
   subject?: ?FbtOptionValue;
|}>;

// JS module names without the "React FBT" variant
export type JSModuleNameType = 'fbt' | 'fbs';
export type ValidPronounUsagesKey = $Keys<typeof ValidPronounUsages>;
export type ShowCountKey = $Keys<typeof ShowCount>;
*/

const ValidPronounUsages = {
  object: 0,
  possessive: 1,
  reflexive: 2,
  subject: 3,
};

const PluralRequiredAttributes = {
  count: true,
};

const ShowCount = {
  yes: true,
  no: true,
  ifMany: true,
};

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

const ValidPronounOptions = {
  human: {true: true, false: true},
  capitalize: {true: true, false: true},
};

/**
 * Valid options allowed in the fbt(...) calls.
 */
const ValidFbtOptions = {
  project: true,
  author: true,
  preserveWhitespace: true,
  subject: true,
  common: true,
  doNotExtract: true,
};

const FbtBooleanOptions = {
  preserveWhitespace: true,
  doNotExtract: true,
};

const FbtCallMustHaveAtLeastOneOfTheseAttributes = ['desc', 'common'];

const FbtRequiredAttributes = {
  desc: true,
};

const PronounRequiredAttributes = {
  type: true,
  gender: true,
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
const ModuleNameRegExp /*: RegExp */ = new RegExp(
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
  ValidFbtOptions,
  ValidParamOptions,
  ValidPluralOptions,
  ValidPronounOptions,
  ValidPronounUsages,
};
