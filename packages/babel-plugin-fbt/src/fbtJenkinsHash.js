/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict-local
 * @emails oncall+i18n_fbt_js
 */

/* eslint no-bitwise: 0 */

'use strict';

import type {TableJSFBTTree, TableJSFBTTreeLeaf} from './index';

const jenkinsHash = require('./jenkinsHash');
const {mapLeaves} = require('./JSFbtUtil');

function fbtJenkinsHash(jsfbt: $ReadOnly<TableJSFBTTree>): number {
  // Strip leaves of metadata keys and only keep `text` and `desc` key.
  // This will give us the flexibility of modifying metadata without updating hashes.
  const hashInputTree = mapLeaves(
    jsfbt,
    (leaf: $ReadOnly<TableJSFBTTreeLeaf>) => {
      return {desc: leaf.desc, text: leaf.text};
    },
  );
  return jenkinsHash(JSON.stringify(hashInputTree));
}

module.exports = fbtJenkinsHash;
