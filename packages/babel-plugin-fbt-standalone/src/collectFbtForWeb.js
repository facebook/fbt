/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+internationalization
 */

/* eslint-disable fb-www/flow-exact-by-default-object-types */
/* eslint max-len: ["warn", 120] */

import type {
  PatternHash,
  PatternString,
} from '../../../../../../../../html/shared/intl/fbt/FbtTable';
import type {ExtraOptions} from 'babel-plugin-fbt';
import type {CollectFbtOutput} from 'babel-plugin-fbt/dist/bin/collectFbt';
import type {
  CollectorConfig,
  Errors,
} from 'babel-plugin-fbt/dist/bin/FbtCollector';

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
function getCollectFbtPayloadFromSource_EXPERIMENTAL(
  source: string,
  config: {|
    ...CollectorConfig,
    genFbtNodes: boolean,
    terse?: boolean,
  |},
  extraOptions: ExtraOptions,
): {
  output: ?CollectFbtOutput,
  error: ?Error,
} {
  const fileName = 'dummy_file';
  let extractionError;
  let output;
  let fbtCollector;
  try {
    const {terse, genFbtNodes, ...collectorConfig} = config;
    fbtCollector = new FbtCollector(collectorConfig, extraOptions);

    fbtCollector.collectFromOneFile(source, fileName);
    output = buildCollectFbtOutput(
      fbtCollector,
      [new TextPackager(getMD5Hash)],
      {
        terse: !!terse,
        genFbtNodes,
      },
    );
  } catch (error) {
    extractionError = error;
  }
  return {
    output,
    error:
      extractionError || (fbtCollector && fbtCollector.getErrors()[fileName]),
  };
}

module.exports = {
  getCollectFbtPayloadFromSource_EXPERIMENTAL,
};
