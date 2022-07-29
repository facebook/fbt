/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

/*eslint max-len: ["error", 100]*/

'use strict';

import type {StringVariationArgsMap} from './FbtArguments';
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';

const FbtNode = require('./FbtNode');
const FbtNodeType = require('./FbtNodeType');
const {isJSXText, isStringLiteral} = require('@babel/types');

/**
 * Represents the text literals present within <fbt> or fbt() callsites.
 *
 * I.e.
 *
 *  fbt(
 *    'Hello', // <-- FbtTextNode
 *    'description',
 *  )
 */
class FbtTextNode extends FbtNode<
  empty,
  BabelNodeStringLiteral | BabelNodeJSXText,
  null,
  null,
> {
  static +type: FbtNodeType = FbtNodeType.Text;

  /**
   * Create a new class instance given a BabelNode root node.
   * If that node is incompatible, we'll just return `null`.
   */
  static fromBabelNode({
    moduleName,
    node,
  }: FromBabelNodeFunctionArgs): ?FbtTextNode {
    return isJSXText(node) || isStringLiteral(node)
      ? new FbtTextNode({
          moduleName,
          node,
        })
      : null;
  }

  getOptions(): null {
    return null;
  }

  getArgsForStringVariationCalc(): $ReadOnlyArray<empty> {
    return [];
  }

  getText(_argsList: StringVariationArgsMap): string {
    return this.node.value;
  }

  getFbtRuntimeArg(): null {
    return null;
  }
}

module.exports = FbtTextNode;
