/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

/* eslint no-bitwise: 0 */

'use strict';

import type {TableJSFBTTree, TableJSFBTTreeLeaf} from './index';

const jenkinsHash = require('./jenkinsHash');
const {mapLeaves, onEachLeaf} = require('./JSFbtUtil');
const invariant = require('invariant');

function fbtJenkinsHash(jsfbt: $ReadOnly<TableJSFBTTree>): number {
  let desc = null;
  let leavesHaveSameDesc = true;
  onEachLeaf({jsfbt: {t: jsfbt, m: []}}, (leaf: TableJSFBTTreeLeaf) => {
    if (desc == null) {
      desc = leaf.desc;
    } else if (desc !== leaf.desc) {
      leavesHaveSameDesc = false;
    }
  });

  if (leavesHaveSameDesc) {
    const hashInputTree = mapLeaves(
      jsfbt,
      (leaf: $ReadOnly<TableJSFBTTreeLeaf>) => {
        return leaf.tokenAliases != null
          ? {text: leaf.text, tokenAliases: leaf.tokenAliases}
          : leaf.text;
      },
    );
    invariant(
      desc != null,
      'Expect `desc` to be nonnull as `TableJSFBTTree` should contain at least ' +
        'one leaf.',
    );
    const key = JSON.stringify(hashInputTree) + '|' + desc;
    return jenkinsHash(key);
  }

  const hashInputTree = mapLeaves(
    jsfbt,
    (leaf: $ReadOnly<TableJSFBTTreeLeaf>) => {
      const newLeaf = {desc: leaf.desc, text: leaf.text};
      return leaf.tokenAliases != null
        ? {...newLeaf, tokenAliases: leaf.tokenAliases}
        : newLeaf;
    },
  );
  return jenkinsHash(JSON.stringify(hashInputTree));
}

module.exports = fbtJenkinsHash;
