/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

/*eslint max-len: ["error", 100]*/

'use strict';

import type {JSModuleNameType} from '../FbtConstants';
import type {TokenAliases} from '../index';
import type {StringVariationArgsMap} from './FbtArguments';
import type FbtElementNode from './FbtElementNode';
import type FbtImplicitParamNodeType from './FbtImplicitParamNode';
import type {AnyFbtNode, FbtChildNode, PlainFbtNode} from './FbtNode';
import type FbtNodeType from './FbtNodeType';

const FbtNodeChecker = require('../FbtNodeChecker');
const {errorAt, normalizeSpaces, varDump} = require('../FbtUtil');
const invariant = require('invariant');

export type FromBabelNodeFunctionArgs = {|
  moduleName: JSModuleNameType,
  node: BabelNode,
|};

function createInstanceFromFbtConstructCallsite<N: AnyFbtNode>(
  moduleName: JSModuleNameType,
  node: BabelNode,
  Constructor: Class<N> & $ReadOnly<{type: FbtNodeType, ...}>,
): ?N {
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
): FbtElementNode | FbtImplicitParamNodeType {
  const ret =
    startNode.getFirstAncestorOfType(require('./FbtImplicitParamNode')) ||
    startNode.getFirstAncestorOfType(require('./FbtElementNode'));
  invariant(
    ret != null,
    'Unable to find closest ancestor of type FbtElementNode or FbtImplicitParamNode for node: %s',
    varDump(startNode),
  );
  return ret;
}

function runOnNestedChildren(
  node: AnyFbtNode,
  callback: (node: AnyFbtNode) => void,
): void {
  for (const child of node.children) {
    callback(child);
    if (child.children.length) {
      runOnNestedChildren(child, callback);
    }
  }
}

function toPlainFbtNodeTree(
  fbtNode: AnyFbtNode,
  phraseToIndexMap: Map<AnyFbtNode, number>,
): PlainFbtNode {
  const ret = {
    phraseIndex: phraseToIndexMap.get(fbtNode),
    children: (fbtNode.children
      .map(child =>
        child != null ? toPlainFbtNodeTree(child, phraseToIndexMap) : null,
      )
      .filter(Boolean): $ReadOnlyArray<PlainFbtNode> | void),
    ...fbtNode.toPlainFbtNode(),
  };
  if (ret.phraseIndex == null) {
    delete ret.phraseIndex;
  }
  if (ret.children?.length === 0) {
    delete ret.children;
  }
  return ret;
}

/**
 * Convert input text to a token name.
 *
 * It's using a naive way to replace curly brackets present inside the text to square brackets.
 *
 * It's good enough for now because we currently:
 *   - don't protect/encode curly brackets provided in the source text
 *   - don't prevent token names to contain curly brackets from userland
 *
 * @example `convertToTokenName('Hello {name}') === '=Hello [name]'`
 */
function convertToTokenName(text: string): string {
  return `=${text.replace(/[{}]/g, m => (m === '{' ? '[' : ']'))}`;
}

function tokenNameToTextPattern(tokenName: string): string {
  return `{${tokenName}}`;
}

/**
 * We define an FbtImplicitParamNode's outer token alias to be
 * string concatenation of '=m' + the FbtImplicitParamNode's index in its siblings array.
 *
 * @example For string <fbt> hello <a>world</a></fbt>,
 *          the outer token alias of <a>world</a> will be '=m1'.
 */
function convertIndexInSiblingsArrayToOuterTokenAlias(index: number): string {
  return convertToTokenName(`m${index}`);
}

/**
 * Collect and normalize text output from a tree of fbt nodes.
 * @param subject Babel node of the subject's gender of the sentence
 * @param getChildNodeText Callback responsible for returning the text of an FbtChildNode
 */
function getTextFromFbtNodeTree(
  instance: FbtElementNode | FbtImplicitParamNodeType,
  argsMap: StringVariationArgsMap,
  subject: ?BabelNode,
  preserveWhitespace: boolean,
  getChildNodeText: (
    argsMap: StringVariationArgsMap,
    child: FbtChildNode,
  ) => string,
): string {
  try {
    if (subject) {
      argsMap.mustHave(instance);
    }
    const texts = instance.children.map(getChildNodeText.bind(null, argsMap));
    return normalizeSpaces(texts.join(''), {preserveWhitespace}).trim();
  } catch (error) {
    throw errorAt(instance.node, error);
  }
}

function getChildNodeText(
  argsMap: StringVariationArgsMap,
  child: FbtChildNode,
): string {
  const FbtImplicitParamNode = require('./FbtImplicitParamNode');
  return child instanceof FbtImplicitParamNode
    ? tokenNameToTextPattern(child.getTokenName(argsMap))
    : child.getText(argsMap);
}

function getTokenAliasesFromFbtNodeTree(
  instance: FbtElementNode | FbtImplicitParamNodeType,
  argsMap: StringVariationArgsMap,
): ?TokenAliases {
  const childrentokenAliases = instance.children.map((node, tokenIndex) =>
    getChildNodeTokenAliases(argsMap, node, tokenIndex),
  );
  const tokenAliases = Object.assign({}, ...childrentokenAliases);
  return Object.keys(tokenAliases).length ? tokenAliases : null;
}

function getChildNodeTokenAliases(
  argsMap: StringVariationArgsMap,
  child: FbtChildNode,
  tokenIndex: number,
): TokenAliases {
  const FbtImplicitParamNode = require('./FbtImplicitParamNode');
  if (child instanceof FbtImplicitParamNode) {
    const childToken = child.getTokenName(argsMap);
    invariant(
      childToken != null,
      'The token of FbtImplicitParamNode %s is expected to be non-null',
      varDump(child),
    );
    return {
      [childToken]: convertIndexInSiblingsArrayToOuterTokenAlias(tokenIndex),
    };
  }
  return {};
}

function getChildNodeTextForDescription(
  targetFbtNode: FbtImplicitParamNodeType,
  argsMap: StringVariationArgsMap,
  child: FbtChildNode,
): string {
  const FbtImplicitParamNode = require('./FbtImplicitParamNode');
  if (child instanceof FbtImplicitParamNode) {
    return child === targetFbtNode || !child.isAncestorOf(targetFbtNode)
      ? tokenNameToTextPattern(child.getTokenName(argsMap))
      : child.getTextForDescription(argsMap, targetFbtNode);
  } else {
    return child.getText(argsMap);
  }
}

/**
 * This function gets the mapping from a `FbtSameParamNode`'s token name to
 * the `FbtNode` that shares the same token name.
 * This function also performs token name validation and throws if:
 *     some fbt nodes in the tree have duplicate token names
 *        OR
 *     some `FbtSameParamNode` nodes refer to non-existent token names
 *
 * For example, this function will return
 *    {
 *      "paramToken" => FbtParamNode // which represents <fbt:param name="tokenName">{a}</fbt:param>
 *      "nameToken" => FbtNameNode // which represents <fbt:name name="tokenName2">{name}</fbt:name>
 *    }
 * for the following fbt callsite
 *    <fbt>
 *      <fbt:param name="paramToken">{a}</fbt:param>
 *      {','}
 *      <fbt:sameParam name="paramToken" />
 *      {','}
 *      <fbt:name name="nameToken">{name}</fbt:name>
 *      and finally
 *      <fbt:sameParam name="nameToken" />
 *    </fbt>
 */
function buildFbtNodeMapForSameParam(
  fbtNode: FbtElementNode,
  argsMap: StringVariationArgsMap,
): {|[string]: FbtChildNode|} {
  // Importing this module only here to avoid dependency cycle
  const FbtImplicitParamNode = require('./FbtImplicitParamNode');
  const FbtSameParamNode = require('./FbtSameParamNode');
  const tokenNameToFbtNode = {};
  const tokenNameToSameParamNode: {[string]: FbtSameParamNode} = {};
  runOnNestedChildren(fbtNode, child => {
    if (child instanceof FbtSameParamNode) {
      tokenNameToSameParamNode[child.getTokenName(argsMap)] = child;
      return;
    } else if (
      // FbtImplicitParamNode token names appear redundant but
      // they'll be deduplicated via the token name mangling logic
      child instanceof FbtImplicitParamNode
    ) {
      return;
    }
    const tokenName = child.getTokenName(argsMap);
    if (tokenName != null) {
      const existingFbtNode = tokenNameToFbtNode[tokenName];
      invariant(
        existingFbtNode == null || existingFbtNode === child,
        "There's already a token called `%s` in this %s call. " +
          'Use %s.sameParam if you want to reuse the same token name or ' +
          'give this token a different name.\n' +
          'Existing FbtNode=%s\n' +
          'Redundant FbtNode=%s',
        tokenName,
        fbtNode.moduleName,
        fbtNode.moduleName,
        varDump(existingFbtNode),
        varDump(child),
      );
      // $FlowFixMe[prop-missing]
      tokenNameToFbtNode[tokenName] = child;
    }
  });

  const sameParamTokenNameToRealFbtNode = {};
  for (const sameParamTokenName in tokenNameToSameParamNode) {
    const realFbtNode = tokenNameToFbtNode[sameParamTokenName];
    invariant(
      realFbtNode != null,
      'Expected fbt `sameParam` construct with name=`%s` to refer to a ' +
        '`name` or `param` construct using the same token name',
      sameParamTokenName,
    );
    // $FlowFixMe[prop-missing]
    sameParamTokenNameToRealFbtNode[sameParamTokenName] = realFbtNode;
  }
  return sameParamTokenNameToRealFbtNode;
}

module.exports = {
  convertToTokenName,
  convertIndexInSiblingsArrayToOuterTokenAlias,
  createInstanceFromFbtConstructCallsite,
  getChildNodeText,
  getChildNodeTextForDescription,
  getClosestElementOrImplicitParamNodeAncestor,
  buildFbtNodeMapForSameParam,
  getTextFromFbtNodeTree,
  getTokenAliasesFromFbtNodeTree,
  runOnNestedChildren,
  tokenNameToTextPattern,
  toPlainFbtNodeTree,
};
