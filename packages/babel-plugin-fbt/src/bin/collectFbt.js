/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @flow
 * @format
 * @emails oncall+internationalization
 */

/*global process:false*/
/* eslint-disable fb-www/flow-exact-by-default-object-types */

/* eslint max-len: ["warn", 120] */

'use strict';

import type {PlainFbtNode} from '../fbt-nodes/FbtNode';
import type {ExtraOptions, TableJSFBT} from '../index';
import type {
  ChildParentMappings,
  CollectorConfig,
  IFbtCollector,
  PackagerPhrase,
} from './FbtCollector';
import type {HashFunction} from './TextPackager';
export type CollectFbtOutput = {|
  phrases: Array<
    | PackagerPhrase
    | $Rest<
        PackagerPhrase,
        {|
          jsfbt: TableJSFBT,
        |},
      >,
  >,
  childParentMappings: ChildParentMappings,
  fbtElementNodes?: ?Array<PlainFbtNode>,
|};

const {packagerTypes} = require('./collectFbtConstants');
const {buildCollectFbtOutput} = require('./collectFbtUtils');
const FbtCollector = require('./FbtCollector');
const PhrasePackager = require('./PhrasePackager');
const TextPackager = require('./TextPackager');
const fs = require('fs');
const invariant = require('invariant');
const nullthrows = require('nullthrows');
const path = require('path');
const yargs = require('yargs');

const args = {
  COMMON_STRINGS: 'fbt-common-path',
  CUSTOM_COLLECTOR: 'custom-collector',
  GEN_FBT_NODES: 'gen-fbt-nodes',
  GEN_OUTER_TOKEN_NAME: 'gen-outer-token-name',
  HASH: 'hash-module',
  HELP: 'h',
  MANIFEST: 'manifest',
  OPTIONS: 'options',
  PACKAGER: 'packager',
  PLUGINS: 'plugins',
  PRESETS: 'presets',
  PRETTY: 'pretty',
  REACT_NATIVE_MODE: 'react-native-mode',
  TERSE: 'terse',
  TRANSFORM: 'transform',
};

const argv = yargs
  .usage('Collect fbt instances from source:\n$0 [options]')
  .default(args.HASH, __dirname + '/md5Texts')
  .describe(args.HASH, 'Path to hashing module to use in text packager.')
  .default(args.PACKAGER, 'text')
  .describe(
    args.PACKAGER,
    'Packager to use.  Choices are:\n' +
      "  'text' - hashing is done at the text (or leaf) level (more granular)\n" +
      "'phrase' - hashing is done at the phrase (entire fbt callsite) level\n" +
      "  'both' - Both phrase and text hashing are performed\n" +
      "  'none' - No hashing or alteration of phrase data\n",
  )
  .choices(
    args.PACKAGER,
    // $FlowFixMe[incompatible-cast] needed because Object.values() returns mixed only...
    (Object.values(packagerTypes): Array<$Values<typeof packagerTypes>>),
  )
  .boolean(args.TERSE)
  .default(args.TERSE, false)
  .describe(
    args.TERSE,
    'By default, we output the entirety of the fbt callsite including ' +
      'auxiliary jsfbt table and metadata.  Set to to true to output only ' +
      'hashes, texts, and descriptions of the fbt callsite. The goal being ' +
      'to minify the amount of I/O processing needed for scraping source ' +
      'into a data store to share with translators, where this auxiliary data ' +
      "isn't necessary.",
  )
  .boolean(args.REACT_NATIVE_MODE)
  .default(args.REACT_NATIVE_MODE, false)
  .describe(
    args.REACT_NATIVE_MODE,
    'By default, we include enums in the jsfbt payload we produce. However, ' +
      'Flatbuffer language packs only work with predefined keys, so we need to ' +
      'move enums out of the jsfbt payload and output leaf payloads instead.',
  )
  .describe(args.HELP, 'Display usage message')
  .alias(args.HELP, 'help')
  .boolean(args.MANIFEST)
  .default(args.MANIFEST, false)
  .describe(
    args.MANIFEST,
    'Interpret stdin as JSON map of {<enum-manifest-file>: ' +
      '[<source_file1>, ...]}. Otherwise stdin itself will be parsed',
  )
  .string(args.COMMON_STRINGS)
  .default(args.COMMON_STRINGS, null)
  .describe(
    args.COMMON_STRINGS,
    'Optional path to the common strings module. ' +
      'This is a map from {[text]: [description]}.',
  )
  .boolean(args.PRETTY)
  .default(args.PRETTY, false)
  .describe(args.PRETTY, 'Pretty-print the JSON output')
  .boolean(args.GEN_OUTER_TOKEN_NAME)
  .default(args.GEN_OUTER_TOKEN_NAME, false)
  .describe(
    args.GEN_OUTER_TOKEN_NAME,
    'Generate the outer token name of an inner string in the JSON output. ' +
      'E.g. For the fbt string `<fbt>Hello <i>World</i></fbt>`, ' +
      'the outer string is "Hello {=World}", and the inner string is: "World". ' +
      'So the outer token name of the inner string will be "=World"',
  )
  .string(args.TRANSFORM)
  .boolean(args.GEN_FBT_NODES)
  .default(args.GEN_FBT_NODES, false)
  .describe(
    args.GEN_FBT_NODES,
    'Generate the abstract representation of the fbt callsites as FbtNode trees.',
  )
  .string(args.TRANSFORM)
  .default(args.TRANSFORM, null)
  .describe(
    args.TRANSFORM,
    'A custom transform to call into rather than the default provided. ' +
      'Expects a signature of (source, options, filename) => mixed, and ' +
      'for babel-pluginf-fbt to be run within the transform.',
  )
  .array(args.PLUGINS)
  .default(args.PLUGINS, [])
  .describe(
    args.PLUGINS,
    'List of auxiliary Babel plugins to enable for parsing source.\n' +
      'E.g. --plugins @babel/plugin-syntax-dynamic-import @babel/plugin-syntax-numeric-separator',
  )
  .array(args.PRESETS)
  .default(args.PRESETS, [])
  .describe(
    args.PRESETS,
    'List of auxiliary Babel presets to enable for parsing source.\n' +
      'E.g. --presets @babel/preset-typescript',
  )
  .string(args.OPTIONS)
  .describe(
    args.OPTIONS,
    'additional options that fbt(..., {can: "take"}).  ' +
      `i.e. --${args.OPTIONS} "locale,qux,id"`,
  )
  .string(args.CUSTOM_COLLECTOR)
  .describe(
    args.CUSTOM_COLLECTOR,
    `In some complex scenarios, passing custom Babel presets or plugins to preprocess ` +
      `the input JS is not flexible enough. As an alternative, you can provide your own ` +
      `implementation of the FbtCollector module. ` +
      `It must at least expose the same public methods to expose the extract fbt phrases.\n` +
      `i.e. --${args.CUSTOM_COLLECTOR} myFbtCollector.js`,
  ).argv;

const packager = argv[args.PACKAGER];

function getHasher(): HashFunction {
  let hashFunction = null;
  if (packager === packagerTypes.TEXT || packager === packagerTypes.BOTH) {
    // $FlowExpectedError[unsupported-syntax] Requiring dynamic module
    const hashingModule = (require(argv[args.HASH]):
      | HashFunction
      | {getFbtHash: HashFunction});

    invariant(
      typeof hashingModule === 'function' ||
        (typeof hashingModule === 'object' &&
          typeof hashingModule.getFbtHash === 'function'),
      'Expected hashing module to expose a default value that is a function, ' +
        'or an object with a getFbtHash() function property. Hashing module location: `%s`',
      argv[args.HASH],
    );
    hashFunction =
      typeof hashingModule === 'function'
        ? hashingModule
        : hashingModule.getFbtHash;
  }
  return nullthrows(hashFunction);
}

const extraOptions = {};
const cliExtraOptions = argv[args.OPTIONS];
if (cliExtraOptions) {
  const opts = cliExtraOptions.split(',');
  for (let ii = 0; ii < opts.length; ++ii) {
    extraOptions[opts[ii]] = true;
  }
}
const transformPath = argv[args.TRANSFORM];
// $FlowExpectedError[unsupported-syntax] Requiring dynamic module
const transform = transformPath ? require(transformPath) : null;

function getFbtCollector(
  collectorConfig: CollectorConfig,
  extraOptions: ExtraOptions,
): IFbtCollector {
  let customCollectorPath: string = argv[args.CUSTOM_COLLECTOR];
  if (customCollectorPath) {
    customCollectorPath = path.isAbsolute(customCollectorPath)
      ? customCollectorPath
      : path.resolve(process.cwd(), customCollectorPath);

    // $FlowExpectedError[unsupported-syntax] Need to import custom module
    const CustomCollector: Class<IFbtCollector> = require(customCollectorPath);
    return new CustomCollector(collectorConfig, extraOptions);
  } else {
    return new FbtCollector(collectorConfig, extraOptions);
  }
}

const fbtCollector = getFbtCollector(
  {
    generateOuterTokenName: argv[args.GEN_OUTER_TOKEN_NAME],
    plugins: argv[args.PLUGINS].map(require),
    presets: argv[args.PRESETS].map(require),
    reactNativeMode: argv[args.REACT_NATIVE_MODE],
    transform,
    fbtCommonPath: argv[args.COMMON_STRINGS],
  },
  extraOptions,
);

function processJsonSource(source) {
  const json = JSON.parse(source);
  Object.keys(json).forEach(function (manifest_path) {
    let manifest = {};
    if (fs.existsSync(manifest_path)) {
      manifest = require(path.resolve(process.cwd(), manifest_path));
    }
    fbtCollector.collectFromFiles(json[manifest_path], manifest);
  });
}

function writeOutput() {
  const output = buildCollectFbtOutput(fbtCollector, getPackagers(), {
    terse: argv[args.TERSE],
    genFbtNodes: argv[args.GEN_FBT_NODES],
  });
  process.stdout.write(
    JSON.stringify(
      (output: CollectFbtOutput),
      ...(argv[args.PRETTY] ? [null, ' '] : []),
    ),
  );
  process.stdout.write('\n');

  const errs = fbtCollector.getErrors();
  const errCount = Object.keys(errs).length;
  if (errCount > 0) {
    const childErrorMessages = [];
    for (const filePath in errs) {
      const error = errs[filePath];
      const childErrorMessage =
        `[file="${filePath}"]:\n\t` + String(error.stack || error);
      process.stderr.write(childErrorMessage + '\n');
      childErrorMessages.push(childErrorMessage);
    }
    const overallError = new Error(
      `Failed in ${errCount} file(s).` +
        `\nCurrent working directory: '${process.cwd()}'`,
    );
    // $FlowExpectedError[prop-missing] Adding a custom error field
    overallError.childErrorMessages = childErrorMessages;
    throw overallError;
  }
}

function processSource(source) {
  if (argv[args.MANIFEST]) {
    processJsonSource(source);
  } else {
    fbtCollector.collectFromOneFile(source);
  }
}

function getPackagers() {
  switch (packager) {
    case packagerTypes.TEXT:
      return [new TextPackager(getHasher())];
    case packagerTypes.PHRASE:
      return [new PhrasePackager()];
    case packagerTypes.BOTH:
      return [new TextPackager(getHasher()), new PhrasePackager()];
    case packagerTypes.NONE:
      return [{pack: phrases => phrases}];
    default:
      throw new Error('Unrecognized packager option');
  }
}

// TODO(T40113359) Remove this once this script is ready to be tested
function catchKnownErrors__DEBUG_ONLY(callback) {
  try {
    callback();
  } catch (error) {
    const childErrorMessages: ?Array<string> = error.childErrorMessages;
    const hasKnownErrors =
      Array.isArray(childErrorMessages) &&
      childErrorMessages.findIndex(
        message =>
          message.includes(
            'fbt only accepts plain strings with params wrapped',
          ) ||
          message.includes(
            'This method must be implemented in a child class',
          ) ||
          message.includes('Not implemented yet'),
      ) > -1;

    if (hasKnownErrors) {
      console.warn(
        `WARN: %s: error(s) occurred but it's ok since ` +
          `this script is not ready for testing yet.\n%s`,
        require('path').basename(__filename),
        error,
      );
    } else {
      throw error;
    }
  }
}

if (argv[args.HELP]) {
  yargs.showHelp();
} else if (!argv._.length) {
  // No files given, read stdin as the sole input.
  const stream = process.stdin;
  let source = '';
  stream.setEncoding('utf8');
  stream.on('data', function (chunk) {
    source += chunk;
  });
  stream.on('end', () => {
    catchKnownErrors__DEBUG_ONLY(() => {
      processSource(source);
      writeOutput();
    });
  });
} else {
  catchKnownErrors__DEBUG_ONLY(() => {
    // Files given as arguments, read from those one-by-one, then write output as
    // a whole.
    fbtCollector.collectFromFiles(argv._);
    writeOutput();
  });
}
