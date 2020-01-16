/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow strict
 * @format
 */

export type FbtHookRegistrations = $Shape<{
  errorListener: (context: FbtErrorContext) => IFbtErrorListener,
  logImpression: (hash: string) => void,
  onTranslationOverride: (hash: string) => void,
  ...
}>;

const _registrations: FbtHookRegistrations = {};
const FbtHooks = {
  getErrorListener(context: FbtErrorContext): ?IFbtErrorListener {
    const factory = _registrations.errorListener;
    return factory ? factory(context) : null;
  },

  logImpression(hash: string): void {
    _registrations.logImpression?.(hash);
  },

  onTranslationOverride(hash: string): void {
    _registrations.onTranslationOverride?.(hash);
  },

  register(registrations: FbtHookRegistrations): void {
    Object.assign(_registrations, registrations);
  },
};
module.exports = FbtHooks;
