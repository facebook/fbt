/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p fbt --remote localhost:~/www
 *
 * @flow
 * @format
 * @emails oncall+internationalization
 */

'use strict';

// Similar to React$Node without `Iterable<React$Node>`
type ContentItem =
  | boolean
  | FbtElement
  | FbtPureStringResult
  | FbtString
  | null
  | number
  | React$Element<any>
  | React$Portal
  | string
  | void;
export type NestedContentItems = Array<ContentItem | NestedContentItems>;

const FBLogger = require('FBLogger');

const killswitch = require('killswitch');

function logErrorUseStringMethod(methodName: string): void {
  // If the contents is array of length greater than one, then use the string
  // method will cause error
  FBLogger('fbt')
    .blameToPreviousFile()
    .mustfix(
      'Error using fbt string. Used method %s' +
        ' on Fbt string. Fbt string is designed to be immutable ' +
        'and should not be manipulated.',
      methodName,
    );
}

class FbtResultBaseImpl implements IFbtResultBase {
  _contents: Array<any>;
  _stringValue: ?string;

  // Declare that we'll implement these methods
  anchor: $PropertyType<IFbtResultBase, 'anchor'>;
  big: $PropertyType<IFbtResultBase, 'big'>;
  blink: $PropertyType<IFbtResultBase, 'blink'>;
  bold: $PropertyType<IFbtResultBase, 'bold'>;
  charAt: $PropertyType<IFbtResultBase, 'charAt'>;
  charCodeAt: $PropertyType<IFbtResultBase, 'charCodeAt'>;
  codePointAt: $PropertyType<IFbtResultBase, 'codePointAt'>;
  contains: $PropertyType<IFbtResultBase, 'contains'>;
  endsWith: $PropertyType<IFbtResultBase, 'endsWith'>;
  fixed: $PropertyType<IFbtResultBase, 'fixed'>;
  fontcolor: $PropertyType<IFbtResultBase, 'fontcolor'>;
  fontsize: $PropertyType<IFbtResultBase, 'fontsize'>;
  includes: $PropertyType<IFbtResultBase, 'includes'>;
  indexOf: $PropertyType<IFbtResultBase, 'indexOf'>;
  italics: $PropertyType<IFbtResultBase, 'italics'>;
  lastIndexOf: $PropertyType<IFbtResultBase, 'lastIndexOf'>;
  link: $PropertyType<IFbtResultBase, 'link'>;
  localeCompare: $PropertyType<IFbtResultBase, 'localeCompare'>;
  match: $PropertyType<IFbtResultBase, 'match'>;
  normalize: $PropertyType<IFbtResultBase, 'normalize'>;
  repeat: $PropertyType<IFbtResultBase, 'repeat'>;
  replace: $PropertyType<IFbtResultBase, 'replace'>;
  search: $PropertyType<IFbtResultBase, 'search'>;
  slice: $PropertyType<IFbtResultBase, 'slice'>;
  small: $PropertyType<IFbtResultBase, 'small'>;
  split: $PropertyType<IFbtResultBase, 'split'>;
  startsWith: $PropertyType<IFbtResultBase, 'startsWith'>;
  strike: $PropertyType<IFbtResultBase, 'strike'>;
  sub: $PropertyType<IFbtResultBase, 'sub'>;
  substr: $PropertyType<IFbtResultBase, 'substr'>;
  substring: $PropertyType<IFbtResultBase, 'substring'>;
  sup: $PropertyType<IFbtResultBase, 'sup'>;
  toLocaleLowerCase: $PropertyType<IFbtResultBase, 'toLocaleLowerCase'>;
  toLocaleUpperCase: $PropertyType<IFbtResultBase, 'toLocaleUpperCase'>;
  toLowerCase: $PropertyType<IFbtResultBase, 'toLowerCase'>;
  toUpperCase: $PropertyType<IFbtResultBase, 'toUpperCase'>;
  trim: $PropertyType<IFbtResultBase, 'trim'>;
  trimLeft: $PropertyType<IFbtResultBase, 'trimLeft'>;
  trimRight: $PropertyType<IFbtResultBase, 'trimRight'>;

  constructor(contents: Array<any>) {
    this._contents = contents;
    this._stringValue = null;
  }

  flattenToArray(): Array<ContentItem> {
    return FbtResultBaseImpl.flattenToArray(this._contents);
  }

  getContents() {
    return this._contents;
  }

  toString(): string {
    if (this._stringValue != null) {
      return this._stringValue;
    }
    let stringValue = '';
    const contents = this.flattenToArray();
    for (let ii = 0; ii < contents.length; ++ii) {
      const content = contents[ii];
      if (typeof content === 'string' || content instanceof FbtResultBaseImpl) {
        stringValue += content.toString();
      } else {
        let details = 'Context not logged.';
        if (!killswitch('JS_RELIABILITY_FBT_LOGGING')) {
          try {
            details = JSON.stringify(content).substr(0, 250);
          } catch (err) {
            // Catching circular reference error
            details = err.message;
          }
        }
        FBLogger('fbt')
          .blameToPreviousFile()
          .mustfix(
            'Converting to a string will drop content data. %s',
            details,
          );
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

  static flattenToArray(contents: NestedContentItems): Array<ContentItem> {
    const result = [];
    for (let ii = 0; ii < contents.length; ++ii) {
      const content = contents[ii];
      if (Array.isArray(content)) {
        result.push.apply(result, FbtResultBaseImpl.flattenToArray(content));
      } else if (content instanceof FbtResultBaseImpl) {
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
// The following methods are expected not to be supported soon.
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
  // $FlowFixMe Mock stringish methods
  FbtResultBaseImpl.prototype[methodName] = function() {
    logErrorUseStringMethod(methodName);
    return this.toString()[methodName].apply(this, arguments);
  };
});

module.exports = ((FbtResultBaseImpl: $FlowFixMe): Class<FbtResultBase>);
