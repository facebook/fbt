/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p fbt --local ~/www
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

// flowlint ambiguous-object-type:error

import {
  PUNCT_CHAR_CLASS,
  applyPhonologicalRules,
  dedupeStops,
} from 'IntlPunctuation';

import invariant from 'invariant';

/*
 * $FlowFixMe[method-unbinding] Use original method in case the token names contain
 * a 'hasOwnProperty' key too; or if userland code redefined that method.
 */
const {hasOwnProperty} = Object.prototype;

// This pattern finds tokens inside a string: 'string with {token} inside'.
// It also grabs any punctuation that may be present after the token, such as
// brackets, fullstops and elipsis (for various locales too!)
const parameterRegexp = new RegExp(
  '\\{([^}]+)\\}(' + PUNCT_CHAR_CLASS + '*)',
  'g',
);

type MaybeReactComponent = Partial<{
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
  args: {[paramName: string]: Arg, ...},
): string | Array<string | Arg> {
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
      (_match: string, parameter: string, punctuation: string): string => {
        if (__DEV__) {
          invariant(
            hasOwnProperty.call(args, parameter),
            'Expected fbt parameter names (%s) to also contain `%s`',
            Object.keys(args)
              .map(paramName => `\`${paramName}\``)
              .join(', '),
            parameter,
          );
        }
        // TODO(T106260833) Log error when we cannot resolve all fbt parameters using FbtHooks

        const argument = args[parameter];
        if (argument != null && typeof argument === 'object') {
          objectPieces.push(argument);
          argNames.push(parameter);
          // End of Transmission Block sentinel marker
          return '\x17' + punctuation;
        } else if (argument === null) {
          return '';
        }
        return String(argument) + dedupeStops(String(argument), punctuation);
      },
    )
    .split('\x17')
    .map(applyPhonologicalRules);

  if (stringPieces.length === 1) {
    return stringPieces[0];
  }

  // Zip together the lists of pieces.
  // We skip adding empty strings from stringPieces since they were
  // injected from translation patterns that only contain tokens. See D20453562
  const pieces: Array<string | Arg> =
    stringPieces[0] !== '' ? [stringPieces[0]] : [];
  for (let i = 0; i < objectPieces.length; i++) {
    /* $FlowFixMe[incompatible-variance] Error revealed after stricter
     * React.Element typing */
    /* $FlowFixMe[incompatible-call] Error revealed after stricter
     * React.Element typing */
    pieces.push(markAsSafeForReact(objectPieces[i]));
    if (stringPieces[i + 1] !== '') {
      pieces.push(stringPieces[i + 1]);
    }
  }
  return pieces;
}

module.exports = substituteTokens;
