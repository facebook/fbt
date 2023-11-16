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
 * @flow
 * @format
 * @oncall i18n_fbt_js
 */

'use strict';

class FbtResultBase implements IFbtResultBase {
  _contents: $NestedFbtContentItems;
  _stringValue: ?string;
  // Helps detect infinite recursion cycles with toString()
  _isSerializing: boolean;

  // __errorListener is given an extra "private" underscore to prevent munging
  // (https://fburl.com/munge) of the member.  We access the member in a
  // function declared on the prototype outside of the class (see below). So,
  // munging will affect this access.
  __errorListener: ?IFbtErrorListener;

  constructor(
    contents: $NestedFbtContentItems,
    errorListener: ?IFbtErrorListener,
  ) {
    this._contents = contents;
    this.__errorListener = errorListener;
    this._isSerializing = false;
    this._stringValue = null;
  }

  flattenToArray(): Array<$FbtContentItem> {
    return FbtResultBase.flattenToArray(this._contents);
  }

  getContents(): $NestedFbtContentItems {
    return this._contents;
  }

  toString(): string {
    if (Object.isFrozen(this)) {
      // we can't alter this._isSerializing
      // so let's just return the string and risk infinite recursion...
      return this._toString();
    }
    // Prevent risk of infinite recursions if the error listener or nested contents toString()
    // reenters this method on the same instance
    if (this._isSerializing) {
      return '<<Reentering fbt.toString() is forbidden>>';
    }
    this._isSerializing = true;
    try {
      return this._toString();
    } finally {
      this._isSerializing = false;
    }
  }

  _toString(): string {
    if (this._stringValue != null) {
      return this._stringValue;
    }
    let stringValue = '';
    const contents = this.flattenToArray();
    for (let ii = 0; ii < contents.length; ++ii) {
      const content = contents[ii];
      if (typeof content === 'string' || content instanceof FbtResultBase) {
        stringValue += content.toString();
      } else {
        this.__errorListener?.onStringSerializationError?.(content);
      }
    }
    if (!Object.isFrozen(this)) {
      this._stringValue = stringValue;
    }
    return stringValue;
  }

  toJSON(): string {
    return this.toString();
  }

  static flattenToArray(
    contents: $NestedFbtContentItems,
  ): Array<$FbtContentItem> {
    const result = [];
    for (let ii = 0; ii < contents.length; ++ii) {
      const content = contents[ii];
      if (Array.isArray(content)) {
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        result.push.apply(result, FbtResultBase.flattenToArray(content));
      } else if (content instanceof FbtResultBase) {
        // $FlowFixMe[method-unbinding] added when improving typing for this parameters
        result.push.apply(result, content.flattenToArray());
      } else {
        result.push(content);
      }
    }
    return result;
  }
}

// Warning: The following methods are only appplicable during the transition
// period for some existing code that uses string method on Fbt string.
// The fbt string should be considered as the final string to be displayed
// and therefore should not be manipulated.
// The following methods are expected not to be supported "soon".
[
  'anchor',
  'big',
  'blink',
  'bold',
  'charAt',
  'charCodeAt',
  'codePointAt',
  'contains',
  'endsWith',
  'fixed',
  'fontcolor',
  'fontsize',
  'includes',
  'indexOf',
  'italics',
  'lastIndexOf',
  'link',
  'localeCompare',
  'match',
  'normalize',
  'repeat',
  'replace',
  'search',
  'slice',
  'small',
  'split',
  'startsWith',
  'strike',
  'sub',
  'substr',
  'substring',
  'sup',
  'toLocaleLowerCase',
  'toLocaleUpperCase',
  'toLowerCase',
  'toUpperCase',
  'trim',
  'trimLeft',
  'trimRight',
].forEach(methodName => {
  /* eslint-disable fb-www/should-use-class */
  // $FlowFixMe[prop-missing] index signature
  /* $FlowFixMe[missing-this-annot] The 'this' type annotation(s) required by
   * Flow's LTI update could not be added via codemod */
  FbtResultBase.prototype[methodName] = function (...args: Array<mixed>) {
    this.__errorListener?.onStringMethodUsed?.(methodName);
    // $FlowFixMe[incompatible-type] Mock stringish methods
    // $FlowFixMe[prop-missing] Mock stringish methods
    // $FlowFixMe[method-unbinding]
    return String.prototype[methodName].apply(this, args);
  };
  /* eslint-enable fb-www/should-use-class */
});

// $FlowFixMe[incompatible-type]
const out: Class<$FbtResultBase> = FbtResultBase;
module.exports = out;
