/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/

'use strict';

/*::
import type {AnyFbtNode} from './FbtNode';
import type {JSModuleNameType} from '../FbtConstants';
import type FbtElementNode from './FbtElementNode';
import type FbtImplicitParamNode from './FbtImplicitParamNode';

export type FromBabelNodeFunctionArgs = {|
  moduleName: JSModuleNameType,
  node: BabelNode,
|};
*/


const FbtNodeChecker = require('../FbtNodeChecker');
const {varDump} = require('../FbtUtil');
const invariant = require('invariant');

function createInstanceFromFbtConstructCallsite/*:: <N: {}> */(
  moduleName /*: JSModuleNameType */,
  node /*: BabelNode */,
  Constructor /*: Class<N> & {+type: string} */,
) /*: ?N */ {
  const checker = FbtNodeChecker.forModule(moduleName);
  const constructName = checker.getFbtConstructNameFromFunctionCall(node);
  return constructName === Constructor.type
    ? new Constructor({
      moduleName,
      node,
    })
    : null;
}

/**
 * Returns the closest ancestor node of type: FbtElementNode | FbtImplicitParamNode
 */
function getClosestElementOrImplicitParamNodeAncestor(
  startNode: AnyFbtNode,
): FbtElementNode | FbtImplicitParamNode {
  const ret = startNode.getFirstAncestorOfType(require('./FbtImplicitParamNode')) ||
    startNode.getFirstAncestorOfType(require('./FbtElementNode'));
  invariant(
    ret != null,
    'Unable to find closest ancestor of type FbtElementNode or FbtImplicitParamNode for node: %s',
    varDump(startNode),
  );
  return ret;
}

module.exports = {
  createInstanceFromFbtConstructCallsite,
  getClosestElementOrImplicitParamNodeAncestor,
};
