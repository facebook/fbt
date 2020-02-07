/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow strict
 * @format
 */

import type {FbtTableArg, FbtTableKey} from 'FbtTableAccessor';

/**
 * A leaf string in our FbtInputTable
 */
type PatternString = string;
type PatternHash = string;

// TODO T61557741: Move these types to fbt.js when it's flow strict
export type FbtResolvedPayload = {|
  contents: $NestedFbtContentItems,
  errorListener: ?IFbtErrorListener,
  patternString: PatternString,
  patternHash: PatternHash,
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
export type FbtInputTable = {
  [key: FbtTableKey]: PatternString | FbtRuntimeInput,
  ...,
};

export type FbtTableArgs = Array<FbtTableArg>;

export type FbtRuntimeInput =
  | PatternString
  | [PatternString, PatternHash]
  | FbtInputTable;

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
  ...,
};

export type FbtInputOpts = {
  hk?: string, // hash key
  ehk?: FbtEnumHashKeyTable, // enum hash key
};

export type FbtRuntimeCallInput = {
  table: FbtRuntimeInput,
  args: ?FbtTableArgs,
  options: ?FbtInputOpts,
};

// TODO: T61015960 - getFb[st]Result should return types that are locked down
export type FbtHookRegistrations = $Shape<{
  errorListener: (context: FbtErrorContext) => IFbtErrorListener,
  getFbsResult: (input: FbtResolvedPayload) => mixed,
  getFbtResult: (input: FbtResolvedPayload) => mixed,
  getTranslatedInput: (input: FbtRuntimeCallInput) => ?FbtTranslatedInput,
  logImpression: (hash: string) => void,
  onTranslationOverride: (hash: string) => void,
  ...
}>;

const _registrations: FbtHookRegistrations = {};
const FbtHooks = {
  getErrorListener(context: FbtErrorContext): ?IFbtErrorListener {
    return _registrations.errorListener?.(context);
  },

  logImpression(hash: string): void {
    _registrations.logImpression?.(hash);
  },

  onTranslationOverride(hash: string): void {
    _registrations.onTranslationOverride?.(hash);
  },

  // TODO: T61015960 - get off `mixed` and onto something more locked down (Fbs)
  getFbsResult(input: FbtResolvedPayload): mixed {
    return _registrations.getFbsResult(input);
  },

  // TODO: T61015960 - get off `mixed` and onto something more locked down (Fbt)
  getFbtResult(input: FbtResolvedPayload): mixed {
    return _registrations.getFbtResult(input);
  },

  getTranslatedInput(input: FbtRuntimeCallInput): FbtTranslatedInput {
    return _registrations.getTranslatedInput?.(input) ?? input;
  },

  register(registrations: FbtHookRegistrations): void {
    Object.assign(_registrations, registrations);
  },
};

module.exports = FbtHooks;
