/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow
 * @format
 * @oncall i18n_fbt_js
 */

/*eslint max-len: ["error", 100]*/

'use strict';

import type {EnumModule} from '../FbtEnumRegistrar';
import type {BabelNodeCallExpressionArg} from '../FbtUtil';
import type {StringVariationArgsMap} from './FbtArguments';
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';

const {FBT_ENUM_MODULE_SUFFIX} = require('../FbtConstants');
const FbtEnumRegistrar = require('../FbtEnumRegistrar');
const {
  createFbtRuntimeArgCallExpression,
  enforceBabelNode,
  enforceBabelNodeCallExpressionArg,
  errorAt,
  varDump,
} = require('../FbtUtil');
const {EnumStringVariationArg} = require('./FbtArguments');
const FbtNode = require('./FbtNode');
const FbtNodeType = require('./FbtNodeType');
const {createInstanceFromFbtConstructCallsite} = require('./FbtNodeUtil');
const {
  isArrayExpression,
  isIdentifier,
  isNumericLiteral,
  isObjectExpression,
  isObjectProperty,
  isStringLiteral,
  objectExpression,
  objectProperty,
  stringLiteral,
} = require('@babel/types');
const invariant = require('invariant');
const nullthrows = require('nullthrows');

type Options = {|
  range: EnumModule, // key/value pairs to use for this fbt:enum
  // Represents the enum value that'll be used to select
  // the corresponding enum string variation at runtime
  value: BabelNodeCallExpressionArg,
|};

/**
 * Represents an <fbt:enum> or fbt.enum() construct.
 * @see docs/enums.md
 */
class FbtEnumNode extends FbtNode<
  EnumStringVariationArg,
  BabelNodeCallExpression,
  null,
  Options,
> {
  static +type: FbtNodeType = FbtNodeType.Enum;

  /**
   * Create a new class instance given a BabelNode root node.
   * If that node is incompatible, we'll just return `null`.
   */
  static fromBabelNode({
    moduleName,
    node,
  }: FromBabelNodeFunctionArgs): ?FbtEnumNode {
    return createInstanceFromFbtConstructCallsite(moduleName, node, this);
  }

  getOptions(): Options {
    const [value, rangeArg] = this.getCallNodeArguments() || [];
    let rangeNode = rangeArg;

    try {
      let range = {};
      // $FlowFixMe[incompatible-type]
      rangeNode = enforceBabelNode(rangeNode, '`range`');
      if (isArrayExpression(rangeNode)) {
        invariant(
          rangeNode.elements && rangeNode.elements.length,
          'List of enum entries must not be empty',
        );
        rangeNode.elements.forEach(item => {
          invariant(
            isStringLiteral(item),
            'Enum values must be string literals',
          );
          // $FlowFixMe[cannot-write] Force write here to assemble the range object
          // $FlowFixMe[prop-missing]
          range[item.value] = item.value;
        });
      } else if (isObjectExpression(rangeNode)) {
        rangeNode.properties.forEach(prop => {
          invariant(
            isObjectProperty(prop),
            'Enum entries must be standard object properties. ' +
              'Method or spread expressions are forbidden',
          );
          const valueNode = prop.value;
          const keyNode: mixed = prop.key;
          invariant(
            isStringLiteral(valueNode),
            'Enum values must be string literals',
          );
          if (isStringLiteral(keyNode) || isNumericLiteral(keyNode)) {
            // $FlowFixMe[cannot-write] Force write here to assemble the range object
            // $FlowFixMe[prop-missing]
            range[keyNode.value.toString()] = valueNode.value;
          } else {
            invariant(
              isIdentifier(keyNode) && prop.computed === false,
              'Enum keys must be string literals instead of `%s` ' +
                'when using an object with computed property names',
              // $FlowFixMe[incompatible-use] BabelNode child classes have a "type" property
              keyNode.type,
            );
            // $FlowFixMe[cannot-write] Force write here to assemble the range object
            range[keyNode.name] = valueNode.value;
          }
        });
        invariant(
          Object.keys(range).length,
          'Map of enum entries must not be empty',
        );
      } else {
        invariant(
          isIdentifier(rangeNode),
          'Expected enum range (second argument) to be an array, object or ' +
            'a variable referring to an fbt enum',
        );

        const manifest = nullthrows(
          FbtEnumRegistrar.getEnum(rangeNode.name),
          `Fbt Enum \`${rangeNode.name}\` not registered; ensure the enum ` +
            `was correctly imported and that it has the ${FBT_ENUM_MODULE_SUFFIX} suffix.`,
        );
        range = manifest;
      }

      return {
        range,
        value: enforceBabelNodeCallExpressionArg(value, '`value`'),
      };
    } catch (error) {
      throw errorAt(this.node, error);
    }
  }

  getText(argsMap: StringVariationArgsMap): string {
    try {
      const svArg = argsMap.get(this);
      const svArgValue = nullthrows(svArg.value);
      return nullthrows(
        this.options.range[svArgValue],
        `Unable to find enum text for key=${varDump(svArgValue)}`,
      );
    } catch (error) {
      throw errorAt(this.node, error);
    }
  }

  getArgsForStringVariationCalc(): $ReadOnlyArray<EnumStringVariationArg> {
    return [
      new EnumStringVariationArg(
        this,
        this.options.value,
        Object.keys(this.options.range),
      ),
    ];
  }

  getFbtRuntimeArg(): BabelNodeCallExpression {
    const [_, rangeArg] = this.getCallNodeArguments() || [];

    let runtimeRange = null;
    if (isIdentifier(rangeArg)) {
      runtimeRange = rangeArg;
    } else {
      const {range} = this.options;
      runtimeRange = objectExpression(
        Object.keys(range).map(key =>
          objectProperty(stringLiteral(key), stringLiteral(range[key])),
        ),
      );
    }

    return createFbtRuntimeArgCallExpression(this, [
      this.options.value,
      runtimeRange,
    ]);
  }

  getArgsThatShouldNotContainFunctionCallOrClassInstantiation(): $ReadOnly<{
    [argName: string]: BabelNodeCallExpressionArg,
  }> {
    return {value: this.options.value};
  }
}

module.exports = FbtEnumNode;
