/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @flow
 * @emails oncall+internationalization
 */

'use strict';

// flowlint ambiguous-object-type:error

/*::
import type {JSModuleNameType} from './FbtConstants';
type FbtCommonMap = { [text: string]: string, ... };
*/

const textToDesc /*: FbtCommonMap */ = {};

const FbtCommon = {
  init(
    opts /*: {fbtCommon?: FbtCommonMap, fbtCommonPath?: string, ...} */ = {},
  ) /*: void */ {
    if (opts.fbtCommon) {
      Object.assign(textToDesc, opts.fbtCommon);
    }
    if (opts.fbtCommonPath != null) {
      // $FlowFixMe - dynamic require
      Object.assign(textToDesc, require(opts.fbtCommonPath));
    }
  },

  getDesc(text /*: string */) /*: ?string */ {
    return textToDesc[text];
  },

  getUnknownCommonStringErrorMessage(
    moduleName /*: JSModuleNameType */,
    text /*: string */
  ) /*: string */ {
    return `Unknown string "${text}" for <${moduleName} common={true}>`;
  }
};

module.exports = FbtCommon;
