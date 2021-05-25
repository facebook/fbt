/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+i18n_fbt_js
 * @flow
 */

/*eslint max-len: ["error", 100]*/

'use strict';

import type {EnumModule} from '../FbtEnumRegistrar';
import type {BabelNodeCallExpressionArg} from '../FbtUtil';
import type {StringVariationArgsMap} from './FbtArguments';
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';

type Options = {|
  range: EnumModule, // key/value pairs to use for this fbt:enum
  // Represents the enum value that'll be used to select
  // the corresponding enum string variation at runtime
  value: BabelNodeCallExpressionArg,
|};

const {FBT_ENUM_MODULE_SUFFIX} = require('../FbtConstants');
const FbtEnumRegistrar = require('../FbtEnumRegistrar');
const {
  createFbtRuntimeArgCallExpression,
  enforceBabelNode,
  errorAt,
  varDump,
  enforceBabelNodeCallExpressionArg,
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
          range[item.value] = item.value;
        });
      } else if (isObjectExpression(rangeNode)) {
        rangeNode.properties.forEach(prop => {
          invariant(
            isObjectProperty(prop),
            'Enum entries must be standard object properties',
          );
          const valueNode = prop.value;
          const keyNode = prop.key;
          invariant(
            isStringLiteral(valueNode),
            'Enum values must be string literals',
          );
          invariant(
            isStringLiteral(keyNode) ||
              isIdentifier(keyNode) ||
              isNumericLiteral(keyNode),
            'Enum keys must be string literals instead of `%s`',
            keyNode.type,
          );
          range[keyNode.name || keyNode.value] = valueNode.value;
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
    // TODO(T40113359): de-duplicate enums. See https://fburl.com/diffusion/8if4osaa
    // That probably needs to be done at the FbtElementNode level
    // Should we also add the enum-range to EnumStringVariationArg? Or this instance?
    // That would help detect cases where fbt:enum is used with non-identical enum-range keys.
    return [
      new EnumStringVariationArg(
        this,
        this.options.value,
        Object.keys(this.options.range),
      ),
    ];
  }

  getFbtRuntimeArg(): BabelNodeCallExpression {
    const {range, value} = this.options;
    const runtimeRange = objectExpression(
      Object.keys(range).map(key =>
        objectProperty(stringLiteral(key), stringLiteral(range[key])),
      ),
    );

    return createFbtRuntimeArgCallExpression(this, [value, runtimeRange]);
  }

  getArgsThatShouldNotContainFunctionCallOrClassInstantiation(): $ReadOnly<{
    [argName: string]: BabelNodeCallExpressionArg,
  }> {
    return {value: this.options.value};
  }
}

module.exports = FbtEnumNode;
