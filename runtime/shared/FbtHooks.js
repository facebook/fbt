/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow strict
 * @format
 */

export type FbtResolvedPayload = {
  contents: $NestedFbtContentItems,
  errorListener: ?IFbtErrorListener,
  patternString: string,
  patternHash: string,
};

// TODO: T61015960 - getFb[st]Result should return types that are locked down
export type FbtHookRegistrations = $Shape<{
  errorListener: (context: FbtErrorContext) => IFbtErrorListener,
  getFbsResult: (input: FbtResolvedPayload) => mixed,
  getFbtResult: (input: FbtResolvedPayload) => mixed,
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

  register(registrations: FbtHookRegistrations): void {
    Object.assign(_registrations, registrations);
  },
};
module.exports = FbtHooks;
