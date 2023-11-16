/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p fbt --local ~/www
 *
 * @flow strict
 * @format
 * @oncall i18n_fbt_js
 */

const REACT_ELEMENT_TYPE: symbol | 0xeac7 =
  (typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element')) ||
  0xeac7;

let canDefineProperty = false;
if (__DEV__) {
  try {
    Object.defineProperty(
      {},
      // $FlowFixMe[prop-missing]
      'x',
      {
        // same settings as what we'll use during actual runtime
        configurable: false,
        enumerable: false,
        writable: false,
        value: 'foo',
      },
    );
    canDefineProperty = true;
  } catch {
    // IE will fail on defineProperty
  }
}

const FbtReactUtil = {
  REACT_ELEMENT_TYPE,

  injectReactShim(fbtResult: IFbtResultBase) {
    const reactObj = {validated: true};

    if (canDefineProperty) {
      Object.defineProperty(fbtResult, '_store', {
        configurable: false,
        enumerable: false,
        writable: false,
        value: reactObj,
      });
    } else {
      fbtResult._store = reactObj;
    }
  },
};

module.exports = FbtReactUtil;
