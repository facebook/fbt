/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 * @noflow
 */

const {hasKeys} = require('../FbtUtil');
const IntlVariations = require('./IntlVariations');
const TranslationData = require('./TranslationData');
const invariant = require('invariant');
const {EXACTLY_ONE, isValidValue, Mask} = IntlVariations;
const {FbtSiteMetaEntry} = require('./FbtSite');

/**
 * Given an FbtSite (source payload) and the relevant translations,
 * builds the corresponding translated payload
 */
class TranslationBuilder {
  constructor(
    translations, // hash/id => translation (TranslationData | string)
    config, // Configuration for variation defaults (number/gender)
    fbtSite, // fbtSite to translate
    inclHash, // include hash/identifer in leaf of payloads
  ) {
    this._translations = translations;
    this._config = config;
    this._fbtSite = fbtSite;
    this._tokenMasks = {}; // token => mask
    this._metadata = fbtSite.getMetadata(); // [{token: ..., mask: ...}, ...]
    this._tableOrHash = fbtSite.getTableOrHash();
    this._hasVCGenderVariation = this._findVCGenderVariation();
    this._hasTranslations = this._translationsExist();
    this._getConstraintMap = _getConstraintMap();
    this._inclHash = inclHash;

    // If a gender variation exists, add it to our table
    if (this._hasVCGenderVariation) {
      this._tableOrHash = {'*': this._tableOrHash};
      this._metadata.unshift(
        FbtSiteMetaEntry.wrap({
          token: IntlVariations.VIEWING_USER,
          mask: Mask.GENDER,
        }),
      );
    }

    for (let ii = 0; ii < this._metadata.length; ++ii) {
      const metadata = this._metadata[ii];
      if (metadata !== null && metadata.hasVariationMask()) {
        this._tokenMasks[metadata.getToken()] = metadata.getVariationMask();
      }
    }
  }

  hasTranslations() {
    return this._hasTranslations;
  }

  build() {
    const table = this._buildRecursive(this._tableOrHash);
    if (this._hasVCGenderVariation) {
      // This hidden key is checked during JS fbt runtime to signal that we
      // should access the first entry of our table with the viewer's gender
      table.__vcg = 1;
    }
    return table;
  }

  _translationsExist() {
    for (const hash in this._fbtSite.getHashToText()) {
      const transData = this._translations[hash];
      if (
        !(transData instanceof TranslationData) ||
        transData.hasTranslation()
      ) {
        // There is a translation or simple string for generated translation
        return true;
      }
    }
    return false;
  }

  /**
   * Inspect all translation variations for a hidden viewer context token
   */
  _findVCGenderVariation() {
    for (const hash in this._fbtSite.getHashToText()) {
      const transData = this._translations[hash];
      if (!(transData instanceof TranslationData)) {
        continue;
      }

      const tokens = transData.tokens;
      for (const tk in tokens) {
        if (tokens[tk] === IntlVariations.VIEWING_USER) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Given a hash (or hash-table), return the translated text (or table of
   * texts).  If the hash (or hashes) do not have a translation, then the
   * original text will be used as the translation.
   *
   * If we should include the string hash then the method returns a vector with
   * [string, hash] so that the hash is available to the run-time logging code.
   */
  _buildRecursive(
    hashOrTable,
    tokenConstraints = {}, // token_name => variation constraint
    levelIdx = 0,
  ) {
    if (typeof hashOrTable === 'string') {
      return this._getLeafTranslation(hashOrTable, tokenConstraints);
    }

    const table = {};
    for (const key in hashOrTable) {
      const branchOrLeaf = hashOrTable[key];
      let trans = this._buildRecursive(
        branchOrLeaf,
        tokenConstraints,
        levelIdx + 1,
      );
      if (shouldStore(trans)) {
        table[key] = trans;
      }

      // This level will have metadata if it could potentially have variations.
      // Below, we fill the table with those variation entries.
      //
      // NOTE: A key of '_1' (EXACTLY_ONE) will be processed by the
      // buildRecursive call above, as its corresponding token constraint is
      // defaulted to '*'.  See _getConstraintMap for more details
      const metadata = this._metadata[levelIdx];
      if (
        metadata !== null &&
        metadata.hasVariationMask() &&
        key !== EXACTLY_ONE
      ) {
        const mask = metadata.getVariationMask();
        invariant(
          mask === Mask.NUMBER || mask === Mask.GENDER,
          'Unknown variation mask',
        );
        invariant(
          isValidValue(key),
          'We expect variation value keys for variations',
        );
        const token = metadata.getToken();
        const variationCandidates = _getTypesFromMask(mask);
        variationCandidates.forEach(variationKey => {
          tokenConstraints[token] = variationKey;
          trans = this._buildRecursive(
            branchOrLeaf,
            tokenConstraints,
            levelIdx + 1,
          );
          if (shouldStore(trans)) {
            table[variationKey] = trans;
          }
        });
        delete tokenConstraints[token];
      }
    }
    return table;
  }

  _getLeafTranslation(
    hash, // string
    tokenConstraints, // {string: string}: token => constraint
  ) {
    let translation;
    const transData = this._translations[hash];
    if (typeof transData === 'string') {
      // Fake translations are just simple strings.  There's no such thing as
      // variation support for these locales.  So if token constraints were
      // specified, return null and rely on runtime fallback to wildcard.
      translation = tokenConstraints ? null : transData;
    } else {
      // Real translations are TranslationData objects, so we call the
      // getDefaultTranslation() method to get the translation (we hope), or use
      // original text if no translation exist.
      const source = this._fbtSite.getHashToText()[hash];
      const defTranslation =
        transData && transData.getDefaultTranslation(this._config);
      translation = hasKeys(tokenConstraints)
        ? this.getConstrainedTranslation(hash, tokenConstraints)
        : // If no translation available, use the English source text
          defTranslation || source;
    }

    // Couple the string with a hash if it was marked as such.  We do this
    // when logging impressions or when using QuickTranslations.  The logging
    // is performed by `fbt._(...)`
    return this._inclHash ? [translation, hash] : translation;
  }

  /**
   * Given a hash and restraints on the token variations, retrieve the
   * appropriate translation for our map.  A null entry is a signal
   * not to add the translation to the map, because it's already in
   * the map via its fallback ('*') keys.
   */
  getConstrainedTranslation(
    hash, // string
    tokenConstraints, // dict<string, string> : token => constraint
  ) {
    const constraintKeys = [];
    for (const token in this._tokenMasks) {
      const val = tokenConstraints[token] || '*';
      constraintKeys.push([token, val]);
    }
    const constraintMap = this._getConstraintMap(hash);
    const aggregateKey = buildConstraintKey(constraintKeys);
    const translation = constraintMap[aggregateKey];
    if (!translation) {
      return null;
    }
    for (let ii = 0; ii < constraintKeys.length; ++ii) {
      const [token, constraint] = constraintKeys[ii];
      if (constraint === '*') {
        continue;
      }

      // If any of the constraints share the same translation as the wildcard
      // (default) entry at this level, don't add an entry to the table.  They
      // will be in the table under the '*' key.
      constraintKeys[ii] = [token, '*'];
      const wildKey = buildConstraintKey(constraintKeys);
      const wildTranslation = constraintMap[wildKey];
      if (wildTranslation === translation) {
        return null;
      }
      // Set the constraint back
      constraintKeys[ii] = [token, constraint];
    }
    return translation;
  }

  _insertConstraint(
    keys, // [[token, constraint]]
    constraintMap, // {key: translation}
    translation, // string
    defaultingLevel, // int
  ) {
    const aggregateKey = buildConstraintKey(keys);
    if (constraintMap[aggregateKey]) {
      throw new Error(
        'Unexpected duplicate key: ' +
          aggregateKey +
          '\nOriginal: ' +
          constraintMap[aggregateKey] +
          '\nNew ' +
          translation,
      );
    }
    constraintMap[aggregateKey] = translation;

    // Also include duplicate '*' entries if it is a default value
    for (let ii = defaultingLevel; ii < keys.length; ii++) {
      const [tok, val] = keys[ii];
      if (val !== '*' && this._config.isDefaultVariation(val)) {
        keys[ii] = [tok, '*'];
        this._insertConstraint(keys, constraintMap, translation, ii + 1);
        keys[ii] = [tok, val]; // return the value back
      }
    }
  }
}

/**
 * Populates our variation constraint map.  The map is of all possible
 * variation combinations (serialized as a string) to the appropriate
 * translation.  For example, JavaScript like:
 *
 *   fbt('Hi ' + fbt.param('user', viewer.name, {gender: viewer.gender}) +
 *       ', would you like to play ' +
 *        fbt.param('count', gameCount, {number: true}) +
 *        ' games of ' + fbt.enum(game,['chess','backgammon','poker']) +
 *        '?  Click ' + fbt.param('link', <Link  />), 'sample'),
 *
 * will have variations for the 'user' and 'count' parameters.  Accounting for
 * all variations in a locale where we don't merge unknown gender into male
 * and we have the dual number variation, the map will have the following keys
 * mapping to the corresponding translation.
 *
 *  user%*:count%*  [default (unknown) - default (other) ]
 *  user%*:count%4  [default           - one             ]
 *  user%*:count%20 [default           - few             ]
 *  user%*:count%24 [default           - other           ]
 *  user%1:count%*  [male              - default (other) ]
 *  user%1:count%4  [male              - one             ]
 *  user%1:count%20 [male              - few             ]
 *  user%1:count%24 [male              - other           ]
 *  user%2:count%*  [female            - default (other) ]
 *  user%2:count%4  [female            - singular        ]
 *  user%2:count%20 [female            - few             ]
 *  user%2:count%24 [female            - other           ]
 *  user%3:count%*  [unknown gender    - default (other) ]
 *  user%3:count%4  [unknown gender    - singular        ]
 *  user%3:count%20 [unknown gender    - few             ]
 *  user%3:count%24 [unknown gender    - other           ]
 *
 *  Note we have duplicate translations in this map.  As an example, the
 *  following keys map to the same translation
 *    'user%*:count%*'  (default - default)
 *    'user%3:count%*'  (unknown - default)
 *    'user%3:count%24' (unknown - other)
 *
 *  These translations are deduped later in getConstrainedTranslation such
 *  that only the 'user%*:count%*' in our tree is in the JSON map.  i.e.
 *
 *  {
 *    // No unknown gender entry exists at this level - we rely on fallback
 *    '*' => {
 *      // no plural entry exists at this level
 *      '*' => {translation},
 *      ...
 *
 *    },
 *    ...
 *  }
 */
function _getConstraintMap() {
  // Yes this is hand-rolled memoization :(
  // TODO: T37795723 - Pull in a lightweight (not bloated) memoization library
  const _mem = {};

  return function getConstraintMap(
    hash, // string
  ) {
    if (_mem[hash]) {
      return _mem[hash];
    }

    const constraintMap = {};
    const transData = this._translations[hash];
    if (!transData) {
      // No translation? No constraints.
      return (_mem[hash] = constraintMap);
    }

    // For every possible variation combination, create a mapping to its
    // corresponding translation
    transData.translations.forEach(translation => {
      const constraints = {};
      for (const idx in translation.variations) {
        const variation = translation.variations[idx];
        // We prune entries that contain non-default variations
        // for tokens we haven't specified.
        const token = transData.tokens[idx];
        if (
          // Token variation type not specified
          !this._tokenMasks[token] ||
          // Translated variation type is different than token variation type
          this._tokenMasks[token] !== transData.types[idx]
        ) {
          // Only add default tokens we haven't specified.
          if (!this._config.isDefaultVariation(variation)) {
            return;
          }
        }
        constraints[token] = variation;
      }
      // A note about fbt:plurals.  They can introduce global token
      // discrepancies between leaf nodes.  Singular translations don't have
      // number tokens, but their plural counterparts can (when showCount =
      // "ifMany" or "yes").  If we are dealing with the singular leaf of an
      // fbt:plural, since it has a unique hash, we can let it masquerade as
      // default: '*', since no such variation actually exists for a
      // non-existent token
      const constraintKeys = [];
      for (const k in this._tokenMasks) {
        constraintKeys.push([k, constraints[k] || '*']);
      }
      this._insertConstraint(
        constraintKeys,
        constraintMap,
        translation.translation,
        0,
      );
    });
    return (_mem[hash] = constraintMap);
  };
}

function shouldStore(branch) {
  return branch !== null && (typeof branch === 'string' || hasKeys(branch));
}

/**
 * Build the aggregate key with which we access the constraint map.  The
 * constraint map maps the given constraints to the appropriate translation
 */
function buildConstraintKey(
  keys, // [[token, constraint]]
) {
  return keys.map(kv => kv[0] + '%' + kv[1]).join(':');
}

const G = IntlVariations.Gender;
const _numbers = [];
for (const k in IntlVariations.Number) {
  _numbers.push(IntlVariations.Number[k]);
}

const _getTypesFromMask = function (mask) {
  const type = IntlVariations.getType(mask);
  if (type === Mask.NUMBER) {
    return _numbers;
  } else {
    return [G.MALE, G.FEMALE, G.UNKNOWN];
  }
};

module.exports = TranslationBuilder;
