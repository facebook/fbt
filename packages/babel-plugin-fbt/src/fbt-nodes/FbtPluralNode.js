/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

/*eslint max-len: ["error", 100]*/

'use strict';

import type {BabelNodeCallExpressionArg} from '../FbtUtil';
import type {StringVariationArgsMap} from './FbtArguments';
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';

const {
  PLURAL_PARAM_TOKEN,
  ShowCountKeys,
  ValidPluralOptions,
} = require('../FbtConstants');
const {
  collectOptionsFromFbtConstruct,
  createFbtRuntimeArgCallExpression,
  enforceBabelNodeCallExpressionArg,
  enforceString,
  enforceStringEnum,
  errorAt,
  varDump,
} = require('../FbtUtil');
const {EXACTLY_ONE, NUMBER_ANY} = require('../translate/IntlVariations');
const {NumberStringVariationArg} = require('./FbtArguments');
const FbtNode = require('./FbtNode');
const FbtNodeType = require('./FbtNodeType');
const {
  createInstanceFromFbtConstructCallsite,
  tokenNameToTextPattern,
} = require('./FbtNodeUtil');
const {isStringLiteral, stringLiteral} = require('@babel/types');
const invariant = require('invariant');
const nullthrows = require('nullthrows');

type Options = {|
  // Represents the number used for determining the plural case at runtime
  count: BabelNodeCallExpressionArg,
  many?: ?string, // text to show when count>1
  name: ?string, // token name
  // If `yes`, show the `count` number as a prefix of the current plural text
  // If `ifMany`, behaves as `yes` when the count value is greater than 1
  // Else, `no` to hide the `count` number
  showCount: $Keys<typeof ShowCountKeys>,
  value?: ?BabelNodeCallExpressionArg, // optional value to replace token (rather than count)
|};

/**
 * Represents an <fbt:plural> or fbt.plural() construct.
 * @see docs/plurals.md
 */
class FbtPluralNode extends FbtNode<
  NumberStringVariationArg,
  BabelNodeCallExpression,
  null,
  Options,
> {
  static +type: FbtNodeType = FbtNodeType.Plural;

  /**
   * Create a new class instance given a BabelNode root node.
   * If that node is incompatible, we'll just return `null`.
   */
  static fromBabelNode({
    moduleName,
    node,
  }: FromBabelNodeFunctionArgs): ?FbtPluralNode {
    return createInstanceFromFbtConstructCallsite(moduleName, node, this);
  }

  getOptions(): Options {
    const rawOptions = collectOptionsFromFbtConstruct(
      this.moduleName,
      this.node,
      ValidPluralOptions,
    );

    try {
      const [_, countArg] = this.getCallNodeArguments() || [];
      const count = enforceBabelNodeCallExpressionArg(
        countArg,
        '`count`, the second function argument',
      );
      const showCount =
        enforceStringEnum.orNull(
          rawOptions.showCount,
          ValidPluralOptions.showCount,
          '`showCount` option',
        ) || ShowCountKeys.no;
      const name =
        enforceString.orNull(rawOptions.name, '`name` option') ||
        (showCount !== ShowCountKeys.no ? PLURAL_PARAM_TOKEN : null);
      return {
        count,
        many: enforceString.orNull(rawOptions.many, '`many` option'),
        name,
        showCount,
        value: enforceBabelNodeCallExpressionArg.orNull(
          rawOptions.value,
          '`value` option',
        ),
      };
    } catch (error) {
      throw errorAt(this.node, error);
    }
  }

  _branchByNumberVariation<T>(
    argsMap: StringVariationArgsMap,
    scenario: {|
      exactlyOne: () => T,
      anyNumber: () => T,
    |},
  ): T {
    const svArg = argsMap.get(this);
    const svArgValue = nullthrows(svArg.value);

    switch (svArgValue) {
      case EXACTLY_ONE: {
        return scenario.exactlyOne();
      }
      case NUMBER_ANY: {
        return scenario.anyNumber();
      }
      default:
        invariant(
          false,
          'Unsupported string variation value: %s',
          varDump(svArgValue),
        );
    }
  }

  _getStaticTokenName(): string {
    return nullthrows(this.options.name);
  }

  getTokenName(argsMap: StringVariationArgsMap): ?string {
    return this._branchByNumberVariation(argsMap, {
      exactlyOne: () => null,
      anyNumber: () => {
        return this.options.showCount !== ShowCountKeys.no
          ? this._getStaticTokenName()
          : null;
      },
    });
  }

  getText(argsMap: StringVariationArgsMap): string {
    try {
      const {showCount} = this.options;
      return this._branchByNumberVariation(argsMap, {
        exactlyOne: () =>
          (showCount === ShowCountKeys.yes ? '1 ' : '') +
          this._getSingularText(),
        anyNumber: () => {
          const many = this.options.many ?? this._getSingularText() + 's';
          return showCount !== ShowCountKeys.no
            ? tokenNameToTextPattern(this._getStaticTokenName()) + ' ' + many
            : many;
        },
      });
    } catch (error) {
      throw errorAt(this.node, error);
    }
  }

  _getSingularText(): string {
    const callArg0 = nullthrows((this.getCallNodeArguments() || [])[0]);
    invariant(
      isStringLiteral(callArg0),
      'Expected a StringLiteral but got "%s" instead',
      callArg0.type,
    );
    return callArg0.value;
  }

  getArgsForStringVariationCalc(): $ReadOnlyArray<NumberStringVariationArg> {
    return [
      new NumberStringVariationArg(this, this.options.count, [
        NUMBER_ANY,
        EXACTLY_ONE,
      ]),
    ];
  }

  getFbtRuntimeArg(): BabelNodeCallExpression {
    const {count, name, showCount, value} = this.options;

    const pluralArgs = [count];
    if (showCount !== ShowCountKeys.no) {
      invariant(
        name != null,
        'name must be defined when showCount=%s',
        showCount,
      );
      pluralArgs.push(stringLiteral(name));
      if (value) {
        pluralArgs.push(value);
      }
    }
    return createFbtRuntimeArgCallExpression(this, pluralArgs);
  }

  getArgsThatShouldNotContainFunctionCallOrClassInstantiation(): $ReadOnly<{
    [argName: string]: BabelNodeCallExpressionArg,
  }> {
    return {count: this.options.count};
  }
}

module.exports = FbtPluralNode;
