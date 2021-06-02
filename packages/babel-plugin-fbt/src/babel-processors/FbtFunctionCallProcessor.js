/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+i18n_fbt_js
 * @flow
 */

/*eslint max-len: ["error", 100]*/

'use strict';

import type {AnyStringVariationArg} from '../fbt-nodes/FbtArguments';
import type {AnyFbtNode} from '../fbt-nodes/FbtNode';
import type {FbtCallSiteOptions, JSModuleNameType} from '../FbtConstants';
import type {TableJSFBTTree, TableJSFBTTreeLeaf} from '../index';
import type {ObjectWithJSFBT, PluginOptions} from '../index.js';
import type {NodePathOf} from '@babel/core';
import typeof BabelTypes from '@babel/types';

type NodePath = NodePathOf<BabelNodeCallExpression>;

export type FbtFunctionCallPhrase = {|
  ...FbtCallSiteOptions,
  ...ObjectWithJSFBT,
|};

export type SentinelPayload = {|
  ...ObjectWithJSFBT,
  project: string,
|};

export type MetaPhrase = {|
  compactStringVariations: CompactStringVariations,
  // FbtNode abstraction whose phrase's data comes from
  fbtNode: FbtElementNode | FbtImplicitParamNode,
  // Phrase data
  phrase: FbtFunctionCallPhrase,
  // Index of the outer-phrase (assuming that the current phrase is an inner-phrase)
  // If the current phrase is the top-level phrase, it won't be defined.
  parentIndex: ?number,
|};

type CompactStringVariations = {|
  // Compacted string variation argument list
  array: $ReadOnlyArray<AnyStringVariationArg>,
  // Mapping of the original item indexes so that:
  //   For the output array item at index `k`, the original SVArgument index is `indexMap[k]`
  indexMap: $ReadOnlyArray<number>,
|};

// In the final fbt runtime call, runtime arguments that create string variation
// will become identifiers(references to local variables) if there exist string variations
// AND inner strings.
type StringVariationRuntimeArgumentBabelNodes =
  | Array<BabelNodeIdentifier>
  | Array<BabelNodeCallExpression>;

const {StringVariationArgsMap} = require('../fbt-nodes/FbtArguments');
const FbtElementNode = require('../fbt-nodes/FbtElementNode');
const FbtParamNode = require('../fbt-nodes/FbtParamNode');
const {SENTINEL} = require('../FbtConstants');
const FbtNodeChecker = require('../FbtNodeChecker');
const FbtImplicitParamNode = require('../fbt-nodes/FbtImplicitParamNode');
const {
  convertToStringArrayNodeIfNeeded,
  createFbtRuntimeArgCallExpression,
  errorAt,
  varDump,
} = require('../FbtUtil');
const JSFbtBuilder = require('../JSFbtBuilder');
const addLeafToTree = require('../utils/addLeafToTree');
const {
  arrayExpression,
  assignmentExpression,
  callExpression,
  clone,
  cloneDeep,
  identifier,
  isBlockStatement,
  isProgram,
  jsxExpressionContainer,
  memberExpression,
  sequenceExpression,
  stringLiteral,
  variableDeclaration,
  variableDeclarator,
} = require('@babel/types');
const {Buffer} = require('buffer');
const invariant = require('invariant');
const nullthrows = require('nullthrows');

const emptyArgsCombinations: [[]] = [[]];
const STRING_VARIATION_RUNTIME_ARGUMENT_IDENTIFIER_PREFIX = 'fbt_sv_arg';

/**
 * This class provides utility methods to process the babel node of the standard fbt function call
 * (i.e. `fbt(...)`)
 */
class FbtFunctionCallProcessor {
  defaultFbtOptions: FbtCallSiteOptions;
  fileSource: string;
  moduleName: JSModuleNameType;
  node: $PropertyType<NodePath, 'node'>;
  nodeChecker: FbtNodeChecker;
  path: NodePath;
  pluginOptions: PluginOptions;
  t: BabelTypes;

  constructor({
    babelTypes,
    defaultFbtOptions,
    fileSource,
    nodeChecker,
    path,
    pluginOptions,
  }: {
    babelTypes: BabelTypes,
    defaultFbtOptions: FbtCallSiteOptions,
    fileSource: string,
    nodeChecker: FbtNodeChecker,
    path: NodePath,
    pluginOptions: PluginOptions,
  }): void {
    this.defaultFbtOptions = defaultFbtOptions;
    this.fileSource = fileSource;
    this.moduleName = nodeChecker.moduleName;
    this.node = path.node;
    this.nodeChecker = nodeChecker;
    this.path = path;
    this.pluginOptions = pluginOptions;
    this.t = babelTypes;
  }

  static create({
    babelTypes,
    defaultFbtOptions,
    fileSource,
    path,
    pluginOptions,
  }: {
    babelTypes: BabelTypes,
    defaultFbtOptions: FbtCallSiteOptions,
    fileSource: string,
    path: NodePath,
    pluginOptions: PluginOptions,
  }): ?FbtFunctionCallProcessor {
    const nodeChecker = FbtNodeChecker.forFbtFunctionCall(path.node);
    return nodeChecker != null
      ? new FbtFunctionCallProcessor({
          babelTypes,
          defaultFbtOptions,
          fileSource,
          nodeChecker,
          path,
          pluginOptions,
        })
      : null;
  }

  _assertJSModuleWasAlreadyRequired(): this {
    const {moduleName, path} = this;
    if (!this.nodeChecker.isJSModuleBound<typeof path.node>(path)) {
      throw errorAt(
        path.node,
        `${moduleName} is not bound. Did you forget to require('${moduleName}')?`,
      );
    }
    return this;
  }

  _assertHasEnoughArguments(): this {
    const {moduleName, node} = this;
    if (node.arguments.length < 2) {
      throw errorAt(
        node,
        `Expected ${moduleName} calls to have at least two arguments. ` +
          `Only ${node.arguments.length} was given.`,
      );
    }
    return this;
  }

  _createFbtRuntimeCallForMetaPhrase(
    metaPhrases: $ReadOnlyArray<MetaPhrase>,
    metaPhraseIndex: number,
    stringVariationRuntimeArgs: StringVariationRuntimeArgumentBabelNodes,
  ): BabelNodeCallExpression {
    const {phrase} = metaPhrases[metaPhraseIndex];
    const {pluginOptions} = this;
    // $FlowFixMe[speculation-ambiguous] we're deprecating the "type" property soon anyway
    const argsOutput = JSON.stringify(
      ({
        jsfbt: phrase.jsfbt,
        project: phrase.project,
      }: SentinelPayload),
    );
    const encodedOutput = pluginOptions.fbtBase64
      ? Buffer.from(argsOutput).toString('base64')
      : argsOutput;
    const fbtSentinel = pluginOptions.fbtSentinel || SENTINEL;
    const args = [stringLiteral(fbtSentinel + encodedOutput + fbtSentinel)];

    const fbtRuntimeArgs = this._createFbtRuntimeArgumentsForMetaPhrase(
      metaPhrases,
      metaPhraseIndex,
      stringVariationRuntimeArgs,
    );
    if (fbtRuntimeArgs.length > 0) {
      args.push(arrayExpression(fbtRuntimeArgs));
    }
    return callExpression(
      memberExpression(identifier(this.moduleName), identifier('_')),
      args,
    );
  }

  _createRootFbtRuntimeCall(
    metaPhrases: $ReadOnlyArray<MetaPhrase>,
  ): BabelNodeCallExpression | BabelNodeSequenceExpression {
    const stringVariationRuntimeArgs = this._createRuntimeArgsFromStringVariantNodes(
      metaPhrases[0],
    );
    if (!this._hasStringVariationAndContainsInnerString(metaPhrases)) {
      return this._createFbtRuntimeCallForMetaPhrase(
        metaPhrases,
        0,
        stringVariationRuntimeArgs,
      );
    }
    this._throwIfStringVariationArgsMayCauseSideEffects(metaPhrases);

    const stringVariationRuntimeArgIdentifiers = this._generateUniqueIdentifiersForRuntimeArgs(
      stringVariationRuntimeArgs.length,
    );
    const fbtRuntimeCall = this._createFbtRuntimeCallForMetaPhrase(
      metaPhrases,
      0,
      stringVariationRuntimeArgIdentifiers,
    );
    this._injectVariableDeclarationsForStringVariationArguments(
      stringVariationRuntimeArgIdentifiers,
    );
    return this._wrapFbtRuntimeCallInSequenceExpression(
      stringVariationRuntimeArgs,
      fbtRuntimeCall,
      stringVariationRuntimeArgIdentifiers,
    );
  }

  /**
   * String variation arguments are not allowed to contain anything that may
   * cause side-effects. Side-effects are mostly introduced by but not limited to
   * method calls and class instantiations. Please refer to the JSDoc of
   * FbtNode#throwIfAnyArgumentContainsFunctionCallOrClassInstantiation for
   * examples.
   */
  _throwIfStringVariationArgsMayCauseSideEffects(
    metaPhrases: $ReadOnlyArray<MetaPhrase>,
  ) {
    metaPhrases[0].compactStringVariations.array.map(svArg =>
      svArg.fbtNode.throwIfAnyArgumentContainsFunctionCallOrClassInstantiation(
        this.path.context.scope,
      ),
    );
  }

  _injectVariableDeclarationsForStringVariationArguments(
    identifiersForStringVariationRuntimeArgs: $ReadOnlyArray<BabelNodeIdentifier>,
  ): void {
    // Find the first ancestor block statement node or the program root node
    let curPath = this.path;
    while (!isBlockStatement(curPath.node) && !isProgram(curPath.node)) {
      curPath = nullthrows(
        curPath.parentPath,
        'curPath can not be null. Otherwise, it means we reached the root' +
          ' of Babel AST in the previous iteration and therefore we would have exited the loop.',
      );
    }
    const blockOrProgramPath = curPath;
    const blockOrProgramNode = blockOrProgramPath.node;
    invariant(
      isBlockStatement(blockOrProgramNode) || isProgram(blockOrProgramNode),
      "According to the above loop's condition, " +
        'blockOrProgramNode must be either a block statement or a program node ',
    );

    // Replace the blockStatement/program node with
    // a new blockStatement/program with injected declarations
    const declarations = variableDeclaration(
      'var',
      identifiersForStringVariationRuntimeArgs.map(identifier =>
        variableDeclarator(identifier),
      ),
    );
    const cloned = clone(blockOrProgramNode);
    cloned.body = [declarations, ...cloned.body];
    blockOrProgramPath.replaceWith(cloned);
  }

  /**
   * Pre-assign those arguments that create string variations to local variables,
   * and use references to these variables in fbt call. Note: Local variables
   * will be auto-declared in sequenceExpression.
   *
   * E.g.
   * Before:
   *   fbt._()
   *
   * After:
   *   (identifier_0 = runtimeArg1, identifier_1 = runtimeArg2, fbt._())
   */
  _wrapFbtRuntimeCallInSequenceExpression(
    runtimeArgs: $ReadOnlyArray<BabelNodeCallExpression>,
    fbtRuntimeCall: BabelNodeCallExpression,
    identifiersForStringVariationRuntimeArgs: $ReadOnlyArray<BabelNodeIdentifier>,
  ): BabelNodeSequenceExpression {
    invariant(
      runtimeArgs.length == identifiersForStringVariationRuntimeArgs.length,
      'Expect exactly one identifier for each string variation runtime argument. ' +
        'Instead we get %s identifiers and %s arguments.',
      identifiersForStringVariationRuntimeArgs.length,
      runtimeArgs.length,
    );
    const expressions = runtimeArgs
      .map((runtimeArg, i) =>
        assignmentExpression(
          '=',
          identifiersForStringVariationRuntimeArgs[i],
          runtimeArg,
        ),
      )
      .concat(fbtRuntimeCall);
    return sequenceExpression(expressions);
  }

  _hasStringVariationAndContainsInnerString(
    metaPhrases: $ReadOnlyArray<MetaPhrase>,
  ): boolean {
    const fbtElement = metaPhrases[0].fbtNode;
    invariant(
      fbtElement instanceof FbtElementNode,
      'Expected a FbtElementNode for top level string but received: %s',
      varDump(fbtElement),
    );
    const doesNotContainInnerString = fbtElement.children.every(child => {
      return !(child instanceof FbtImplicitParamNode);
    });
    if (doesNotContainInnerString) {
      return false;
    }

    return metaPhrases[0].compactStringVariations.array.length > 0;
  }

  _generateUniqueIdentifiersForRuntimeArgs(
    count: number,
  ): Array<BabelNodeIdentifier> {
    const identifiers = [];
    for (
      let identifierSuffix = 0, numIdentifierCreated = 0;
      numIdentifierCreated < count;
      identifierSuffix++
    ) {
      const name = `${STRING_VARIATION_RUNTIME_ARGUMENT_IDENTIFIER_PREFIX}_${identifierSuffix}`;
      if (this.path.context.scope.getBinding(name) == null) {
        identifiers.push(identifier(name));
        numIdentifierCreated++;
      }
    }
    return identifiers;
  }

  /**
   * Consolidate a list of string variation arguments under the following conditions:
   *
   * Enum variation arguments are consolidated to avoid creating duplicates of string variations
   * (from a candidate values POV)
   *
   * Other types of variation arguments are accepted as-is.
   */
  _compactStringVariationArgs(
    args: $ReadOnlyArray<AnyStringVariationArg>,
  ): CompactStringVariations {
    const indexMap = [];
    const array = args.filter((arg, i) => {
      if (arg.isCollapsible) {
        return false;
      }
      indexMap.push(i);
      return true;
    });

    return {
      array,
      indexMap,
    };
  }

  _getPhraseParentIndex(
    fbtNode: AnyFbtNode,
    list: $ReadOnlyArray<AnyFbtNode>,
  ): ?number {
    if (fbtNode.parent == null) {
      return null;
    }
    const parentIndex = list.indexOf(fbtNode.parent);
    invariant(
      parentIndex > -1,
      'Unable to find parent fbt node: node=%s',
      varDump(fbtNode),
    );
    return parentIndex;
  }

  /**
   * Generates a list of meta-phrases from a given FbtElement node
   */
  _metaPhrases(fbtElement: FbtElementNode): $ReadOnlyArray<MetaPhrase> {
    const stringVariationArgs = fbtElement.getArgsForStringVariationCalc();
    const jsfbtBuilder = new JSFbtBuilder(
      this.fileSource,
      stringVariationArgs,
      this.pluginOptions.reactNativeMode,
    );
    const argsCombinations = jsfbtBuilder.getStringVariationCombinations();
    const compactStringVariations = this._compactStringVariationArgs(
      argsCombinations[0] || [],
    );
    const jsfbtMetadata = jsfbtBuilder.buildMetadata(
      compactStringVariations.array,
    );
    const {author, project} = fbtElement.options;
    const doNotExtract =
      fbtElement.options.doNotExtract ?? this.defaultFbtOptions.doNotExtract;
    return [fbtElement, ...fbtElement.getImplicitParamNodes()].map(
      (fbtNode, _index, list) => {
        try {
          const phrase = {
            ...this.defaultFbtOptions,
            jsfbt: {
              // the order of JSFBT props matter for unit tests
              t: {},
              m: jsfbtMetadata,
            },
          };
          if (doNotExtract != null) {
            phrase.doNotExtract = doNotExtract;
          }
          if (author) {
            phrase.author = author;
          }
          if (project) {
            phrase.project = project;
          }

          (argsCombinations.length
            ? argsCombinations
            : emptyArgsCombinations
          ).forEach(argsCombination => {
            // collect text/description pairs
            const svArgsMap = new StringVariationArgsMap(argsCombination);
            const argValues = compactStringVariations.indexMap.map(
              originIndex => nullthrows(argsCombination[originIndex]?.value),
            );
            const leaf = ({
              desc: fbtNode.getDescription(svArgsMap),
              text: fbtNode.getText(svArgsMap),
            }: TableJSFBTTreeLeaf);

            const tokenAliases = fbtNode.getTokenAliases(svArgsMap);
            if (tokenAliases != null) {
              leaf.tokenAliases = tokenAliases;
            }

            if (
              this.pluginOptions.generateOuterTokenName &&
              !(fbtNode instanceof FbtElementNode)
            ) {
              leaf.outerTokenName = fbtNode.getTokenName(svArgsMap);
            }

            if (argValues.length) {
              addLeafToTree<TableJSFBTTreeLeaf, TableJSFBTTree>(
                phrase.jsfbt.t,
                argValues,
                leaf,
              );
            } else {
              // jsfbt only contains one leaf
              phrase.jsfbt.t = leaf;
            }
          });

          return {
            compactStringVariations,
            fbtNode,
            parentIndex: this._getPhraseParentIndex(fbtNode, list),
            phrase,
          };
        } catch (error) {
          throw errorAt(fbtNode.node, error);
        }
      },
    );
  }

  /**
   * Process current `fbt()` callsite (BabelNode) to generate:
   * - an `fbt._()` callsite or a sequencExpression that eventually returns an `fbt._()` callsite
   * - a list of meta-phrases describing the collected text strings from this fbt() callsite
   */
  convertToFbtRuntimeCall(): {
    // Client-side fbt._() call(or the sequencExpression that contains it)
    // usable in a web browser generated from the given fbt() callsite
    callNode: BabelNodeCallExpression | BabelNodeSequenceExpression,
    // List of phrases collected from the fbt() callsite
    metaPhrases: $ReadOnlyArray<MetaPhrase>,
  } {
    const fbtElement = this._convertToFbtNode();
    const metaPhrases = this._metaPhrases(fbtElement);
    const callNode = this._createRootFbtRuntimeCall(metaPhrases);
    return {
      callNode,
      metaPhrases,
    };
  }

  /**
   * Converts current fbt() BabelNode to an FbtNode equivalent
   */
  _convertToFbtNode(): FbtElementNode {
    this._assertJSModuleWasAlreadyRequired();
    this._assertHasEnoughArguments();

    const {moduleName, node} = this;
    const {arguments: fbtCallArgs} = node;
    const fbtContentsNode = convertToStringArrayNodeIfNeeded(
      moduleName,
      fbtCallArgs[0],
    );
    fbtCallArgs[0] = fbtContentsNode;

    const elementNode = FbtElementNode.fromBabelNode({moduleName, node});
    if (elementNode == null) {
      throw errorAt(
        node,
        `${moduleName}: unable to create FbtElementNode from given Babel node`,
      );
    }
    return elementNode;
  }

  _createFbtRuntimeArgumentsForMetaPhrase(
    metaPhrases: $ReadOnlyArray<MetaPhrase>,
    metaPhraseIndex: number,
    stringVariationRuntimeArgs: StringVariationRuntimeArgumentBabelNodes,
  ): Array<BabelNodeCallExpression | BabelNodeIdentifier> {
    const metaPhrase = metaPhrases[metaPhraseIndex];
    // Runtime arguments of a string fall into 3 categories:
    // 1. Each string variation argument must correspond to a runtime argument
    // 2. Non string variation arguments(i.e. those fbt.param() calls that do not
    // have gender or number option) should also be counted as runtime arguments.
    // 3. Each inner string of current string should be associated with a
    // runtime argument
    return [
      ...stringVariationRuntimeArgs,
      ...this._createRuntimeArgsFromNonStringVariantNodes(metaPhrase.fbtNode),
      ...this._createRuntimeArgsFromImplicitParamNodes(
        metaPhrases,
        metaPhraseIndex,
        stringVariationRuntimeArgs,
      ),
    ];
  }

  _createRuntimeArgsFromStringVariantNodes(
    metaPhrase: MetaPhrase,
  ): Array<BabelNodeCallExpression> {
    const fbtRuntimeArgs = [];
    const {compactStringVariations} = metaPhrase;
    for (const stringVariation of compactStringVariations.array) {
      const fbtRuntimeArg = stringVariation.fbtNode.getFbtRuntimeArg();
      if (fbtRuntimeArg) {
        fbtRuntimeArgs.push(fbtRuntimeArg);
      }
    }
    return fbtRuntimeArgs;
  }

  _createRuntimeArgsFromNonStringVariantNodes(
    fbtNode: FbtImplicitParamNode | FbtElementNode,
  ): Array<BabelNodeCallExpression> {
    const fbtRuntimeArgs = [];
    for (const child of fbtNode.children) {
      if (
        child instanceof FbtParamNode &&
        child.options.gender == null &&
        child.options.number == null
      ) {
        fbtRuntimeArgs.push(child.getFbtRuntimeArg());
      }
    }
    return fbtRuntimeArgs;
  }

  _createRuntimeArgsFromImplicitParamNodes(
    metaPhrases: $ReadOnlyArray<MetaPhrase>,
    metaPhraseIndex: number,
    runtimeArgsFromStringVariationNodes: StringVariationRuntimeArgumentBabelNodes,
  ): Array<BabelNodeCallExpression> {
    const fbtRuntimeArgs = [];
    for (const [
      innerMetaPhraseIndex,
      innerMetaPhrase,
    ] of metaPhrases.entries()) {
      if (innerMetaPhrase.parentIndex != metaPhraseIndex) {
        continue;
      }
      const innerMetaPhraseFbtNode = innerMetaPhrase.fbtNode;
      invariant(
        innerMetaPhraseFbtNode instanceof FbtImplicitParamNode,
        'Expected the inner meta phrase to be associated with a FbtImplicitParamNode instead of %s',
        varDump(innerMetaPhraseFbtNode),
      );
      const babelNode = cloneDeep(innerMetaPhraseFbtNode.node);
      babelNode.children = [
        jsxExpressionContainer(
          this._createFbtRuntimeCallForMetaPhrase(
            metaPhrases,
            innerMetaPhraseIndex,
            runtimeArgsFromStringVariationNodes,
          ),
        ),
      ];
      const fbtParamRuntimeArg = createFbtRuntimeArgCallExpression(
        innerMetaPhraseFbtNode,
        [stringLiteral(innerMetaPhraseFbtNode.getOuterTokenAlias()), babelNode],
      );
      fbtRuntimeArgs.push(fbtParamRuntimeArg);
    }
    return fbtRuntimeArgs;
  }
}

module.exports = FbtFunctionCallProcessor;
