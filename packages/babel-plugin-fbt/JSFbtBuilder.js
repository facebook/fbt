/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p babel_plugin_fbt --local ~/www
 *
 * @emails oncall+internationalization
 * @format
 */

'use strict';
/* eslint max-len: ["warn", 120] */

const {FbtType} = require('./FbtConstants');
const {normalizeSpaces, objMap} = require('./FbtUtil');
const Gender = require('./Gender');
const {GENDER_CONST} = Gender;
const {
  EXACTLY_ONE,
  FbtVariationType,
  SUBJECT,
} = require('./translate/IntlVariations');
const invariant = require('fbjs/lib/invariant');

const PLURAL_KEY_TO_TYPE = {
  '*': 'many',
  [EXACTLY_ONE]: 'singular',
};

class JSFbtBuilder {
  static build(type, texts, reactNativeMode) {
    const builder = new JSFbtBuilder(reactNativeMode);
    if (type === FbtType.TEXT) {
      invariant(texts.length === 1, 'Text type is a singleton array');
      return normalizeSpaces(texts[0]);
    } else {
      invariant(
        type === FbtType.TABLE,
        'We only expect two types of fbt phrases',
      );
      return {
        t: builder.buildTable(texts),
        m: builder.buildMetadata(texts),
      };
    }
  }

  constructor(reactNativeMode) {
    this.usedEnums = {};
    this.usedPlurals = {};
    this.usedPronouns = {};
    this.reactNativeMode = reactNativeMode;
  }

  buildMetadata(texts) {
    const metadata = [];
    const enums = {};
    texts.forEach(function(item) {
      if (typeof item === 'string') {
        return;
      }

      switch (item.type) {
        case 'gender':
        case 'number':
          metadata.push({
            token: item.token,
            type:
              item.type === 'number'
                ? FbtVariationType.NUMBER
                : FbtVariationType.GENDER,
          });
          break;

        case 'plural':
          if (item.showCount !== 'no') {
            metadata.push({
              token: item.name,
              type: FbtVariationType.NUMBER,
              singular: true,
            });
          } else {
            metadata.push(
              this.reactNativeMode
                ? {
                    type: FbtVariationType.NUMBER,
                  }
                : null,
            );
          }
          break;

        case 'subject':
          metadata.push({
            token: SUBJECT,
            type: FbtVariationType.GENDER,
          });
          break;

        // We ensure we have placeholders in our metadata because enums and
        // pronouns don't have metadata and will add "levels" to our resulting
        // table. In the example in the docblock of buildTable(), we'd expect
        //     array({range: ...}, array('token' => 'count', 'type' => ...))
        case 'enum':
          // Only add an enum if it adds a level. Duplicated enum values do not
          // add levels.
          if (!(item.value in enums)) {
            enums[item.value] = true;
            let metadataEntry = null;
            if (this.reactNativeMode) {
              // Enum range will later be used to extract enums from the payload
              // for React Native
              metadataEntry = {range: Object.keys(item.range)};
            }
            metadata.push(metadataEntry);
          }
          break;

        case 'pronoun':
          metadata.push(
            this.reactNativeMode
              ? {
                  type: FbtVariationType.PRONOUN,
                }
              : null,
          );
          break;

        default:
          metadata.push(null);
          break;
      }
    }, this);
    return metadata;
  }

  /**
   * Build a tree and set of all the strings - A (potentially multi-level)
   * dictionary of keys of various FBT components (enum, plural, etc) to their
   * string leaves or the next level of the tree.
   *
   * Example (probably a bad example of when to use an enum):
   *
   *   buildTable([
   *     'Click ',
   *     {
   *       'type': 'enum',
   *       'values': ['here', 'there', 'anywhere']
   *     },
   *     ' to see ',
   *     {
   *      'type': 'number',
   *      'token': 'count',
   *      'type': FbtVariationType.NUMBER,
   *     },
   *     'things'
   *   ])
   *
   * Returns:
   *
   *   {
   *     'here': {'*': 'Click here to see {count} things'}
   *     'there': {'*': 'Click there to see {count} things'}
   *     ...
   *   }
   */
  buildTable(texts) {
    return this._buildTable('', texts, 0);
  }

  _buildTable(prefix, texts, idx) {
    if (idx === texts.length) {
      return normalizeSpaces(prefix);
    }

    const item = texts[idx];
    if (typeof item === 'string') {
      return this._buildTable(prefix + item, texts, idx + 1);
    }

    const textSegments = {};
    switch (item.type) {
      case 'subject':
        textSegments['*'] = '';
        break;
      case 'gender':
      case 'number':
        textSegments['*'] = '{' + item.token + '}';
        break;

      case 'plural':
        const pluralVal = item.value;
        if (pluralVal in this.usedPlurals) {
          // Constrain our plural value ('many'/'singular') BUT still add a
          // single level.  We don't currently prune runtime args like we do
          // with enums, but we ought to...
          // TODO T41100260
          const key = this.usedPlurals[pluralVal];
          const val = item[PLURAL_KEY_TO_TYPE[key]];
          return {[key]: this._buildTable(prefix + val, texts, idx + 1)};
        }
        const table = objMap(PLURAL_KEY_TO_TYPE, (type, key) => {
          this.usedPlurals[pluralVal] = key;
          return this._buildTable(prefix + item[type], texts, idx + 1);
        });
        delete this.usedPlurals[pluralVal];
        return table;

      case 'pronoun':
        const genderSrc = item.gender;
        const isUsed = this.usedPronouns.hasOwnProperty(genderSrc);
        const genders = isUsed ? this.usedPronouns[genderSrc] : GENDER_CONST;
        const resTable = {};
        Object.keys(genders).forEach(key => {
          const gender = GENDER_CONST[key];
          if (gender === GENDER_CONST.NOT_A_PERSON && !item.human) {
            return;
          }
          if (!isUsed) {
            this.usedPronouns[genderSrc] = {[key]: gender};
          }
          const genderKey = this.getPronounGenderKey(item.usage, gender);
          const pivotKey =
            genderKey === GENDER_CONST.UNKNOWN_PLURAL ? '*' : genderKey;
          const word = Gender.getData(genderKey, item.usage);
          const capWord = item.capitalize
            ? word.charAt(0).toUpperCase() + word.substr(1)
            : word;
          resTable[pivotKey] = this._buildTable(
            prefix + capWord,
            texts,
            idx + 1,
          );
        });
        if (!isUsed) {
          delete this.usedPronouns[genderSrc];
        }
        return resTable;

      case 'enum':
        //  If this is a duplicate enum, use the stored value.  Otherwise,
        //  create a level in our table.
        const enumArg = item.value;
        if (enumArg in this.usedEnums) {
          const enumKey = this.usedEnums[enumArg];
          if (!(enumKey in item.range)) {
            throw new Error(
              enumKey +
                ' not found in ' +
                JSON.stringify(item.range) +
                '. Attempting to re-use incompatible enums',
            );
          }
          const val = item.range[enumKey];
          return this._buildTable(prefix + val, texts, idx + 1);
        }
        const result = objMap(item.range, (val, key) => {
          this.usedEnums[enumArg] = key;
          return this._buildTable(prefix + val, texts, idx + 1);
        });
        delete this.usedEnums[enumArg];
        return result;
      default:
        break;
    }

    return objMap(textSegments, v =>
      this._buildTable(prefix + v, texts, idx + 1),
    );
  }

  // Copied from fbt.js
  getPronounGenderKey(usage, gender) {
    switch (gender) {
      case GENDER_CONST.NOT_A_PERSON:
        return usage === 'object' || usage === 'reflexive'
          ? GENDER_CONST.NOT_A_PERSON
          : GENDER_CONST.UNKNOWN_PLURAL;

      case GENDER_CONST.FEMALE_SINGULAR:
      case GENDER_CONST.FEMALE_SINGULAR_GUESS:
        return GENDER_CONST.FEMALE_SINGULAR;

      case GENDER_CONST.MALE_SINGULAR:
      case GENDER_CONST.MALE_SINGULAR_GUESS:
        return GENDER_CONST.MALE_SINGULAR;

      case GENDER_CONST.MIXED_SINGULAR: // And MIXED_PLURAL; they have the same integer values.
      case GENDER_CONST.FEMALE_PLURAL:
      case GENDER_CONST.MALE_PLURAL:
      case GENDER_CONST.NEUTER_PLURAL:
      case GENDER_CONST.UNKNOWN_PLURAL:
        return GENDER_CONST.UNKNOWN_PLURAL;

      case GENDER_CONST.NEUTER_SINGULAR:
      case GENDER_CONST.UNKNOWN_SINGULAR:
        return usage === 'reflexive'
          ? GENDER_CONST.NOT_A_PERSON
          : GENDER_CONST.UNKNOWN_PLURAL;
    }

    invariant(false, 'Unknown GENDER_CONST value.');
    return null;
  }
}

module.exports = JSFbtBuilder;
