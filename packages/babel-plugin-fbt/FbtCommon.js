/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @flow
 */

'use strict';

/*::
type FbtCommonMap = {
  [text: string]: string
}
*/

const textToDesc /*: FbtCommonMap*/ = {};

const FbtCommon = {
  init(
    opts /*: {fbtCommon?: FbtCommonMap, fbtCommonPath?: string} */ = {},
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
  }
};

module.exports = FbtCommon;
