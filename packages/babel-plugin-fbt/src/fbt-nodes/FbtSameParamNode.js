/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/

'use strict';

/*::
import type {FromBabelNodeFunctionArgs} from './FbtNodeUtil';
import type {StringVariationArgsMap} from './FbtArguments';
*/

const {
  errorAt,
} = require('../FbtUtil');
const FbtNode = require('./FbtNode');
const {createInstanceFromFbtConstructCallsite, tokenNameToTextPattern} = require('./FbtNodeUtil');
const {
  isStringLiteral,
} = require('@babel/types');
const invariant = require('invariant');

/**
 * Represents an <fbt:sameParam> or fbt.sameParam() construct.
 * @see docs/params.md
 */
class FbtSameParamNode
  extends FbtNode/*:: <empty, BabelNodeCallExpression> */ {

  /*:: static +type: 'sameParam'; */

  /**
   * Create a new class instance given a BabelNode root node.
   * If that node is incompatible, we'll just return `null`.
   */
  static fromBabelNode({
    moduleName,
    node,
  } /*: FromBabelNodeFunctionArgs */) /*: ?FbtSameParamNode */ {
    return createInstanceFromFbtConstructCallsite(moduleName, node, this);
  }

  _getTokenName() /*: string */ {
    const [name] = this.getCallNodeArguments() || [];

    invariant(isStringLiteral(name),
      'Expected first argument of %s.sameParam to be a string literal, but got `%s`',
      this.moduleName,
      name && name.type || 'unknown',
    );

    return name.value;
  }

  getText(_argsList /*: StringVariationArgsMap */) /*: string */ {
    try {
      // TODO(T79804447): verify that the token name was already defined at the sentence level
      return tokenNameToTextPattern(this._getTokenName());
    } catch (error) {
      throw errorAt(this.node, error);
    }
  }

  getArgsForStringVariationCalc() /*: $ReadOnlyArray<empty> */ {
    return [];
  }

  getFbtRuntimeArg(): null {
    return null;
  }
}
// $FlowFixMe[cannot-write] Needed because node.js v10 does not support static constants on classes
FbtSameParamNode.type = 'sameParam';

module.exports = FbtSameParamNode;
