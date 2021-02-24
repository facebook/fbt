/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @flow
 * @format
 * @emails oncall+internationalization
 */

/*global process:false*/

/* eslint max-len: ["warn", 120] */

'use strict';

import type {HashFunction} from './TextPackager';

const FbtCollector = require('./FbtCollector');
const PhrasePackager = require('./PhrasePackager');
const TextPackager = require('./TextPackager');
const fs = require('fs');
const nullthrows = require('nullthrows');
const path = require('path');
const yargs = require('yargs');

const args = {
  AUXILIARY_TEXTS: 'auxiliary-texts',
  COMMON_STRINGS: 'fbt-common-path',
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
};

const packagerTypes = {
  TEXT: 'text',
  PHRASE: 'phrase',
  BOTH: 'both',
  NONE: 'none',
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
  .boolean(args.AUXILIARY_TEXTS)
  .describe(
    args.AUXILIARY_TEXTS,
    'Include auxiliary intermediary data-structure `texts` that includes the ' +
      'list of constructs passed to the fbt instance.',
  )
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
  ).argv;

const packager = argv[args.PACKAGER];

function getHasher(): HashFunction {
  let hashPhrases = null;
  if (packager === packagerTypes.TEXT || packager === packagerTypes.BOTH) {
    // $FlowExpectedError[unsupported-syntax] Requiring dynamic module
    hashPhrases = require(argv[args.HASH]);
    if (hashPhrases.hashPhrases != null) {
      hashPhrases = hashPhrases.hashPhrases;
    }
  }
  return nullthrows(hashPhrases);
}

const extraOptions = {};
const cliExtraOptions = argv[args.OPTIONS];
if (cliExtraOptions) {
  const opts = cliExtraOptions.split(',');
  for (let ii = 0; ii < opts.length; ++ii) {
    extraOptions[opts[ii]] = true;
  }
}

const fbtCollector = new FbtCollector(
  {
    auxiliaryTexts: argv[args.AUXILIARY_TEXTS],
    plugins: argv[args.PLUGINS].map(require),
    presets: argv[args.PRESETS].map(require),
    reactNativeMode: argv[args.REACT_NATIVE_MODE],
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
  process.stdout.write(
    JSON.stringify(
      {
        phrases: getPackagers()
          .reduce(
            (phrases, packager) => packager.pack(phrases),
            fbtCollector.getPhrases(),
          )
          .map(phrase => {
            if (argv[args.TERSE]) {
              const {jsfbt: _, ...phraseWithoutJSFBT} = phrase;
              return phraseWithoutJSFBT;
            }
            return phrase;
          }),
        childParentMappings: fbtCollector.getChildParentMappings(),
      },
      ...(argv[args.PRETTY] ? [null, ' '] : []),
    ),
  );
  process.stdout.write('\n');

  const errs = fbtCollector.getErrors();
  const errCount = Object.keys(errs).length;
  if (errCount > 0) {
    for (const filePath in errs) {
      const error = errs[filePath];
      process.stderr.write(
        `[file="${filePath}"]:\n\t` + String(error.stack || error) + '\n',
      );
    }
    throw new Error(`Failed in ${errCount} file(s).`);
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
  stream.on('end', function () {
    processSource(source);
    writeOutput();
  });
} else {
  // Files given as arguments, read from those one-by-one, then write output as
  // a whole.
  fbtCollector.collectFromFiles(argv._);
  writeOutput();
}
