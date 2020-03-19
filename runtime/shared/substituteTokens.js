/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p fbt --local ~/www
 *
 * @format
 * @flow strict-local
 * @emails oncall+internationalization
 */

// flowlint ambiguous-object-type:error

const IntlPunctuation = require('IntlPunctuation');

const invariant = require('invariant');

// This pattern finds tokens inside a string: 'string with {token} inside'.
// It also grabs any punctuation that may be present after the token, such as
// brackets, fullstops and elipsis (for various locales too!)
const parameterRegexp = new RegExp(
  '\\{([^}]+)\\}(' + IntlPunctuation.PUNCT_CHAR_CLASS + '*)',
  'g',
);

type MaybeReactComponent = $Shape<{
  type?: string,
  props?: {...},
  _store?: {
    validated: boolean,
    ...
  },
  ...
}>;

// Hack into React internals to avoid key warnings
function markAsSafeForReact<T: MaybeReactComponent>(object: T): T {
  if (__DEV__) {
    // If this looks like a ReactElement, mark it as safe to silence any
    // key warnings.

    // I use a string key to avoid any possible private variable transforms.
    const storeKey = '_store';

    const store = object[storeKey];
    if (
      object.type != null &&
      object.type != '' &&
      typeof object.props === 'object' &&
      store != null &&
      typeof store === 'object' &&
      typeof store.validated === 'boolean'
    ) {
      store.validated = true;
    }
  }
  return object;
}

/**
 * Does the token substitution fbt() but without the string lookup.
 * Used for in-place substitutions in translation mode.
 */
function substituteTokens<Arg: mixed>(
  template: string,
  _args: {[paramName: string]: Arg, ...},
): string | Array<string | Arg> {
  const args = _args;

  if (args == null) {
    return template;
  }

  invariant(
    typeof args === 'object',
    'The 2nd argument must be an object (not a string) for tx(%s, ...)',
    template,
  );

  // Splice in the arguments while keeping rich object ones separate.
  const objectPieces = [];
  const argNames = [];
  const stringPieces = template
    .replace(
      parameterRegexp,
      (match: string, parameter: string, punctuation: string): string => {
        if (__DEV__) {
          if (!args.hasOwnProperty(parameter)) {
            throw new Error(
              'Translatable string expects parameter ' + parameter,
            );
          }
        }

        const argument = args[parameter];
        if (argument != null && typeof argument === 'object') {
          objectPieces.push(argument);
          argNames.push(parameter);
          // End of Transmission Block sentinel marker
          return '\x17' + punctuation;
        } else if (argument === null) {
          return '';
        }
        return (
          String(argument) +
          (IntlPunctuation.endsInPunct(String(argument)) ? '' : punctuation)
        );
      },
    )
    .split('\x17')
    .map(IntlPunctuation.applyPhonologicalRules);

  if (stringPieces.length === 1) {
    return stringPieces[0];
  }

  // Zip together the lists of pieces.
  const pieces = [stringPieces[0]];
  for (let i = 0; i < objectPieces.length; i++) {
    pieces.push(markAsSafeForReact(objectPieces[i]), stringPieces[i + 1]);
  }
  return pieces;
}

module.exports = substituteTokens;
