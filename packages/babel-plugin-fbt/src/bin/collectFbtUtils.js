/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @flow strict-local
 * @format
 * @emails oncall+internationalization
 */

/* eslint-disable fb-www/flow-exact-by-default-object-types */
/* eslint max-len: ["warn", 120] */

import type {CollectFbtOutput} from './collectFbt';
import type {IFbtCollector, PackagerPhrase} from './FbtCollector';
import type PhrasePackager from './PhrasePackager';
import type TextPackager from './TextPackager';

function buildCollectFbtOutput(
  fbtCollector: IFbtCollector,
  packagers: $ReadOnlyArray<
    | {|pack: (phrases: Array<PackagerPhrase>) => Array<PackagerPhrase>|}
    | PhrasePackager
    | TextPackager,
  >,
  options: {|
    genFbtNodes: boolean,
    terse: boolean,
  |},
): CollectFbtOutput {
  const output = {
    phrases: packagers
      .reduce(
        (phrases, packager) => packager.pack(phrases),
        fbtCollector.getPhrases(),
      )
      .map(phrase => {
        if (options.terse) {
          const {jsfbt: _, ...phraseWithoutJSFBT} = phrase;
          return phraseWithoutJSFBT;
        }
        return phrase;
      }),
    childParentMappings: fbtCollector.getChildParentMappings(),
    fbtElementNodes: options.genFbtNodes
      ? fbtCollector.getFbtElementNodes()
      : null,
  };
  if (!output.fbtElementNodes) {
    delete output.fbtElementNodes;
  }
  return output;
}

module.exports = {
  buildCollectFbtOutput,
};
