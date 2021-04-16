/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/
/* eslint-disable brace-style */ // Needed due to Flow types inlined in comments

'use strict';

/*::
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';

type Options = {|
  count: BabelNode, // Represents the number used for determining the plural case at runtime
  many?: ?string, // text to show when count>1
  name: string, // token name
  // If true, show the `count` number as a prefix of the current plural text
  showCount?: ?$Keys<$PropertyType<typeof ValidPluralOptions, 'showCount'>>,
  value?: ?BabelNode, // optional value to replace token (rather than count)
|};
*/

const {ValidPluralOptions} = require('../FbtConstants');
const {
  collectOptionsFromFbtConstruct,
  enforceBabelNode,
  enforceString,
  enforceStringEnum,
  errorAt,
} = require('../FbtUtil');
const {EXACTLY_ONE, NUMBER_ANY} = require('../translate/IntlVariations');
const {NumberStringVariationArg} = require('./FbtArguments');
const FbtNode = require('./FbtNode');
const {createInstanceFromFbtConstructCallsite} = require('./FbtNodeUtil');

const DEFAULT_TOKEN_NAME = 'number';

/**
 * Represents an <fbt:plural> or fbt.plural() construct.
 * @see docs/plurals.md
 */
class FbtPluralNode extends FbtNode/*:: <
  NumberStringVariationArg,
  BabelNodeCallExpression,
  > */ {

  /*::
  static +type: 'plural';

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
      return {
        count,
        many: enforceString.orNull(rawOptions.many, '`many` option'),
        name: enforceString.orNull(rawOptions.name, '`name` option') || DEFAULT_TOKEN_NAME,
        showCount: enforceStringEnum.orNull(
          rawOptions.showCount,
          ValidPluralOptions.showCount,
          '`showCount` option',
        ),
        value: enforceBabelNode.orNull(rawOptions.value, '`value` option'),
      };
    } catch (error) {
      throw errorAt(this.node, error);
    }
  }

  _getTokenName() /*: ?string */ {
    throw errorAt(this.node, 'not implemented yet');
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
FbtPluralNode.type = 'plural';

module.exports = FbtPluralNode;
