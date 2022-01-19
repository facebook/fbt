/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @emails oncall+i18n_fbt_js
 * @flow strict-local
 * @format
 */

import type {FbtTableKey, PatternHash, PatternString} from 'FbtTable';
import type {FbtTableArg} from 'FbtTableAccessor';
import typeof IntlViewerContext from 'IntlViewerContext';

const FbtEnv = require('FbtEnv');
const FbtHooksImpl = require('FbtHooksImpl');

// TODO T61557741: Move these types to fbt.js when it's flow strict
export type FbtResolvedPayload = {|
  contents: $NestedFbtContentItems,
  errorListener: ?IFbtErrorListener,
  patternString: PatternString,
  patternHash: ?PatternHash,
|};
/**
 * This is the main input payload to the fbt._(...) runtime call.
 *
 * - For simple fbt calls without interpolation (fbt.param) or multiplexing (fbt.plural,
 *   fbt.enum, viewer context variation, etc), this is a simple vanilla string.
 * - Otherwise this is a table whose keys correspond to the associated runtime
 *   parameters passed to fbt._, named `args`.
 *
 *  See the docblock for fbt._ for an example of the nested table and its behavior
 */
export type FbtRuntimeInput =
  | PatternString
  | [PatternString, PatternHash]
  | FbtInputTable;
export type FbtInputTable = {|
  [key: FbtTableKey]: FbtRuntimeInput,
|};
export type FbtTableArgs = Array<FbtTableArg>;
export type FbtTranslatedInput = {
  table: FbtRuntimeInput,
  args: ?FbtTableArgs,
  ...
};
/**
 * In ReactNative and OSS, there is a per-fbt-callsite hash (defaults to Jenkins
 * hash) for looking up fbt translation payloads per callsite.  There is also an
 * enum hash key used to access the pre-calculated table given a set of
 * enumeration values.
 */
export type FbtEnumHashKeyTable = {
  [key: FbtTableKey]: PatternString | FbtEnumHashKeyTable,
  ...
};
export type FbtInputOpts = {
  // hash key
  hk?: string,
  // enum hash key
  ehk?: FbtEnumHashKeyTable,
  ...
};
export type FbtRuntimeCallInput = {
  table: FbtRuntimeInput,
  args: ?FbtTableArgs,
  options: ?FbtInputOpts,
  ...
};
// TODO: T61015960 - getFb[st]Result should return types that are locked down
export type FbtHookRegistrations = $Shape<{|
  errorListener: ?(context: FbtErrorContext) => IFbtErrorListener,
  getFbsResult: (input: FbtResolvedPayload) => mixed,
  getFbtResult: (input: FbtResolvedPayload) => mixed,
  getTranslatedInput: ?(input: FbtRuntimeCallInput) => ?FbtTranslatedInput,
  getViewerContext: () => IntlViewerContext,
  logImpression: ?(hash: string) => void,
  onTranslationOverride: ?(hash: string) => void,
|}>;

module.exports = FbtHooksImpl;

FbtEnv.setupOnce();
