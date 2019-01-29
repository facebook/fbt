/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p babel_plugin_fbt --remote localhost:~/www
 *
 * @flow
 * @format
 */

/*global process:false*/

/* eslint max-len: ["warn", 120] */

'use strict';

const FbtCollector = require('./FbtCollector');
const PhrasePackager = require('./PhrasePackager');
const TextPackager = require('./TextPackager');
const fs = require('fs');
const optimist = require('optimist');
const path = require('path');

const args = {
  AUXILIARY_TEXTS: 'auxiliary-texts',
  HASH: 'hash-module',
  HELP: 'h',
  OPTIONS: 'options',
  PACKAGER: 'packager',
  PRETTY: 'pretty',
  REACT_NATIVE_MODE: 'react-native-mode',
  STDIN: 'stdin',
  TERSE: 'terse',
};

const argv = optimist
  .usage('Collect fbt instances from source:\n$0 [options]')
  .default(args.HASH, __dirname + '/md5Texts')
  .describe(args.HASH, 'Path to hashing module to use in text packager.')
  .default(args.PACKAGER, 'text')
  .describe(
    args.PACKAGER,
    'Packager to use.  Choices are:\n' +
      "  'text' - hashing is done at the text-level (more granular)\n" +
      "'phrase' - hashing is done at the phrase-level (less granular)\n" +
      "  'noop' - No hashing or massaging of phrase data\n",
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
  .boolean(args.STDIN)
  .describe(
    args.STDIN,
    'Interpret stdin as JSON map of {<enum-manifest-file>: ' +
      '[<source_file1>, ...]}. Otherwise STDIN itself will be parsed',
  )
  .boolean(args.PRETTY)
  .default(args.PRETTY, false)
  .describe(args.PRETTY, 'Pretty-print the JSON output')
  .string(args.OPTIONS)
  .describe(
    args.OPTIONS,
    'additional options that fbt(..., {can: "take"}).  ' +
      `i.e. --${args.OPTIONS} "locale,qux,id"`,
  ).argv;

const extraOptions = {};
if (argv[args.OPTIONS]) {
  const opts = argv[args.OPTIONS].split(',');
  for (let ii = 0; ii < opts.length; ++ii) {
    extraOptions[opts[ii]] = true;
  }
}

const fbtCollector = new FbtCollector(
  {
    auxiliaryTexts: argv[args.AUXILIARY_TEXTS],
    reactNativeMode: argv[args.REACT_NATIVE_MODE],
  },
  extraOptions,
);

function processJsonSource(source) {
  const json = JSON.parse(source);
  Object.keys(json).forEach(function(manifest_path) {
    let manifest = {};
    if (fs.existsSync(manifest_path)) {
      // $FlowFixMe
      manifest = require(path.resolve(process.cwd(), manifest_path));
    }
    fbtCollector.collectFromFiles(json[manifest_path], manifest);
  });
}

function writeOutput() {
  const phrases = fbtCollector.getPhrases();
  process.stdout.write(
    JSON.stringify(
      {
        phrases: getPackager().pack(phrases),
        childParentMappings: fbtCollector.getChildParentMappings(),
      },
      ...(argv[args.PRETTY] ? [null, ' '] : []),
    ),
  );
  process.stdout.write('\n');

  const errs = fbtCollector.getErrors();
  const errCount = Object.keys(errs).length;
  if (errCount > 0) {
    for (const f in errs) {
      process.stderr.write(f + ':\n\t' + errs[f].toString() + '\n');
    }
    throw new Error(`Failed in ${errCount} files`);
  }
}

function processSource(source, filepath) {
  if (argv[args.STDIN]) {
    processJsonSource(source);
  } else {
    fbtCollector.collectFromOneFile(source, filepath);
  }
}

function getPackager() {
  switch (argv[args.PACKAGER]) {
    case 'text':
      // $FlowFixMe
      return new TextPackager(require(argv[args.HASH]), argv[args.TERSE]);
    case 'phrase':
      return new PhrasePackager(argv[args.TERSE]);
    case 'noop':
      return {pack: phrases => phrases};
    default:
      throw new Error('Unrecognized packager option');
  }
}

if (argv[args.HELP]) {
  optimist.showHelp();
} else if (!argv._.length) {
  // No files given, read stdin as the sole input.
  const stream = process.stdin;
  let source = '';
  stream.setEncoding('utf8');
  stream.on('data', function(chunk) {
    source += chunk;
  });
  stream.on('end', function() {
    processSource(source);
    writeOutput();
  });
} else {
  // Files given as arguments, read from those one-by-one, then write output as
  // a whole.
  fbtCollector.collectFromFiles(argv._);
  writeOutput();
}
