/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @flow
 * @format
 *
 * Wrapper module for fbt.js (the implementation)
 */

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
    value: _FbsParam_DO_NOT_USE,
    variations: [number, number],
  ) {
    // TODO(T36305131) Returning implicit Flow type until fbt.js is typed properly
    invariant(
      typeof value === 'string' || value instanceof FbtPureStringResult,
      'Expected fbs parameter value to be the result of fbs(), <fbs/>, or a string; ' +
        'instead we got `%s` (type: %s)',
      value,
      typeof value,
    );
    // $FlowFixMe TODO(T36305131) Add accurate flow types to fbt.js
    return fbt._param(...arguments);
  },

  _wrapContent(fbtContent, patternString, patternHash) {
    const contents = typeof fbtContent === 'string' ? [fbtContent] : fbtContent;
    return new FbtPureStringResult(contents);
  },
};

module.exports = ((FbsImpl: $FlowFixMe): _FbsFactory_DO_NOT_USE);
