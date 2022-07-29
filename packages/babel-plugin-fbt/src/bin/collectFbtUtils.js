/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

/* eslint max-len: ["warn", 120] */

import type {FbtExtraOptionConfig} from '../FbtConstants.js';
import type {CollectFbtOutput} from './collectFbt';
import type {
  CollectorConfig,
  IFbtCollector,
  PackagerPhrase,
} from './FbtCollector';
import type {HashFunction} from './TextPackager';

const {packagerTypes} = require('./collectFbtConstants');
const FbtCollector = require('./FbtCollector');
const PhrasePackager = require('./PhrasePackager');
const TextPackager = require('./TextPackager');
const invariant = require('invariant');
const path = require('path');

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
  return {
    phrases: packagers
      .reduce(
        (phrases, packager) => packager.pack(phrases),
        fbtCollector.getPhrases(),
      )
      .map(phrase => ({
        ...phrase,
        // using `undefined` so that the field is not outputted by JSON.stringify
        jsfbt: options.terse ? undefined : phrase.jsfbt,
      })),
    childParentMappings: fbtCollector.getChildParentMappings(),
    fbtElementNodes: options.genFbtNodes
      ? fbtCollector.getFbtElementNodes()
      : // using `undefined` so that the field is not outputted by JSON.stringify
        undefined,
  };
}

function getTextPackager(hashModulePath: string): TextPackager {
  // $FlowExpectedError[unsupported-syntax] Requiring dynamic module
  const hashingModule = (require(hashModulePath):
    | HashFunction
    | {getFbtHash: HashFunction});

  invariant(
    typeof hashingModule === 'function' ||
      (typeof hashingModule === 'object' &&
        typeof hashingModule.getFbtHash === 'function'),
    'Expected hashing module to expose a default value that is a function, ' +
      'or an object with a getFbtHash() function property. Hashing module location: `%s`',
    hashModulePath,
  );
  return new TextPackager(
    typeof hashingModule === 'function'
      ? hashingModule
      : hashingModule.getFbtHash,
  );
}

function getPackagers(
  packager: string,
  hashModulePath: string,
): $ReadOnlyArray<
  | {|pack: (phrases: Array<PackagerPhrase>) => Array<PackagerPhrase>|}
  | PhrasePackager
  | TextPackager,
> {
  switch (packager) {
    case packagerTypes.TEXT:
      return [getTextPackager(hashModulePath)];
    case packagerTypes.PHRASE:
      return [new PhrasePackager()];
    case packagerTypes.BOTH:
      return [getTextPackager(hashModulePath), new PhrasePackager()];
    case packagerTypes.NONE:
      return [{pack: phrases => phrases}];
    default:
      throw new Error('Unrecognized packager option');
  }
}

function getFbtCollector(
  collectorConfig: CollectorConfig,
  extraOptions: FbtExtraOptionConfig,
  customCollectorPath: ?string,
): IFbtCollector {
  if (customCollectorPath == null) {
    return new FbtCollector(collectorConfig, extraOptions);
  }
  const absPath = path.isAbsolute(customCollectorPath)
    ? customCollectorPath
    : path.resolve(process.cwd(), customCollectorPath);

  // $FlowExpectedError[unsupported-syntax] Need to import custom module
  const CustomCollector: Class<IFbtCollector> = require(absPath);
  return new CustomCollector(collectorConfig, extraOptions);
}

module.exports = {
  buildCollectFbtOutput,
  getFbtCollector,
  getPackagers,
};
