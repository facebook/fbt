/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow strict-local
 * @format
 */

/* eslint max-len: ["warn", 120] */

'use strict';

import type {AnyStringVariationArg} from './fbt-nodes/FbtArguments';
import type {EnumKey} from './FbtEnumRegistrar';
import type {GenderConstEnum} from './Gender';

const {
  EnumStringVariationArg,
  GenderStringVariationArg,
  NumberStringVariationArg,
} = require('./fbt-nodes/FbtArguments');
const FbtEnumNode = require('./fbt-nodes/FbtEnumNode');
const FbtPluralNode = require('./fbt-nodes/FbtPluralNode');
const FbtPronounNode = require('./fbt-nodes/FbtPronounNode');
const {varDump} = require('./FbtUtil');
const {
  EXACTLY_ONE,
  FbtVariationType,
  GENDER_ANY,
  NUMBER_ANY,
  SUBJECT,
} = require('./translate/IntlVariations');
const invariant = require('invariant');

class JSFbtBuilder {
  +fileSource: string;
  +usedEnums: {[enumArgCode: string]: EnumKey};
  +usedPlurals: {
    [pluralsArgCode: string]: typeof EXACTLY_ONE | typeof NUMBER_ANY,
  };
  +usedPronouns: {
    [pronounsArgCode: string]: GenderConstEnum | typeof GENDER_ANY,
  };
  +reactNativeMode: boolean;
  +stringVariationArgs: $ReadOnlyArray<AnyStringVariationArg>;

  constructor(
    fileSource: string,
    stringVariationArgs: $ReadOnlyArray<AnyStringVariationArg>,
    reactNativeMode?: boolean,
  ): void {
    this.fileSource = fileSource;
    this.reactNativeMode = !!reactNativeMode;
    this.stringVariationArgs = stringVariationArgs;
    this.usedEnums = {};
    this.usedPlurals = {};
    this.usedPronouns = {};
  }

  buildMetadata(texts: $FlowFixMe): $FlowFixMe {
    const metadata = [];
    const enums = {};
    texts.forEach(function (item) {
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
              this.reactNativeMode ? {type: FbtVariationType.NUMBER} : null,
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
            this.reactNativeMode ? {type: FbtVariationType.PRONOUN} : null,
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
   * Get all the string variation combinations derived from a list of string variation arguments.
   *
   * E.g. If we have a list of string variation arguments as:
   *
   * [genderSV, numberSV]
   *
   * Assuming genderSV produces candidate variation values as: male, female, unknown
   * Assuming numberSV produces candidate variation values as: singular, plural
   *
   * The output would be:
   *
   * [
   *   [  genderSV(male),     numberSV(singular)  ],
   *   [  genderSV(male),     numberSV(plural)    ],
   *   [  genderSV(female),   numberSV(singular)  ],
   *   [  genderSV(female),   numberSV(plural)    ],
   *   [  genderSV(unknown),  numberSV(singular)  ],
   *   [  genderSV(unknown),  numberSV(plural)    ],
   * ]
   *
   * Follows legacy behavior:
   *   - process each SV argument (FIFO),
   *   - for each SV argument of the same fbt construct (e.g. plural)
   *     (and not of the same variation type like Gender)
   *     - check if there's already an existing SV argument of the same JS code being used
   *       - if so, re-use the same variation value
   *       - else, "multiplex" new variation value
   *       Do this for plural, gender, enum
   */
  getStringVariationCombinations(): $ReadOnlyArray<
    $ReadOnlyArray<AnyStringVariationArg>,
  > {
    return this._getStringVariationCombinations();
  }

  _getStringVariationCombinations(
    combos: Array<$ReadOnlyArray<AnyStringVariationArg>> = [],
    curArgIndex: number = 0,
    prevArgs: $ReadOnlyArray<AnyStringVariationArg> = [],
  ): Array<$ReadOnlyArray<AnyStringVariationArg>> {
    invariant(
      curArgIndex >= 0,
      'curArgIndex value must greater or equal to 0, but we got `%s` instead',
      curArgIndex,
    );

    if (this.stringVariationArgs.length === 0) {
      return combos;
    }

    if (curArgIndex >= this.stringVariationArgs.length) {
      combos.push(prevArgs);
      return combos;
    }

    const curArg = this.stringVariationArgs[curArgIndex];
    const {fbtNode} = curArg;
    const {usedEnums, usedPlurals, usedPronouns} = this;

    const recurse = <V>(
      candidateValues: $ReadOnlyArray<V>,
      beforeRecurse?: V => mixed,
    ): void =>
      candidateValues.forEach(value => {
        if (beforeRecurse) {
          beforeRecurse(value);
        }
        this._getStringVariationCombinations(
          combos,
          curArgIndex + 1,
          // $FlowFixMe[incompatible-call] `value` type should be compatible with cloneWithValue()
          prevArgs.concat(curArg.cloneWithValue(value)),
        );
      });

    if (fbtNode instanceof FbtEnumNode) {
      invariant(
        curArg instanceof EnumStringVariationArg,
        'Expected EnumStringVariationArg but got: %s',
        varDump(curArg),
      );
      const argCode = curArg.getArgCode(this.fileSource);

      if (argCode in usedEnums) {
        const enumKey = usedEnums[argCode];
        invariant(
          enumKey in fbtNode.options.range,
          '%s not found in %s. Attempting to re-use incompatible enums',
          enumKey,
          varDump(fbtNode.options.range),
        );

        recurse([enumKey]);
        return combos;
      }

      recurse(curArg.candidateValues, value => (usedEnums[argCode] = value));
      delete usedEnums[argCode];
    } else if (fbtNode instanceof FbtPluralNode) {
      invariant(
        curArg instanceof NumberStringVariationArg,
        'Expected NumberStringVariationArg but got: %s',
        varDump(curArg),
      );
      const argCode = curArg.getArgCode(this.fileSource);

      if (argCode in usedPlurals) {
        // Constrain our plural value ('many'/'singular') BUT still add a
        // single level.  We don't currently prune runtime args like we do
        // with enums, but we ought to...
        // TODO(T41100260) Prune plurals better
        recurse([usedPlurals[argCode]]);
        return combos;
      }

      recurse(curArg.candidateValues, value => (usedPlurals[argCode] = value));
      delete usedPlurals[argCode];
    } else if (fbtNode instanceof FbtPronounNode) {
      invariant(
        curArg instanceof GenderStringVariationArg,
        'Expected GenderStringVariationArg but got: %s',
        varDump(curArg),
      );
      const argCode = curArg.getArgCode(this.fileSource);

      if (argCode in usedPronouns) {
        // Constrain our pronoun value BUT still add a
        // single level.  We don't currently prune runtime args like we do
        // with enums, but we ought to...
        // TODO(T82185334) Prune pronouns better
        recurse([usedPronouns[argCode]]);
        return combos;
      }

      recurse(curArg.candidateValues, value => (usedPronouns[argCode] = value));

      delete usedPronouns[argCode];
    } else if (
      curArg instanceof NumberStringVariationArg ||
      curArg instanceof GenderStringVariationArg
    ) {
      recurse(curArg.candidateValues);
    } else {
      invariant(
        false,
        'Unsupported string variation argument: %s',
        varDump(curArg),
      );
    }
    return combos;
  }
}

module.exports = JSFbtBuilder;
