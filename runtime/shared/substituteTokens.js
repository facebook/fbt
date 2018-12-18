/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p fbt --remote localhost:~/www
 *
 * @format
 * @flow
 * @emails oncall+internationalization
 */

const IntlPunctuation = require('IntlPunctuation');

const invariant = require('invariant');

// This pattern finds tokens inside a string: 'string with {token} inside'.
// It also grabs any punctuation that may be present after the token, such as
// brackets, fullstops and elipsis (for various locales too!)
const parameterRegexp = new RegExp(
  '\\{([^}]+)\\}(' + IntlPunctuation.PUNCT_CHAR_CLASS + '*)',
  'g',
);

// Hack into React internals to avoid key warnings
function markAsSafeForReact<T: Object>(object: T): T {
  if (__DEV__) {
    // If this looks like a ReactElement, mark it as safe to silence any
    // key warnings.

    // I use a string key to avoid any possible private variable transforms.
    const storeKey = '_store';

    if (
      object.type &&
      typeof object.props === 'object' &&
      typeof object[storeKey] === 'object' &&
      typeof object[storeKey].validated === 'boolean'
    ) {
      object[storeKey].validated = true;
    }
  }
  return object;
}

/**
 * Does the token substitution fbt() but without the string lookup.
 * Used for in-place substitutions in translation mode.
 */
function substituteTokens(
  template: string,
  _args?: Object,
): string | Array<any> {
  const args = _args;

  if (!args) {
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
    .replace(parameterRegexp, (match, parameter, punctuation) => {
      if (__DEV__) {
        if (!args.hasOwnProperty(parameter)) {
          throw new Error('Translatable string expects parameter ' + parameter);
        }
      }

      var argument = args[parameter];
      if (argument && typeof argument === 'object') {
        objectPieces.push(argument);
        argNames.push(parameter);
        // End of Transmission Block sentinel marker
        return '\x17' + punctuation;
      } else if (argument === null) {
        return '';
      }
      return (
        argument + (IntlPunctuation.endsInPunct(argument) ? '' : punctuation)
      );
    })
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
