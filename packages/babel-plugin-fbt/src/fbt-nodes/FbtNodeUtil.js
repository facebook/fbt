/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/

'use strict';

/*::
import type {JSModuleNameType} from '../FbtConstants';

export type FromBabelNodeFunctionArgs = {|
  moduleName: JSModuleNameType,
  node: BabelNode,
|};
*/

const FbtNodeChecker = require('../FbtNodeChecker');

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

module.exports = {
  createInstanceFromFbtConstructCallsite,
};
