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
 * @flow strict
 * @emails oncall+internationalization
 */

/**
 *  Core javascript localization functions.
 *
 *  Note: This file is required on every page. Please make sure that only core
 *  functionality is included here.
 *
 *  Note: Please keep this in sync with www/html/js/mobile/lib/intl-core.js.
 */

const FbtHooks = require('FbtHooks');
const IntlPhonologicalRewrites = require('IntlPhonologicalRewrites');

/**
 * Regular expression snippet containing all the characters that we
 * count as sentence-final punctuation.
 */
const PUNCT_CHAR_CLASS = ('[.!?' +
'\u3002' + // Chinese/Japanese period
'\uFF01' + // Fullwidth exclamation point
'\uFF1F' + // Fullwidth question mark
'\u0964' + // Hindi "full stop"
'\u2026' + // Chinese ellipsis
'\u0EAF' + // Laotian ellipsis
'\u1801' + // Mongolian ellipsis
'\u0E2F' + // Thai ellipsis
'\uFF0E' + // Fullwidth full stop
  ']': string);

const ENDS_IN_PUNCT_REGEXP = new RegExp(
  PUNCT_CHAR_CLASS +
  '[)"\'' +
  // JavaScript doesn't support Unicode character
  // properties in regexes, so we have to list
  // all of these individually. This is an
  // abbreviated list of the "final punctuation"
  // and "close punctuation" Unicode codepoints,
  // excluding symbols we're unlikely to ever
  // see (mathematical notation, etc.)
  '\u00BB' + // Double angle quote
  '\u0F3B' + // Tibetan close quote
  '\u0F3D' + // Tibetan right paren
  '\u2019' + // Right single quote
  '\u201D' + // Right double quote
  '\u203A' + // Single right angle quote
  '\u3009' + // Right angle bracket
  '\u300B' + // Right double angle bracket
  '\u300D' + // Right corner bracket
  '\u300F' + // Right hollow corner bracket
  '\u3011' + // Right lenticular bracket
  '\u3015' + // Right tortoise shell bracket
  '\u3017' + // Right hollow lenticular bracket
  '\u3019' + // Right hollow tortoise shell
  '\u301B' + // Right hollow square bracket
  '\u301E' + // Double prime quote
  '\u301F' + // Low double prime quote
  '\uFD3F' + // Ornate right parenthesis
  '\uFF07' + // Fullwidth apostrophe
  '\uFF09' + // Fullwidth right parenthesis
  '\uFF3D' + // Fullwidth right square bracket
    '\\s' +
    ']*$',
);

type Rules = $ReadOnlyArray<[RegExp, (string => string) | string]>;

const rulesPerLocale: {[locale: string]: ?Rules, ...} = {};

function _getMemoizedRules(localeArg: ?string): Rules {
  const locale = localeArg ?? '';
  let rules = rulesPerLocale[locale];
  if (rules == null) {
    rules = rulesPerLocale[locale] = _getRules(localeArg);
  }
  return rules;
}

function _getRules(locale: ?string): Rules {
  const rules = [];
  const rewrites = IntlPhonologicalRewrites.get(locale);

  // Process the patterns and replacements by applying metaclasses.
  for (let pattern in rewrites.patterns) {
    let replacement = rewrites.patterns[pattern];
    // "Metaclasses" are shorthand for larger character classes. For example,
    // _C may refer to consonants and _V to vowels for a locale.
    for (const metaclass in rewrites.meta) {
      const metaclassRegexp = new RegExp(metaclass.slice(1, -1), 'g');
      const characterClass = rewrites.meta[metaclass];
      pattern = pattern.replace(metaclassRegexp, characterClass);
      replacement = replacement.replace(metaclassRegexp, characterClass);
    }
    if (replacement === 'javascript') {
      replacement = match => match.slice(1).toLowerCase();
    }
    rules.push([new RegExp(pattern.slice(1, -1), 'g'), replacement]);
  }
  return rules;
}

/**
 * Applies phonological rules (appropriate to the locale)
 * at the morpheme boundary when tokens are replaced with values.
 * For languages like Turkish, we allow translators to use shorthand
 * for a pattern of inflection (a suffix like '(y)i becomes 'i or 'yi or 'a or
 * 'ye, etc. depending on context).
 *
 * Input: Translated string with each {token} substituted with
 *        "\x01value\x01" (e.g., "\x01Ozgur\x01(y)i..." which was
 *        "{name}(y)i...")
 * Returns: String with phonological rules applied (e.g., "Ozguri...")
 */
function applyPhonologicalRules(text: string): string {
  const rules = _getMemoizedRules(FbtHooks.getViewerContext().locale);
  let result = text;

  for (let i = 0; i < rules.length; i++) {
    const [regexp, replacement] = rules[i];
    result = result.replace(regexp, replacement);
  }

  // If we have no rules (or if we already applied them), remove the delimiters.
  return result.replace(/\x01/g, '');
}

/**
 * Checks whether a string ends in sentence-final punctuation. This logic is
 * about the same as the PHP ends_in_punct() function; it takes into account
 * the fact that we consider a string like "foo." to end with a period even
 * though there's a quote mark afterward.
 */
function endsInPunct(str: string): boolean {
  if (typeof str !== 'string') {
    return false;
  }
  return ENDS_IN_PUNCT_REGEXP.test(str);
}

module.exports = {
  PUNCT_CHAR_CLASS,
  endsInPunct,
  applyPhonologicalRules,
};
