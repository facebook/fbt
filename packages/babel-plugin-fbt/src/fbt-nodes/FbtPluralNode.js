/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/
/* eslint-disable brace-style */ // Needed due to Flow types inlined in comments
/* eslint-disable fb-www/flow-exact-by-default-object-types */

'use strict';

/*::
import type {StringVariationArgsMap} from './FbtArguments';
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';

type Options = {|
  count: BabelNode, // Represents the number used for determining the plural case at runtime
  many?: ?string, // text to show when count>1
  name: ?string, // token name
  // If `yes`, show the `count` number as a prefix of the current plural text
  // If `ifMany`, behaves as `yes` when the count value is greater than 1
  // Else, `no` to hide the `count` number
  showCount: $Keys<typeof ShowCountKeys>,
  value?: ?BabelNode, // optional value to replace token (rather than count)
|};
*/

const {PLURAL_PARAM_TOKEN, ShowCountKeys, ValidPluralOptions} = require('../FbtConstants');
const {
  collectOptionsFromFbtConstruct,
  enforceBabelNode,
  enforceString,
  enforceStringEnum,
  errorAt,
  varDump,
} = require('../FbtUtil');
const {EXACTLY_ONE, NUMBER_ANY} = require('../translate/IntlVariations');
const {NumberStringVariationArg} = require('./FbtArguments');
const FbtNode = require('./FbtNode');
const FbtNodeType = require('./FbtNodeType');
const {createInstanceFromFbtConstructCallsite, tokenNameToTextPattern} = require('./FbtNodeUtil');
const {
  isStringLiteral,
} = require('@babel/types');
const invariant = require('invariant');
const nullthrows = require('nullthrows');

/**
 * Represents an <fbt:plural> or fbt.plural() construct.
 * @see docs/plurals.md
 */
class FbtPluralNode extends FbtNode/*:: <
  NumberStringVariationArg,
  BabelNodeCallExpression,
  > */ {

  /*::
  static +type: FbtNodeType;

  +options: Options;
  */

  /**
   * Create a new class instance given a BabelNode root node.
   * If that node is incompatible, we'll just return `null`.
   */
  static fromBabelNode({
    moduleName,
    node,
  } /*: FromBabelNodeFunctionArgs */) /*: ?FbtPluralNode */ {
    return createInstanceFromFbtConstructCallsite(moduleName, node, this);
  }

  getOptions() /*: Options */ {
    const rawOptions = collectOptionsFromFbtConstruct(
      this.moduleName,
      this.node,
      ValidPluralOptions,
    );

    try {
      const [_, countArg] = this.getCallNodeArguments() || [];
      const count = enforceBabelNode(countArg, '`count`, the second function argument');
      const showCount = enforceStringEnum.orNull(
        rawOptions.showCount,
        ValidPluralOptions.showCount,
        '`showCount` option',
      ) || ShowCountKeys.no;
      const name = enforceString.orNull(rawOptions.name, '`name` option') ||
        (showCount !== ShowCountKeys.no ? PLURAL_PARAM_TOKEN : null);
      return {
        count,
        many: enforceString.orNull(rawOptions.many, '`many` option'),
        name,
        showCount,
        value: enforceBabelNode.orNull(rawOptions.value, '`value` option'),
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
    |}
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
        invariant(false, 'Unsupported string variation value: %s', varDump(svArgValue));
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
      }
    });
  }

  getText(argsMap: StringVariationArgsMap): string {
    try {
      const {showCount} = this.options;
      return this._branchByNumberVariation(argsMap, {
        exactlyOne: () =>
          (showCount === ShowCountKeys.yes ? '1 ' : '') + this._getSingularText(),
        anyNumber: () => {
          const many = this.options.many ?? this._getSingularText() + 's';
          return showCount !== ShowCountKeys.no
            ? tokenNameToTextPattern(this._getStaticTokenName()) + ' ' + many
            : many;
        }
      });
    } catch (error) {
      throw errorAt(this.node, error);
    }
  }

  _getSingularText(): string {
    const callArg0 = nullthrows((this.getCallNodeArguments() || [])[0]);
    invariant(isStringLiteral(callArg0),
      'Expected a StringLiteral but got "%s" instead',
      callArg0.type,
    );
    return callArg0.value;
  }

  _getValueNode() /*: BabelNode */ {
    throw errorAt(this.node, 'not implemented yet');
  }

  _getCountNode() /*: BabelNode */ {
    throw errorAt(this.node, 'not implemented yet');
  }

  getArgsForStringVariationCalc() /*: $ReadOnlyArray<NumberStringVariationArg> */ {
    return [new NumberStringVariationArg(this, this.options.count, [NUMBER_ANY, EXACTLY_ONE])];
  }
}
// $FlowFixMe[cannot-write] Needed because node.js v10 does not support static constants on classes
FbtPluralNode.type = FbtNodeType.Plural;

module.exports = FbtPluralNode;
