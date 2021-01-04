/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/

'use strict';

/*::
import typeof BabelTypes from '@babel/types';
import type {
  BabelTransformPlugin,
} from '@babel/core';
import type {
  FbtCallSiteOptions,
} from './FbtConstants';
import type {
  ExtractTableTextItems,
  FbtFunctionCallPhrase,
} from './babel-processors/FbtFunctionCallProcessor';
import type {FbtRuntimeInput} from '../../../runtime/shared/FbtHooks';
import type {PatternString} from '../../../runtime/shared/FbtTable';

export type ExtraBabelNodeProps = {
  implicitDesc?: string,
  implicitFbt?: boolean,
  parentIndex?: number,
};
export type FbtBabelNodeCallExpression = BabelNodeCallExpression & ExtraBabelNodeProps;
export type FbtBabelNodeJSXElement = BabelNodeJSXElement & ExtraBabelNodeProps;
export type FbtBabelNodeShape = $Shape<ExtraBabelNodeProps>;
export type PluginOptions = {|
  auxiliaryTexts: boolean,
  collectFbt: boolean,
  extraOptions: {[optionName: string]: mixed},
  fbtBase64: boolean,
  // Path to a JS module that must export a function that is responsible for
  // loading an fbt enum (by file path) and return its object.
  // I.e. fbt enum loading function signature:
  // (enumFilePath) => typeof $PropertyType<PluginOptions, 'fbtEnumManifest'>
  fbtEnumLoader?: ?string,
  // Function that would return an fbt manifest object
  fbtEnumManifest?: ?{[enumModuleName: string]: {[enumKey: string]: string}},
  // Fbt enum file path
  fbtEnumPath?: ?string,
  // Object map of file paths keyed by fbt enum module names
  fbtEnumToPath?: ?{[enumName: string]: string},
  fbtSentinel?: string,
  filename: string,
  reactNativeMode: boolean,
|};
type TableJSFBT = {
  t: FbtRuntimeInput,
  m: {}
};
export type ObjectWithJSFBT = {|
  type: 'text',
  jsfbt: PatternString,
|} | {|
  type: 'table',
  jsfbt: TableJSFBT,
|};
export type Phrase = {|
  ...FbtCallSiteOptions,
  col_beg: number,
  col_end: number,
  desc: string,
  filepath: string,
  line_beg: number,
  line_end: number,
  project: string,
  texts?: ExtractTableTextItems,
  ...ObjectWithJSFBT,
|};
type ChildToParentMap = {[childIndex: number]: number};
*/

const FbtCommonFunctionCallProcessor = require('./babel-processors/FbtCommonFunctionCallProcessor');
const FbtFunctionCallProcessor = require('./babel-processors/FbtFunctionCallProcessor');
const JSXFbtProcessor = require('./babel-processors/JSXFbtProcessor');
const FbtCommon = require('./FbtCommon');
const {
  JSModuleName: {FBT},
  ValidFbtOptions,
} = require('./FbtConstants');
const FbtEnumRegistrar = require('./FbtEnumRegistrar');
const fbtHashKey = require('./fbtHashKey');
const FbtShiftEnums = require('./FbtShiftEnums');
const {
  checkOption,
  objMap,
} = require('./FbtUtil');
const {
  RequireCheck: {isRequireAlias},
} = require('fb-babel-plugin-utils');
const {parse: parseDocblock} = require('jest-docblock');

/**
 * Default options passed from a docblock.
 */
let defaultOptions /*: FbtCallSiteOptions */;

/**
 * An array containing all collected phrases.
 */
let phrases/*: Array<Phrase>*/;

/**
 * An array containing the child to parent relationships for implicit nodes.
 */
let childToParent/*: ChildToParentMap*/;

function BabelPluginFbt(babel /*: {
  types: BabelTypes,
}*/) /*: BabelTransformPlugin<ExtraBabelNodeProps>*/ {
  const t = babel.types;

  return {
    pre() {
      // TODO(T56277508) Type this.opts to match `PluginOptions`
      this.opts.fbtBase64 = this.opts.fbtBase64;

      FbtCommon.init(this.opts);
      FbtEnumRegistrar.setEnumManifest(getEnumManifest(this.opts));
      initExtraOptions(this);
      initDefaultOptions(this);
      phrases = [];
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
        path.replaceWith(root.convertToFbtFunctionCallNode(phrases.length));
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
        const {node} = path;
        const visitor = this;
        const fileSource = visitor.file.code;
        const pluginOptions = visitor.opts;

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

        const {
          callNode,
          phrase,
          texts,
        } = root.convertToFbtRuntimeCall();

        path.replaceWith(callNode);

        if (pluginOptions.collectFbt && !phrase.doNotExtract) {
          if (pluginOptions.auxiliaryTexts) {
            phrase.texts = texts;
          }

          addPhrase(node, phrase, visitor);

          if (node.parentIndex !== undefined) {
            addEnclosingString(phrases.length - 1, node.parentIndex);
          }
        }
      }, // CallExpression
    }, // visitor
  }; // babel plugin return
}

BabelPluginFbt.getExtractedStrings = () /*: Array<Phrase>*/ => phrases;

BabelPluginFbt.getChildToParentRelationships = () /*: ChildToParentMap*/ =>
  childToParent || {};

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

function addPhrase(node, phrase, state) {
  phrases.push({
    filepath: state.opts.filename,
    // $FlowFixMe `start` property might be null
    line_beg: node.loc.start.line,
    // $FlowFixMe `start` property might be null
    col_beg: node.loc.start.column,
    // $FlowFixMe `end` property might be null
    line_end: node.loc.end.line,
    // $FlowFixMe `end` property might be null
    col_end: node.loc.end.column,
    ...(phrase /*: FbtFunctionCallPhrase */),
  });
}

function addEnclosingString(childIdx, parentIdx) {
  childToParent[childIdx] = parentIdx;
}

function getUnknownCommonStringErrorMessage(moduleName, text) {
  return `Unknown string "${text}" for <${moduleName} common={true}>`;
}

function getEnumManifest(opts) {
  const {fbtEnumManifest, fbtEnumPath, fbtEnumToPath} = opts;
  if (fbtEnumManifest != null) {
    return fbtEnumManifest;
  } else if (fbtEnumPath != null) {
    // $FlowExpectedError node.js require() needs to be dynamic
    return require(fbtEnumPath);
  } else if (fbtEnumToPath != null) {
    const loadEnum = opts.fbtEnumLoader
      ? // $FlowExpectedError node.js require() needs to be dynamic
        require(opts.fbtEnumLoader)
      : require;
    return objMap(opts.fbtEnumToPath, loadEnum);
  }
  return null;
}

BabelPluginFbt.fbtHashKey = fbtHashKey;
BabelPluginFbt.FbtShiftEnums = FbtShiftEnums;

module.exports = BabelPluginFbt;
