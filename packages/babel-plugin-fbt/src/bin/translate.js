/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 * @noflow
 */

/* eslint max-len: ["warn", 120] */
/**
 * Reads the JSON payload of the source strings of the following form:
 *
 * {
 *  "phrases": [
 *    {
 *      "hashToText": {
 *        "40bd5bc10bd59fe020569068cfd7d814": "Your FBT Demo"
 *      },
 *      ...,
 *      "jsfbt": "Your FBT Demo"
 *    },
 *    ...
 *  ],
 * }
 *
 * and JSON payloads (either in an arbitrary number of files when
 * using --translations) or grouped in a monolithic JSON file when
 * using --stdin array under `translationGroups`
 *
 *  {
 *    "fb-locale": "fb_HX",
 *    "translations": {
 *      "JBhJwfCe2TutVvTr9c9HLw==": {
 *        "tokens": {},
 *        "types": {},
 *        "translations": [{
 *          "translation": "Y0ur FBT D3m0",
 *          "variations": []
 *        }]
 *      }
 *    }
 *  }
 *
 * and by default, returns the translated phrases in the following format:
 *
 * [
 *   {
 *     "fb-locale":"fb_HX",
 *     "translatedPhrases":[
 *       "Y0ur FBT D3m0",
 *        ...,
 *     ]
 *   }
 *   ...,
 * ]
 *
 * If intended for use as a runtime dictionary (accessed within the
 * runtime `fbt._` via `FbtTranslations` when using the
 * babel-fbt-runtime plugin), You can:
 *
 *  (A) Rely on the jenkins hash default and pass the --jenkins option OR
 *  (B) Pass in a custom hash module as --fbt-hash-module.
 *    You MUST ensure this is the same hash module as used in the
 *    babel-fbt-runtime.  Otherwise, you'll have a BAD time
 *
 * When using the runtime dictionary options, output will be of the form:
 *
 *  {
 *    <locale>: {
 *      <hash>: <payload>,
 *      ...
 *    },
 *    ...
 *   }
 *
 */

'use strict';

const {processFiles, processJSON} = require('./translateUtils');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

const args = {
  HASH: 'fbt-hash-module',
  HELP: 'h',
  JENKINS: 'jenkins',
  PRETTY: 'pretty',
  SRC: 'source-strings',
  STDIN: 'stdin',
  TRANSLATIONS: 'translations',
  OUTPUT_DIR: 'output-dir',
};

const argv = yargs
  .usage('Translate fbt phrases with provided translations:\n$0 [options]')
  .boolean(args.JENKINS)
  .default(args.JENKINS, false)
  .describe(
    args.JENKINS,
    'By default, we output the translations as an associative array whose ' +
      "indices match the phrases provided.  If instead, you'd like a mapping " +
      'from the associated "jenkins" hash to translation payload (for use in ' +
      'babel-fbt-runtime plugin, for instance) you can use this',
  )
  .string(args.HASH)
  .default(args.HASH, false)
  .describe(
    args.HASH,
    `Similar to --${args.JENKINS}, but pass the hash-module of your choice.  The ` +
      'module should export a function with the same signature and operation ' +
      'of fbt-hash-module',
  )
  .boolean(args.STDIN)
  .default(args.STDIN, false)
  .describe(
    args.STDIN,
    'Instead of reading translation files and source file separately, read ' +
      'from STDIN as a monolothic JSON payload',
  )
  .string(args.SRC)
  .default(args.SRC, '.source_strings.json')
  .describe(
    args.SRC,
    'The file containing source strings, as collected by collectFbt.js',
  )
  .array(args.TRANSLATIONS)
  .default(args.TRANSLATIONS, null)
  .describe(
    args.TRANSLATIONS,
    'The translation files containing translations corresponding to source-strings',
  )
  .boolean(args.PRETTY)
  .default(args.PRETTY, false)
  .describe(args.PRETTY, 'pretty print the translation output')
  .describe(args.HELP, 'Display usage message')
  .alias(args.HELP, 'help')
  .string(args.OUTPUT_DIR)
  .default(args.OUTPUT_DIR, null)
  .alias(args.OUTPUT_DIR, 'o')
  .describe(
    args.OUTPUT_DIR,
    'By default, we write the output to stdout. If you instead would like to split ' +
      'the output by locale you can use this arg to specify an output directory. ' +
      'This is useful when you want to lazy load translations per locale.',
  ).argv;

function createJSON(obj) {
  return JSON.stringify(obj, ...(argv[args.PRETTY] ? [null, 2] : []));
}

function writeOutput(output) {
  const outputDir = yargs.argv[args.OUTPUT_DIR];
  if (outputDir) {
    fs.mkdirSync(outputDir, {recursive: true});

    Object.keys(output).forEach(locale => {
      fs.writeFileSync(
        path.join(outputDir, `${locale}.json`),
        createJSON({[locale]: output[locale]}),
      );
    });
  } else {
    process.stdout.write(createJSON(output));
  }
}

// TODO(T40113359) Remove this once this script is ready to be tested
function catchKnownErrors__DEBUG_ONLY(callback) {
  try {
    callback();
  } catch (error) {
    if (
      [
        'Cannot convert undefined or null to object',
        'JSFBT is not a string type',
        'Unexpected end of JSON input',
        "Cannot read property 'hasVariationMask' of undefined",
        "Cannot read property 'title' of undefined",
        // TODO:(T92301984) Remove this once we clean up stale translation data in fb_HX
        'transData.tokens is not iterable',
        // TODO: Remove this after we land D28687750 to support new jsfbt format.
        'TEXT types sould have no table data and TABLE require it',
      ].find(text => error.message.includes(text))
    ) {
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
  process.exit(0);
}

const translationOptions = {
  jenkins: yargs.argv[args.JENKINS],
  hashModule: yargs.argv[args.HASH],
};

if (argv[args.STDIN]) {
  const stream = process.stdin;
  let source = '';
  stream
    .setEncoding('utf8')
    .on('data', function (chunk) {
      source += chunk;
    })
    .on('end', function () {
      catchKnownErrors__DEBUG_ONLY(() => {
        writeOutput(processJSON(JSON.parse(source), translationOptions));
      });
    });
} else {
  catchKnownErrors__DEBUG_ONLY(() => {
    writeOutput(
      processFiles(argv[args.SRC], argv[args.TRANSLATIONS], translationOptions),
    );
  });
}
