/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Wrapper module for fbt.js (the implementation)
 *
 * @emails oncall+i18n_fbt_js
 * @flow
 * @format
 */
const FbtHooks = require('FbtHooks');
const FbtPureStringResult = require('FbtPureStringResult');

const fbt = require('fbt');
const invariant = require('invariant');

const FbsImpl = {
  ...fbt,

  /**
   * @see fbt._param()
   */
  _param(label: string, value: $FbsParamInput, variations: [number, number]) {
    // TODO(T36305131) Returning implicit Flow type until fbt.js is typed properly
    invariant(
      typeof value === 'string' || value instanceof FbtPureStringResult,
      'Expected fbs parameter value to be the result of fbs(), <fbs/>, or a string; ' +
        'instead we got `%s` (type: %s)',
      value,
      typeof value,
    );
    // $FlowFixMe[incompatible-call] TODO(T36305131) Add accurate flow types to fbt.js
    return fbt._param(...arguments);
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
