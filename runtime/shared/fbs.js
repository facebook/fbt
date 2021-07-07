/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Wrapper module for fbt.js (the implementation)
 *
 * @emails oncall+i18n_fbt_js
 * @flow
 * @format
 */

import type {ParamVariationType} from 'FbtRuntimeTypes';
import type {PatternHash, PatternString} from 'FbtTable';
import type {FbtTableArg} from 'FbtTableAccessor';
import type {GenderConstEnum} from 'GenderConst';

const FbtHooks = require('FbtHooks');
const FbtPureStringResult = require('FbtPureStringResult');

const fbt = require('fbt');
const invariant = require('invariant');

const FbsImpl = {
  ...fbt,

  /**
   * @see fbt._param()
   */
  _param(
    label: string,
    value: $FbsParamInput,
    variations?:
      | [$PropertyType<ParamVariationType, 'number'>, ?number]
      | [$PropertyType<ParamVariationType, 'gender'>, GenderConstEnum],
  ): FbtTableArg {
    invariant(
      typeof value === 'string' || value instanceof FbtPureStringResult,
      'Expected fbs parameter value to be the result of fbs(), <fbs/>, or a string; ' +
        'instead we got `%s` (type: %s)',
      value,
      typeof value,
    );
    // $FlowFixMe[incompatible-call] TODO(T36305131) Add accurate flow types to fbt.js
    return fbt._param(label, value, variations);
  },

  /**
   * @see fbt._plural()
   */
  _plural(count: number, label: ?string, value?: mixed): FbtTableArg {
    invariant(
      value == null ||
        typeof value === 'string' ||
        value instanceof FbtPureStringResult,
      'Expected fbs plural UI value to be nullish or the result of fbs(), <fbs/>, or a string; ' +
        'instead we got `%s` (type: %s)',
      value,
      typeof value,
    );
    // $FlowFixMe[incompatible-call] TODO(T36305131) Add accurate flow types to fbt.js
    return fbt._plural(count, label, value);
  },

  _wrapContent(
    fbtContent: $NestedFbtContentItems | string,
    translation: PatternString,
    hash: ?PatternHash,
  ): Fbs {
    const contents = typeof fbtContent === 'string' ? [fbtContent] : fbtContent;
    const errorListener = FbtHooks.getErrorListener({hash, translation});
    // $FlowFixMe[incompatible-return] T61015960 FbtHooks.getFbsResult returns mixed for now
    return FbtHooks.getFbsResult({
      contents,
      errorListener,
      patternHash: hash,
      patternString: translation,
    });
  },
};

// Use $-FlowFixMe instead of $-FlowExpectedError since fbsource doesn't use the latter
module.exports = ((FbsImpl: $FlowFixMe): $FbsFunctionAPI);
