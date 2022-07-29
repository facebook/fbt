/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

/* eslint max-len: ["warn", 120] */

'use strict';

import type {AnyStringVariationArg} from './fbt-nodes/FbtArguments';
import type {EnumKey} from './FbtEnumRegistrar';
import type {GenderConstEnum} from './Gender';
import type {JSFBTMetaEntry} from './index';

const {
  EnumStringVariationArg,
  GenderStringVariationArg,
  NumberStringVariationArg,
} = require('./fbt-nodes/FbtArguments');
const FbtElementNode = require('./fbt-nodes/FbtElementNode');
const FbtEnumNode = require('./fbt-nodes/FbtEnumNode');
const FbtImplicitParamNode = require('./fbt-nodes/FbtImplicitParamNode');
const FbtNameNode = require('./fbt-nodes/FbtNameNode');
const FbtParamNode = require('./fbt-nodes/FbtParamNode');
const FbtPluralNode = require('./fbt-nodes/FbtPluralNode');
const FbtPronounNode = require('./fbt-nodes/FbtPronounNode');
const {ShowCountKeys} = require('./FbtConstants');
const {varDump} = require('./FbtUtil');
const {
  EXACTLY_ONE,
  FbtVariationType,
  GENDER_ANY,
  NUMBER_ANY,
  SUBJECT,
} = require('./translate/IntlVariations');
const invariant = require('invariant');
const nullthrows = require('nullthrows');

/**
 * Helper class to assemble the JSFBT table data.
 * It's responsible for:
 * - producing all the combinations of string variations' candidate values,
 * from a given list of string variation arguments.
 * - generating metadata to describe the meaning of each level of the JSFBT table tree.
 */
class JSFbtBuilder {
  /**
   * Source code that matches the Babel nodes used in the provided `stringVariationArgs`
   */
  +fileSource: string;
  /**
   * Map of fbt:enum at the current recursion level of `_getStringVariationCombinations()`
   */
  +usedEnums: {[enumArgCode: string]: EnumKey};
  /**
   * Map of fbt:plural at the current recursion level of `_getStringVariationCombinations()`
   */
  +usedPlurals: {
    [pluralsArgCode: string]: typeof EXACTLY_ONE | typeof NUMBER_ANY,
  };
  /**
   * Map of fbt:pronoun at the current recursion level of `_getStringVariationCombinations()`
   */
  +usedPronouns: {
    [pronounsArgCode: string]: GenderConstEnum | typeof GENDER_ANY,
  };
  /**
   * Set this to `true` if we're extracting strings for React Native
   */
  +reactNativeMode: boolean;
  /**
   * List of string variation arguments from a given fbt callsite
   */
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

  /**
   * Generates a list of metadata entries that describe the usage of each level
   * of the JSFBT table tree
   * @param compactStringVariationArgs Consolidated list of string variation arguments.
   * See FbtFunctionCallProcessor#_compactStringVariationArgs()
   */
  buildMetadata(
    compactStringVariationArgs: $ReadOnlyArray<AnyStringVariationArg>,
  ): Array<?JSFBTMetaEntry> {
    return compactStringVariationArgs.map(svArg => {
      const {fbtNode} = svArg;

      if (fbtNode instanceof FbtPluralNode) {
        if (fbtNode.options.showCount !== ShowCountKeys.no) {
          return {
            token: nullthrows(fbtNode.options.name),
            type: FbtVariationType.NUMBER,
            singular: true,
          };
        } else {
          return this.reactNativeMode ? {type: FbtVariationType.NUMBER} : null;
        }
      }

      if (
        fbtNode instanceof FbtElementNode ||
        fbtNode instanceof FbtImplicitParamNode
      ) {
        return {
          token: SUBJECT,
          type: FbtVariationType.GENDER,
        };
      }

      if (fbtNode instanceof FbtPronounNode) {
        return this.reactNativeMode ? {type: FbtVariationType.PRONOUN} : null;
      }

      if (svArg instanceof EnumStringVariationArg) {
        invariant(
          fbtNode instanceof FbtEnumNode,
          'Expected fbtNode to be an instance of FbtEnumNode but got `%s` instead',
          fbtNode.constructor.name || varDump(fbtNode),
        );

        // We ensure we have placeholders in our metadata because enums and
        // pronouns don't have metadata and will add "levels" to our resulting
        // table.
        //
        // Example for the code:
        //
        //   fbt.enum(value, {
        //     groups: 'Groups',
        //     photos: 'Photos',
        //     videos: 'Videos',
        //   })
        //
        // Expected metadata entry:
        //   for non-RN -> `null`
        //   for RN     -> `{range: ['groups', 'photos', 'videos']}`
        return this.reactNativeMode
          ? // Enum range will later be used to extract enums from the payload for React Native
            {range: Object.keys(fbtNode.options.range)}
          : null;
      }

      if (
        svArg instanceof GenderStringVariationArg ||
        svArg instanceof NumberStringVariationArg
      ) {
        invariant(
          fbtNode instanceof FbtNameNode || fbtNode instanceof FbtParamNode,
          'Expected fbtNode to be an instance of FbtNameNode or FbtParamNode but got `%s` instead',
          fbtNode.constructor.name || varDump(fbtNode),
        );
        return svArg instanceof NumberStringVariationArg
          ? {
              token: fbtNode.options.name,
              type: FbtVariationType.NUMBER,
            }
          : {
              token: fbtNode.options.name,
              type: FbtVariationType.GENDER,
            };
      }

      invariant(
        false,
        'Unsupported string variation argument: %s',
        varDump(svArg),
      );
    });
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
      isCollapsible: boolean = false,
    ): void =>
      candidateValues.forEach(value => {
        if (beforeRecurse) {
          beforeRecurse(value);
        }
        this._getStringVariationCombinations(
          combos,
          curArgIndex + 1,
          prevArgs.concat(
            curArg.cloneWithValue(
              // $FlowFixMe[incompatible-call] `value` should be compatible with cloneWithValue()
              value,
              isCollapsible,
            ),
          ),
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

        recurse([enumKey], undefined, true);
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
      recurse(
        curArg.candidateValues,
        undefined,
        curArg instanceof GenderStringVariationArg &&
          fbtNode instanceof FbtImplicitParamNode,
      );
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
