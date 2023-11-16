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

/**
 *  Core javascript localization functions.
 *
 *  Note: This file is required on every page. Please make sure that only core
 *  functionality is included here.
 *
 *  Note: Please keep this in sync with www/html/js/mobile/lib/intl-core.js.
 */

import FbtHooks from 'FbtHooks';
import IntlPhonologicalRewrites from 'IntlPhonologicalRewrites';
import IntlRedundantStops from 'IntlRedundantStops';

/**
 * Regular expression snippet containing all the characters that we
 * count as sentence-final punctuation.
 */
export const PUNCT_CHAR_CLASS: string =
  '[.!?' +
  '\u3002' + // Chinese/Japanese period
  '\uFF01' + // Fullwidth exclamation point
  '\uFF1F' + // Fullwidth question mark
  '\u0964' + // Hindi "full stop"
  '\u2026' + // Chinese ellipsis
  '\u0EAF' + // Laotian ellipsis
  '\u1801' + // Mongolian ellipsis
  '\u0E2F' + // Thai ellipsis
  '\uFF0E' + // Fullwidth full stop
  ']';

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
    let replacement: string | ((match: string) => string) =
      rewrites.patterns[pattern];
    // "Metaclasses" are shorthand for larger character classes. For example,
    // _C may refer to consonants and _V to vowels for a locale.
    for (const metaclass in rewrites.meta) {
      const metaclassRegexp = new RegExp(metaclass.slice(1, -1), 'g');
      const characterClass = rewrites.meta[metaclass];
      pattern = pattern.replace(metaclassRegexp, characterClass);
      // $FlowFixMe[prop-missing]
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
export function applyPhonologicalRules(text: string): string {
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
 * Map all equivalencies to the normalized key for the stop category.  These
 * are the entries in the redundancy mapping
 */
const _normalizedStops = new Map<$FlowFixMe | string, string>();
for (const norm in IntlRedundantStops.equivalencies) {
  for (const eq of [norm].concat(IntlRedundantStops.equivalencies[norm])) {
    _normalizedStops.set(eq, norm);
  }
}

const _redundancies = new Map<?string, Set<?string>>();
for (const prefix in IntlRedundantStops.redundancies) {
  _redundancies.set(prefix, new Set(IntlRedundantStops.redundancies[prefix]));
}

function isRedundant(rawPrefix: string, rawSuffix: string): boolean {
  const prefix = _normalizedStops.get(rawPrefix);
  const suffix = _normalizedStops.get(rawSuffix);
  return _redundancies.get(prefix)?.has(suffix) === true;
}

/**
 * If suffix is redundant with prefix (as determined by the redundancy map),
 * return the empty string, otherwise return suffix.
 */
export function dedupeStops(prefix: string, suffix: string): string {
  // We can naively grab the last "character" (a general Unicode "no-no") from
  // our string because we know our set of stops we test against have no
  // diacritics nor lie outside the BMP
  return isRedundant(prefix[prefix.length - 1], suffix) ? '' : suffix;
}
