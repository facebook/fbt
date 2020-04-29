/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p fbt --local ~/www
 *
 * @format
 * @flow strict
 * @emails oncall+internationalization
 */

const REACT_ELEMENT_TYPE = ((typeof Symbol === 'function' &&
  Symbol.for &&
  Symbol.for('react.element')) ||
  0xeac7: symbol | $TEMPORARY$number<0xeac7>);

let canDefineProperty = false;
if (__DEV__) {
  if (Object && Object.defineProperty) {
    Object.defineProperty({}, "x", {});
    canDefineProperty = true;
  }
}

const FbtReactUtil = {
  REACT_ELEMENT_TYPE: REACT_ELEMENT_TYPE,

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
