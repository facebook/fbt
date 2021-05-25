/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+i18n_fbt_js
 * @flow strict-local
 * @format
 */

import type {
  FbtHookRegistrations,
  FbtResolvedPayload,
  FbtRuntimeCallInput,
  FbtTranslatedInput,
} from 'FbtHooks';
import typeof IntlViewerContext from 'IntlViewerContext';

const _registrations: FbtHookRegistrations = {};
const FbtHooksImpl = {
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

  getViewerContext(): IntlViewerContext {
    return _registrations.getViewerContext();
  },

  register(registrations: FbtHookRegistrations): void {
    Object.assign(_registrations, registrations);
  },
};

module.exports = FbtHooksImpl;
