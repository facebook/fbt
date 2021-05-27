/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails oncall+i18n_fbt_js
 * @flow
 */

/*eslint max-len: ["error", 100]*/

'use strict';

import type {
  FbtTableKey,
  PatternHash,
  PatternString,
} from '../../../runtime/shared/FbtTable';
import type {MetaPhrase} from './babel-processors/FbtFunctionCallProcessor';
import type {AnyFbtNode, PlainFbtNode} from './fbt-nodes/FbtNode';
import type {FbtCommonMap} from './FbtCommon';
import type {FbtCallSiteOptions} from './FbtConstants';
import type {EnumManifest, EnumModule} from './FbtEnumRegistrar';
import typeof {FbtVariationType} from './translate/IntlVariations';
import type {BabelTransformPlugin} from '@babel/core';
import typeof BabelTypes from '@babel/types';

export type ExtraOptions = {[optionName: string]: boolean};
type FbtEnumLoader = (enumFilePath: string) => EnumModule;
export type PluginOptions = {|
  collectFbt?: boolean,
  extraOptions: ExtraOptions,
  fbtBase64?: boolean,
  fbtCommon?: FbtCommonMap,
  fbtCommonPath?: ?string,
  // Path to a JS module that must export a function that is responsible for
  // loading an fbt enum (by file path) and return its object.
  // I.e. fbt enum loading function signature: `FbtEnumLoader`
  fbtEnumLoader?: ?string,
  // Function that would return an fbt manifest object
  fbtEnumManifest?: ?EnumManifest,
  // Fbt enum file path
  fbtEnumPath?: ?string,
  // Object map of file paths keyed by fbt enum module names
  fbtEnumToPath?: ?{[enumName: string]: string},
  fbtSentinel?: ?string,
  filename?: ?string,
  // If true, generate the `outerTokenName` property on the JSFbt tree leaves.
  generateOuterTokenName?: boolean,
  reactNativeMode?: boolean,
|};

type TokenAlias = string;

export type TokenAliases = {|
  [clearTokenName: string]: TokenAlias,
|};

/**
 * This is the main payload collected from the fbt callsite.
 *
 * - For simple fbt calls without interpolation (fbt.param) or multiplexing (fbt.plural,
 *   fbt.enum, viewer context variation, etc), this is a simple TableJSFBTTreeLeaf object.
 * - Otherwise this is a tree structure whose keys correspond to the associated string variation
 *   parameters passed to the various fbt constructs (param, plural, pronoun) of this callsite;
 *   and tree leaves are TableJSFBTTreeLeaf objects.
 */
export type TableJSFBTTree =
  | TableJSFBTTreeLeaf
  | {|
      [key: FbtTableKey]: TableJSFBTTree,
    |};

export type TableJSFBTTreeLeaf = {|
  desc: string,
  hash?: PatternHash,
  text: PatternString,
  tokenAliases?: TokenAliases,

  // The token name (at the outer string level) referring to this inner string
  //
  // E.g. For the fbt string `<fbt>Hello <i>World</i></fbt>`,
  // the outer string is "Hello {=World}", and the inner string is: "World".
  // So the outer token name of the inner string will be "=World"
  outerTokenName?: string,
|};

// Describes the usage of one level of the JSFBT table tree
export type JSFBTMetaEntry = $ReadOnly<
  | {|
      type: $PropertyType<FbtVariationType, 'NUMBER'>,
      singular?: true, // TODO(T29504932) deprecate this
      token?: string, // token name
    |}
  | {|
      type: $PropertyType<FbtVariationType, 'GENDER'>,
      token: string, // token name
    |}
  | {|
      type: $PropertyType<FbtVariationType, 'PRONOUN'>,
    |}
  | {|
      // for enums
      range: $ReadOnlyArray<string>,
    |},
>;

export type TableJSFBT = $ReadOnly<{|
  t: $ReadOnly<TableJSFBTTree>,
  m: $ReadOnlyArray<?JSFBTMetaEntry>,
|}>;

export type ObjectWithJSFBT = {|
  jsfbt: TableJSFBT,
|};

export type Phrase = {|
  ...FbtCallSiteOptions,
  col_beg: number,
  col_end: number,
  filepath: ?string,
  line_beg: number,
  line_end: number,
  project: string,
  ...ObjectWithJSFBT,
|};
type ChildToParentMap = {[childIndex: number]: number};

export type BabelPluginFbt = {
  ({types: BabelTypes, ...}): BabelTransformPlugin,
  getExtractedStrings: () => Array<Phrase>,
  getChildToParentRelationships: () => ChildToParentMap,
  fbtHashKey: typeof fbtHashKey,
};

const FbtCommonFunctionCallProcessor = require('./babel-processors/FbtCommonFunctionCallProcessor');
const FbtFunctionCallProcessor = require('./babel-processors/FbtFunctionCallProcessor');
const JSXFbtProcessor = require('./babel-processors/JSXFbtProcessor');
const {toPlainFbtNodeTree} = require('./fbt-nodes/FbtNodeUtil');
const FbtCommon = require('./FbtCommon');
const {
  JSModuleName: {FBT},
  ValidFbtOptions,
} = require('./FbtConstants');
const FbtEnumRegistrar = require('./FbtEnumRegistrar');
const fbtHashKey = require('./fbtHashKey');
const FbtShiftEnums = require('./FbtShiftEnums');
const FbtUtil = require('./FbtUtil');
const {checkOption, objMap} = FbtUtil;
const {
  RequireCheck: {isRequireAlias},
} = require('fb-babel-plugin-utils');
const {parse: parseDocblock} = require('jest-docblock');

/**
 * Default options passed from a docblock.
 */
let defaultOptions: FbtCallSiteOptions;

/**
 * An array containing all collected phrases.
 */
let allMetaPhrases: Array<{|...MetaPhrase, phrase: Phrase|}>;

/**
 * An array containing the child to parent relationships for implicit nodes.
 */
let childToParent: ChildToParentMap;

function FbtTransform(babel: {types: BabelTypes}): BabelTransformPlugin {
  const t = babel.types;

  return {
    pre() {
      const pluginOptions: PluginOptions = this.opts;
      pluginOptions.fbtBase64 = pluginOptions.fbtBase64;

      FbtCommon.init(pluginOptions);
      FbtEnumRegistrar.setEnumManifest(getEnumManifest(pluginOptions));
      initExtraOptions(this);
      initDefaultOptions(this);
      allMetaPhrases = [];
      childToParent = {};
    },

    name: FBT,
    visitor: {
      /**
       * Transform jsx-style <fbt> to fbt() calls.
       */
      JSXElement(path) {
        const root = JSXFbtProcessor.create({
          babelTypes: t,
          path,
        });

        if (!root) {
          return;
        }
        root.convertToFbtFunctionCallNode(allMetaPhrases.length);
      },

      /**
       * Register enum imports
       */
      ImportDeclaration(path) {
        FbtEnumRegistrar.registerImportIfApplicable(path);
      },

      /**
       * Transform fbt("text", "desc", {project: "project"}) to semantically:
       *
       * fbt._(
       *   fbtSentinel +
       *   JSON.stringify({
       *     type: "text",
       *     texts: ["text"],
       *     desc: "desc",
       *     project: "project",
       *   }) +
       *   fbtSentinel
       * );
       */
      CallExpression(path) {
        const visitor = this;
        const fileSource = visitor.file.code;
        const pluginOptions: PluginOptions = visitor.opts;

        let root = FbtCommonFunctionCallProcessor.create({
          babelTypes: t,
          path,
        });

        if (root) {
          path.replaceWith(root.convertToNormalCall());
          return;
        }

        if (isRequireAlias(path.parentPath)) {
          FbtEnumRegistrar.registerRequireIfApplicable(path);
          return;
        }

        root = FbtFunctionCallProcessor.create({
          babelTypes: t,
          defaultFbtOptions: defaultOptions,
          fileSource,
          path,
          pluginOptions,
        });

        if (!root) {
          return;
        }

        // TODO(T40113359): remove this once we're done implementing proper conversion to fbt nodes
        // root.convertToFbtNode();

        const {callNode, metaPhrases} = root.convertToFbtRuntimeCall();
        path.replaceWith(callNode);

        if (pluginOptions.collectFbt) {
          const initialPhraseCount = allMetaPhrases.length;
          metaPhrases.forEach((metaPhrase, index) => {
            if (metaPhrase.phrase.doNotExtract) {
              return;
            }
            addMetaPhrase(metaPhrase, pluginOptions);

            if (metaPhrase.parentIndex != null) {
              addEnclosingString(
                index + initialPhraseCount,
                metaPhrase.parentIndex + initialPhraseCount,
              );
            }
          });
        }
      }, // CallExpression
    }, // visitor
  }; // babel plugin return
}

FbtTransform.getExtractedStrings = (): Array<Phrase> =>
  allMetaPhrases.map(metaPhrase => metaPhrase.phrase);

FbtTransform.getChildToParentRelationships = (): ChildToParentMap =>
  childToParent || {};

FbtTransform.getFbtElementNodes = (): Array<PlainFbtNode> => {
  const FbtElementNode = require('./fbt-nodes/FbtElementNode');
  const phraseToIndexMap = new Map<AnyFbtNode, number>(
    allMetaPhrases.map((metaPhrase, index) => [metaPhrase.fbtNode, index]),
  );

  return allMetaPhrases
    .map(({fbtNode}) =>
      fbtNode instanceof FbtElementNode
        ? toPlainFbtNodeTree(fbtNode, phraseToIndexMap)
        : null,
    )
    .filter(Boolean);
};

function initExtraOptions(state) {
  Object.assign(ValidFbtOptions, state.opts.extraOptions || {});
}

function initDefaultOptions(state) {
  defaultOptions = {};
  const comment = state.file.ast.comments[0];
  const docblock = (comment && comment.value) || '';
  const fbtDocblockOptions = parseDocblock(docblock).fbt;
  if (fbtDocblockOptions) {
    defaultOptions = JSON.parse(fbtDocblockOptions);
    Object.keys(defaultOptions).forEach(o => checkOption(o, ValidFbtOptions));
  }
  if (!defaultOptions.project) {
    defaultOptions.project = '';
  }
}

function addMetaPhrase(metaPhrase, pluginOptions) {
  const {fbtNode} = metaPhrase;
  allMetaPhrases.push({
    ...metaPhrase,
    phrase: {
      filepath: pluginOptions.filename,
      // $FlowFixMe `start` property might be null
      line_beg: fbtNode.node.loc.start.line,
      // $FlowFixMe `start` property might be null
      col_beg: fbtNode.node.loc.start.column,
      // $FlowFixMe `end` property might be null
      line_end: fbtNode.node.loc.end.line,
      // $FlowFixMe `end` property might be null
      col_end: fbtNode.node.loc.end.column,
      ...metaPhrase.phrase,
    },
  });
}

function addEnclosingString(childIdx, parentIdx) {
  childToParent[childIdx] = parentIdx;
}

function getEnumManifest(opts): ?EnumManifest {
  const {fbtEnumManifest, fbtEnumPath, fbtEnumToPath} = opts;
  if (fbtEnumManifest != null) {
    return fbtEnumManifest;
  } else if (fbtEnumPath != null) {
    // $FlowExpectedError node.js require() needs to be dynamic
    return require(fbtEnumPath);
  } else if (fbtEnumToPath != null) {
    const loadEnum: FbtEnumLoader = opts.fbtEnumLoader
      ? // $FlowExpectedError node.js require() needs to be dynamic
        require(opts.fbtEnumLoader)
      : require;
    return objMap(fbtEnumToPath, loadEnum);
  }
  return null;
}

FbtTransform.fbtHashKey = fbtHashKey;
FbtTransform.FbtShiftEnums = FbtShiftEnums;
FbtTransform.FbtUtil = FbtUtil;

module.exports = FbtTransform;
