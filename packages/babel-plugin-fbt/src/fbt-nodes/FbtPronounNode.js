/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow
 * @format
 * @oncall i18n_fbt_js
 */

/*eslint max-len: ["error", 100]*/

'use strict';

import type {ValidPronounUsagesKey} from '../FbtConstants';
import type {BabelNodeCallExpressionArg} from '../FbtUtil';
import type {GenderConstEnum} from '../Gender';
import type {StringVariationArgsMap} from './FbtArguments';
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';

const {
  ValidPronounOptions,
  ValidPronounUsages,
  ValidPronounUsagesKeys,
} = require('../FbtConstants');
const {
  collectOptionsFromFbtConstruct,
  createFbtRuntimeArgCallExpression,
  enforceBabelNodeCallExpressionArg,
  enforceBoolean,
  enforceStringEnum,
  errorAt,
  varDump,
} = require('../FbtUtil');
const Gender = require('../Gender');
const {GENDER_ANY} = require('../translate/IntlVariations');
const {GenderStringVariationArg} = require('./FbtArguments');
const FbtNode = require('./FbtNode');
const FbtNodeType = require('./FbtNodeType');
const {createInstanceFromFbtConstructCallsite} = require('./FbtNodeUtil');
const {
  identifier,
  isStringLiteral,
  numericLiteral,
  objectExpression,
  objectProperty,
} = require('@babel/types');
const invariant = require('invariant');
const nullthrows = require('nullthrows');

type Options = {|
  // If true, capitalize the pronoun text
  capitalize?: ?boolean,
  // BabelNodeCallExpressionArg representing the value of the `gender`
  gender: BabelNodeCallExpressionArg,
  // If true, exclude non-human-related pronouns from the generated string variations
  human?: ?boolean,
  // Type of pronoun
  type: ValidPronounUsagesKey,
|};
const {GENDER_CONST} = Gender;

const candidatePronounGenders: $ReadOnlyArray<GenderConstEnum> =
  consolidatedPronounGenders();

const HUMAN_OPTION = 'human';

/**
 * Represents an <fbt:pronoun> or fbt.pronoun() construct.
 * @see docs/pronouns.md
 */
class FbtPronounNode extends FbtNode<
  GenderStringVariationArg,
  BabelNodeCallExpression,
  null,
  Options,
> {
  static +type: FbtNodeType = FbtNodeType.Pronoun;

  /**
   * Create a new class instance given a BabelNode root node.
   * If that node is incompatible, we'll just return `null`.
   */
  static fromBabelNode({
    moduleName,
    node,
  }: FromBabelNodeFunctionArgs): ?FbtPronounNode {
    return createInstanceFromFbtConstructCallsite(moduleName, node, this);
  }

  getOptions(): Options {
    const {moduleName} = this;
    const rawOptions = collectOptionsFromFbtConstruct(
      moduleName,
      this.node,
      ValidPronounOptions,
    );

    try {
      const args = this.getCallNodeArguments() || [];
      const [usageArg, genderArg] = args;
      invariant(
        isStringLiteral(usageArg),
        '`usage`, the first argument of %s.pronoun() must be a `StringLiteral` but we got `%s`',
        moduleName,
        usageArg?.type || 'unknown',
      );
      const type = enforceStringEnum(
        usageArg.value,
        ValidPronounUsages,
        `\`usage\`, the first argument of ${moduleName}.pronoun()`,
      );
      const gender = enforceBabelNodeCallExpressionArg(
        genderArg,
        '`gender`, the second argument',
      );
      const mergedOptions = nullthrows(rawOptions);
      return {
        capitalize: enforceBoolean.orNull(mergedOptions.capitalize),
        gender,
        human: enforceBoolean.orNull(mergedOptions.human),
        type,
      };
    } catch (error) {
      throw errorAt(this.node, error);
    }
  }

  initCheck(): void {
    const args = this.getCallNodeArguments();
    invariant(
      (args && (args.length === 2 || args.length === 3)) || !args,
      "Expected '(usage, gender [, options])' arguments to %s.pronoun()",
      this.moduleName,
    );
  }

  getText(argsMap: StringVariationArgsMap): string {
    try {
      const svArg = argsMap.get(this);
      const svArgValue = nullthrows(svArg.value);
      const {options} = this;

      const word = Gender.getData(
        svArgValue === GENDER_ANY
          ? GENDER_CONST.UNKNOWN_PLURAL
          : // $FlowExpectedError(incompatible-cast) We type-checked for `GENDER_ANY` just above
            (svArgValue: GenderConstEnum),
        options.type,
      );
      invariant(
        typeof word === 'string',
        'Expected pronoun word to be a string but we got %s',
        varDump(word),
      );

      return options.capitalize
        ? word.charAt(0).toUpperCase() + word.substr(1)
        : word;
    } catch (error) {
      throw errorAt(this.node, error);
    }
  }

  getArgsForStringVariationCalc(): $ReadOnlyArray<GenderStringVariationArg> {
    const {options} = this;
    const candidates = new Set<GenderConstEnum | '*'>();

    for (const gender of candidatePronounGenders) {
      if (options.human === true && gender === GENDER_CONST.NOT_A_PERSON) {
        continue;
      }
      const resolvedGender = getPronounGenderKey(options.type, gender);
      candidates.add(
        resolvedGender === GENDER_CONST.UNKNOWN_PLURAL
          ? GENDER_ANY
          : resolvedGender,
      );
    }

    return [
      new GenderStringVariationArg(
        this,
        options.gender,
        Array.from(candidates),
      ),
    ];
  }

  getFbtRuntimeArg(): BabelNodeCallExpression {
    const {gender, human, type} = this.options;
    const numericUsageExpr = numericLiteral(ValidPronounUsages[type]);

    const pronounArgs = [numericUsageExpr, gender];
    if (human) {
      pronounArgs.push(
        objectExpression([
          objectProperty(identifier(HUMAN_OPTION), numericLiteral(1)),
        ]),
      );
    }

    return createFbtRuntimeArgCallExpression(this, pronounArgs);
  }

  getArgsThatShouldNotContainFunctionCallOrClassInstantiation(): $ReadOnly<{
    [argName: string]: BabelNodeCallExpressionArg,
  }> {
    return {gender: this.options.gender};
  }
}

/**
 * Must match implementation from fbt.js
 * @see (FB) https://fburl.com/diffusion/3gbcj3aq
 * @see (OSS) https://github.com/facebook/fbt/blob/19531133625dab1d38995dcf578dcfdfa0b09048/runtime/shared/fbt.js#L316-L348
 */
function getPronounGenderKey(
  usage: ValidPronounUsagesKey,
  gender: GenderConstEnum,
): GenderConstEnum {
  switch (gender) {
    case GENDER_CONST.NOT_A_PERSON:
      return usage === ValidPronounUsagesKeys.object ||
        usage === ValidPronounUsagesKeys.reflexive
        ? GENDER_CONST.NOT_A_PERSON
        : GENDER_CONST.UNKNOWN_PLURAL;

    case GENDER_CONST.FEMALE_SINGULAR:
    case GENDER_CONST.FEMALE_SINGULAR_GUESS:
      return GENDER_CONST.FEMALE_SINGULAR;

    case GENDER_CONST.MALE_SINGULAR:
    case GENDER_CONST.MALE_SINGULAR_GUESS:
      return GENDER_CONST.MALE_SINGULAR;

    case GENDER_CONST.MIXED_UNKNOWN:
    case GENDER_CONST.FEMALE_PLURAL:
    case GENDER_CONST.MALE_PLURAL:
    case GENDER_CONST.NEUTER_PLURAL:
    case GENDER_CONST.UNKNOWN_PLURAL:
      return GENDER_CONST.UNKNOWN_PLURAL;

    case GENDER_CONST.NEUTER_SINGULAR:
    case GENDER_CONST.UNKNOWN_SINGULAR:
      return usage === ValidPronounUsagesKeys.reflexive
        ? GENDER_CONST.NOT_A_PERSON
        : GENDER_CONST.UNKNOWN_PLURAL;
  }

  invariant(false, 'Unknown GENDER_CONST value: %s', varDump(gender));
}

// Prepare the list of genders actually used by the pronoun construct
function consolidatedPronounGenders(): $ReadOnlyArray<GenderConstEnum> {
  const set = new Set<GenderConstEnum>();

  for (const genderKey of Object.keys(GENDER_CONST)) {
    for (const usageKey of Object.keys(ValidPronounUsagesKeys)) {
      set.add(
        getPronounGenderKey(
          ValidPronounUsagesKeys[usageKey],
          GENDER_CONST[genderKey],
        ),
      );
    }
  }

  return Array.from(set).sort((left, right) => left - right);
}

module.exports = FbtPronounNode;
