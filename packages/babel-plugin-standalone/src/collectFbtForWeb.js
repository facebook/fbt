/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

/* eslint max-len: ["warn", 120] */

import type {
  PatternHash,
  PatternString,
} from '../../../runtime/shared/FbtTable';
import type {CollectFbtOutput} from 'babel-plugin-fbt/dist/bin/collectFbt';
import type {FbtExtraOptionConfig} from 'babel-plugin-fbt/dist/FbtConstants';

const SparkMD5 = require('./SparkMD5');
const {
  buildCollectFbtOutput,
} = require('babel-plugin-fbt/dist/bin/collectFbtUtils');
const FbtCollector = require('babel-plugin-fbt/dist/bin/FbtCollector');
const TextPackager = require('babel-plugin-fbt/dist/bin/TextPackager');

function getMD5Hash(text: PatternString, description: string): PatternHash {
  return SparkMD5.hash(text + description);
}

/**
 * A basic convenience function to extract fbt strings from a given JS source string.
 * NOTE: uses the "TEXT" packager by default.
 */
function collectFbtPayloadFromSource(
  source: string,
  config: {|
    // Subset of CollectorConfig to simplify the exported types
    generateOuterTokenName?: boolean,
    genFbtNodes: boolean,
    terse?: boolean,
  |},
  extraOptions: FbtExtraOptionConfig,
): CollectFbtOutput {
  const fileName = 'dummy_file';
  const {genFbtNodes, terse, ...collectorConfig} = config;
  const fbtCollector = new FbtCollector(collectorConfig, extraOptions);

  fbtCollector.collectFromOneFile(source, fileName);
  const output = buildCollectFbtOutput(
    fbtCollector,
    [new TextPackager(getMD5Hash)],
    {
      terse: !!terse,
      genFbtNodes,
    },
  );

  const extractionError = fbtCollector.getErrors()[fileName];
  if (extractionError) {
    throw extractionError;
  }
  return output;
}

module.exports = {
  collectFbtPayloadFromSource,
};
