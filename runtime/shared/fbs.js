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

  _wrapContent(fbtContent, translation, hash) {
    const contents = typeof fbtContent === 'string' ? [fbtContent] : fbtContent;
    const errorListener = FbtHooks.getErrorListener({hash, translation});
    return FbtHooks.getFbsResult({
      contents,
      errorListener,
      patternHash: hash,
      patternString: translation,
    });
  },
};

module.exports = ((FbsImpl: $FlowFixMe): $FbsFunctionAPI);
