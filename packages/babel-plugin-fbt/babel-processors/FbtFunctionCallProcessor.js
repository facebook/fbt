/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @flow
 */
/*eslint max-len: ["error", 100]*/

'use strict';

/*::
import type {
  FbtCallSiteOptions,
  FbtOptionValue,
  JSModuleNameType,
  ValidPronounUsagesKey,
} from '../FbtConstants';
import type {
  ParamSet,
} from '../FbtUtil';
import type {
  FbtBabelNodeCallExpression,
  FbtBabelNodeJSXElement,
  FbtBabelNodeShape,
  ObjectWithJSFBT,
  PluginOptions,
} from '../index.js';
import type {NodePathOf} from '@babel/core';
import typeof BabelTypes from '@babel/types';

type NodePath = NodePathOf<FbtBabelNodeCallExpression>;
export type ExtractTableTextItems = Array<
  | ?string
  | boolean
  | BabelNodeExpression
  | BabelNodeSpreadElement
  | BabelNodeJSXNamespacedName
  | {|type: 'subject'|}
  | {|
      type: 'number',
      token: string,
    |}
  | {|
      type: 'gender',
      token: string,
    |}
  | {|
      type: 'enum',
      range: {[name: string]: BabelNodeStringLiteral},
      value: string,
    |}
  | {|
      type: 'plural',
      count: ?FbtOptionValue,
      showCount: 'yes' | 'no' | 'ifMany',
      name: string,
      singular: string,
      many: string,
    |}
  | {|
      type: 'pronoun',
      capitalize: boolean,
      gender: string,
      human: boolean,
      usage: ValidPronounUsagesKey,
    |},
>;

export type FbtFunctionCallPhrase = {|
  ...FbtCallSiteOptions,
  desc: string,
  texts?: ExtractTableTextItems,
  ...ObjectWithJSFBT,
|};
*/

const {
  FbtBooleanOptions,
  FbtType,
  PLURAL_PARAM_TOKEN,
  SENTINEL,
  ValidFbtOptions,
  ValidPluralOptions,
  ValidPronounOptions,
} = require('../FbtConstants');
const FbtMethodCallVisitors = require('../FbtMethodCallVisitors');
const FbtNodeChecker = require('../FbtNodeChecker');
const {
  collectOptions,
  errorAt,
  expandStringArray,
  expandStringConcat,
  extractEnumRange,
  getOptionBooleanValue,
  getRawSource,
  normalizeSpaces,
} = require('../FbtUtil');
const JSFbtBuilder = require('../JSFbtBuilder');
const {
  arrayExpression,
  isCallExpression,
  isObjectExpression,
  isObjectProperty,
  isStringLiteral,
  isTemplateLiteral,
} = require('@babel/types');
const nullthrows = require('nullthrows');

/**
* This class provides utility methods to process the babel node of the standard fbt function call
* (i.e. `fbt(...)`)
*/
class FbtFunctionCallProcessor {
  /*:: defaultFbtOptions: FbtCallSiteOptions; */
  /*:: fileSource: string; */
  /*:: moduleName: JSModuleNameType; */
  /*:: node: $PropertyType<NodePath, 'node'>; */
  /*:: nodeChecker: FbtNodeChecker; */
  /*:: path: NodePath; */
  /*:: pluginOptions: PluginOptions; */
  /*:: t: BabelTypes; */

  constructor({
    babelTypes,
    defaultFbtOptions,
    fileSource,
    nodeChecker,
    path,
    pluginOptions,
  } /*: {
    babelTypes: BabelTypes,
    defaultFbtOptions: FbtCallSiteOptions,
    fileSource: string,
    nodeChecker: FbtNodeChecker,
    path: NodePath,
    pluginOptions: PluginOptions,
  }*/) /*: void */ {
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
  } /*: {
    babelTypes: BabelTypes,
    defaultFbtOptions: FbtCallSiteOptions,
    fileSource: string,
    path: NodePath,
    pluginOptions: PluginOptions,
  } */) /*: ?FbtFunctionCallProcessor */ {
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

  _assertJSModuleWasAlreadyRequired() /*: this */ {
    const {moduleName, path} = this;
    if (!this.nodeChecker.isJSModuleBound<typeof path.node>(path)) {
      throw errorAt(
        path.node,
        `${moduleName} is not bound. Did you forget to require('${moduleName}')?`,
      );
    }
    return this;
  }

  _assertHasEnoughArguments() /*: this */ {
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

  _getOptionsNode() {
    const optionsNode = this.node.arguments[2];
    if (optionsNode == null) {
      return null;
    }
    if (!isObjectExpression(optionsNode)) {
      throw errorAt(
        optionsNode,
        `${this.moduleName}(...) expects options as an ObjectExpression as its 3rd argument`,
      );
    }
    return optionsNode;
  }

  _getOptions() /*: FbtCallSiteOptions */ {
    const optionsNode = this._getOptionsNode();
    const options = collectOptions(
      this.moduleName,
      optionsNode,
      ValidFbtOptions,
    );
    if (optionsNode != null) {
      Object.keys(FbtBooleanOptions).forEach(key => {
        if (options.hasOwnProperty(key)) {
          options[key] = getOptionBooleanValue(options, key, optionsNode);
        }
      });
    }
    return options;
  }

  // Returns params and enums info in the order in which they appear.
  _collectFbtCalls(options /*: $Shape<FbtCallSiteOptions> */) /*: {|
    hasTable: boolean,
    paramSet: ParamSet,
    runtimeArgs: $ReadOnlyArray<BabelNodeCallExpression>,
    fileSource: string,
    usedEnums: {[enumExpr: string]: ?boolean},
    variations: {[paramName: string]:
      {|
          type: 'number',
          token: string,
        |}
      | {|
          type: 'gender',
          token: string,
        |}
    },
  |} */ {
    const {
      fileSource,
      moduleName,
      path,
      t,
    } = this;
    const runtimeArgs = [];
    const variations = {};
    const methodsState = {
      paramSet: {},
      runtimeArgs,
      variations,
      hasTable: false, // can be mutated during `FbtMethodCallVisitors`.
      fileSource,
      usedEnums: {},
    };
    if (options.subject) {
      methodsState.hasTable = true;
    }

    path.traverse(FbtMethodCallVisitors.call(moduleName), methodsState);
    if (options.subject) {
      runtimeArgs.unshift(
        t.callExpression(
          t.memberExpression(
            t.identifier(moduleName),
            t.identifier('_subject'),
            false,
          ),
          [
            // $FlowFixMe Output types of _getOptionAST() are incompatible with t.callExpression()
            this._getOptionAST(this._getOptionsNode(), 'subject')
          ],
        ),
      );
    }
    return methodsState;
  }

  // Returns the AST node associated with the key provided, or null if it doesn't exist.
  _getOptionAST(options, name) {
    const props = (options && options.properties) || [];
    for (var ii = 0; ii < props.length; ii++) {
      const option = props[ii];
      if (!isObjectProperty(option)) {
        throw errorAt(option, `options object must contain plain object properties. ` +
          `No method defintions or spread operators.`);
      }
      const curName = option.key.name || option.key.value;
      if (name === curName) {
        return option.value.expression || option.value;
      }
    }
    return null;
  }

  _isTableNeeded(methodsState) /*: boolean */ {
    return Object.keys(methodsState.variations).length > 0 || methodsState.hasTable;
  }

  _getTexts(variations, options, isTable /*: boolean */) {
    const {moduleName, node: {arguments: [textNode]}} = this;
    const arrayTextNode = this._convertToStringArrayNodeIfNeeded(textNode);
    let texts;

    if (isTable) {
      texts = this._normalizeTableTexts(
        this._extractTableTextsFromStringArray(
          arrayTextNode,
          variations,
        ),
      );
    } else {
      const unnormalizedText = expandStringArray(moduleName, arrayTextNode).value;
      texts = [
        normalizeSpaces(
          unnormalizedText,
          options,
        ).trim(),
      ];
    }
    if (options.subject) {
      texts.unshift({
        type: 'subject',
      });
    }
    return texts;
  }

  _convertToStringArrayNodeIfNeeded(textNode) /*: BabelNodeArrayExpression */ {
    switch (textNode.type) {
      case 'ArrayExpression':
        return textNode;
      case 'BinaryExpression': {
        const operands = this._getBinaryExpressionOperands(textNode);
        return arrayExpression(operands);
      }
      case 'CallExpression':
      case 'StringLiteral':
      case 'TemplateLiteral':
        return arrayExpression([textNode]);
      default:
        throw errorAt(
          textNode,
          `Unexpected node type: ${textNode.type}. ` +
          `${this.moduleName}()'s first argument should be a string literal, ` +
          `a construct like ${this.moduleName}.param() or an array of those.`,
        );
    }
  }

  _getBinaryExpressionOperands(node /*: BabelNodeExpression */) {
    switch (node.type) {
      case 'BinaryExpression':
        if (node.operator !== '+') {
          throw errorAt(node, 'Expected to see a string concatenation');
        }
        return [
          ...this._getBinaryExpressionOperands(node.left),
          ...this._getBinaryExpressionOperands(node.right),
        ];
      case 'CallExpression':
      case 'StringLiteral':
      case 'TemplateLiteral':
        return [node];
      default:
        throw errorAt(
          node,
          `Unexpected node type: ${node.type}. ` +
          `The ${this.moduleName}() string concatenation pattern only supports ` +
          ` string literals or constructs like ${this.moduleName}.param().`,
        );
    }
  }

  /**
   * Extracts texts that contains variations or enums, concatenating
   * literal parts.
   * Example:
   *
   * [
   *   'Hello, ', fbt.param('user', user, {gender: 'male'}), '! ',
   *   'Your score is ', fbt.param('score', score), '!',
   * ]
   * =>
   *   ["Hello, ", {type: 'gender', token: 'user'}, "! Your score is {score}!"]
   */
  _extractTableTextsFromStringArray(
    node /*: BabelNodeArrayExpression */,
    variations,
  ) /*: ExtractTableTextItems */ {
    return nullthrows(node.elements).reduce((results, element) => {
      results.push(...this._extractTableTextsFromStringArrayItem(
        nullthrows(element),
        variations,
      ));
      return results;
    }, []);
  }

  /**
   * Extracts texts from each fbt text array item:
   *
   *   "Hello, " + fbt.param('user', user, {gender: 'male'}) + "! " +
   *   "Your score is " + fbt.param('score', score) + "!"
   * =>
   *   ["Hello, ", {type: 'gender', token: 'user'}, "! Your score is {score}!"]
   */
  _extractTableTextsFromStringArrayItem(
    node,
    variations,
    texts /*: ExtractTableTextItems */ = [], // For recursive calls only
  ) /*: ExtractTableTextItems */ {
    const {fileSource, moduleName, t} = this;
    if (isTemplateLiteral(node)) {
      let index = 0;
      for (const elem of node.quasis) {
        if (elem.value.cooked) {
          this._extractTableTextsFromStringArrayItem(
            t.stringLiteral(elem.value.cooked),
            variations,
            texts,
          );
        }
        if (index < node.expressions.length) {
          const expr = node.expressions[index++];
          this._extractTableTextsFromStringArrayItem(
            expr,
            variations,
            texts,
          );
        }
      }
    } else if (isStringLiteral(node)) {
      // If we already collected a literal part previously, and
      // current part is a literal as well, just concatenate them.
      const previousText = texts[texts.length - 1];
      if (typeof previousText === 'string') {
        texts[texts.length - 1] = normalizeSpaces(previousText + node.value);
      } else {
        texts.push(node.value);
      }
    } else if (isCallExpression(node)) {
      if (node.callee.type !== 'MemberExpression') {
        throw errorAt(
          node.callee,
          `Expected a MemberExpression but got "${node.callee.type}" instead`,
        );
      }
      const calledProperty = node.callee.property;
      if (calledProperty.type !== 'Identifier' && calledProperty.type !== 'StringLiteral') {
        throw errorAt(
          node.callee,
          `Expected property to be an Identifier or a StringLiteral got "${
            calledProperty.type
          }" instead`,
        );
      }

      const [arg0, arg1, arg2] = node.arguments;
      switch (calledProperty.name || calledProperty.value) {
        case 'param':
          texts.push(variations[
            // $FlowFixMe `value` property is not always present
            arg0.value
          ]);
          break;
        case 'enum':
          if (arg1.type !== 'ObjectExpression') {
            throw errorAt(
              arg1,
              `Expected an ObjectExpression but got "${arg1.type}" instead`,
            );
          }
          texts.push({
            type: 'enum',
            range: extractEnumRange(arg1),
            value: getRawSource(fileSource, arg0),
          });
          break;
        case 'plural': {
          if (arg0.type !== 'StringLiteral') {
            throw errorAt(
              arg0,
              `Expected a StringLiteral but got "${arg0.type}" instead`,
            );
          }
          const singular = arg0.value;
          const opts = collectOptions(
            moduleName,
            // $FlowFixMe This argument may not be a BabelNodeObjectExpression
            arg2,
            ValidPluralOptions,
          );
          const defaultToken =
            opts.showCount && opts.showCount !== 'no'
              ? PLURAL_PARAM_TOKEN
              : null;
          if (opts.showCount === 'ifMany' && !opts.many) {
            throw errorAt(
              node,
              "The 'many' attribute must be set explicitly if showing count only " +
                "on 'ifMany', since the singular form presumably starts with an article",
            );
          }
          const data = {
            ...opts,
            type: 'plural',
            // Set default value if `opts[optionName]` isn't defined
            showCount: 'showCount' in opts ? opts.showCount : 'no',
            name: 'name' in opts ? opts.name : defaultToken,
            singular,
            count: getRawSource(fileSource, arg1),
            many: 'many' in opts ? opts.many : singular + 's',
          };

          if (data.showCount !== 'no') {
            if (data.showCount === 'yes') {
              data.singular = '1 ' + data.singular;
            }
            if (typeof data.name !== 'string') {
              throw errorAt(
                arg2,
                `Expected ${moduleName}.plural name property to be a string instead of ` +
                `${typeof data.name}`,
              );
            }
            if (typeof data.many !== 'string') {
              throw errorAt(
                arg2,
                `Expected ${moduleName}.plural many property to be a string instead of ` +
                `${typeof data.many}`,
              );
            }
            data.many = '{' + data.name + '} ' + data.many;
          }
          // $FlowFixMe An object literal isn't compatible with BabelNodeExpression
          texts.push(data);
          break;
        }
        case 'pronoun': {
          // Usage: fbt.pronoun(usage, gender [, options])
          const optionsNode = arg2;
          const options = collectOptions(
            moduleName,
            // $FlowFixMe This argument may not be a BabelNodeObjectExpression
            arg2,
            ValidPronounOptions,
          );
          for (const key of Object.keys(options)) {
            options[key] = getOptionBooleanValue(options, key, optionsNode);
          }
          const pronounData = {
            ...options,
            type: 'pronoun',
            // $FlowFixMe `value` property might be missing
            usage: arg0.value,
            gender: getRawSource(fileSource, arg1),
          };
          // $FlowFixMe An object literal isn't compatible with BabelNodeExpression
          texts.push(pronounData);
          break;
        }
        case 'name':
          texts.push(variations[
            // $FlowFixMe `value` property is not always present
            arg0.value
          ]);
          break;
      }
    } else {
      throw errorAt(
        node,
        `Unexpected node type: ${node.type}. ` +
        `${this.moduleName}() text arguments should be a string literal, ` +
        `a construct like ${this.moduleName}.param() or an array of those.`,
      );
    }

    return texts;
  }

  /**
   * Normalizes first and last elements in the
   * table texts by triming them left and right accordingly.
   * [" Hello, ", {enum}, " world! "] -> ["Hello, ", {enum}, " world!"]
   */
  _normalizeTableTexts(texts) {
    const firstText = texts[0];
    if (firstText && typeof firstText === 'string') {
      texts[0] = firstText.trimLeft();
    }
    const lastText = texts[texts.length - 1];
    if (lastText && typeof lastText === 'string') {
      texts[texts.length - 1] = lastText.trimRight();
    }
    return texts;
  }

  _getDescription(options) {
    return normalizeSpaces(
      expandStringConcat(
        this.moduleName,
        this.node.arguments[1]
      ).value,
      options,
    ).trim();
  }

  _getPhrase(texts, desc, options, isTable) {
    const phraseType = isTable ? FbtType.TABLE : FbtType.TEXT;
    const jsfbt = JSFbtBuilder.build(
      phraseType,
      texts,
      this.pluginOptions.reactNativeMode,
    );
    return {
      desc,
      // Merge with fbt callsite options
      ...this.defaultFbtOptions,
      ...options,
      ...(isTable // Need to set type explicitly for Flow checks
        ? {type: FbtType.TABLE, jsfbt}
        : {type: FbtType.TEXT, jsfbt}
      )
    };
  }

  _createFbtRuntimeCall(phrase, runtimeArgs) {
    const {pluginOptions, t} = this;
    const argsOutput = JSON.stringify({
      type: phrase.type,
      jsfbt: phrase.jsfbt,
      desc: phrase.desc,
      project: phrase.project,
    });
    const encodedOutput = pluginOptions.fbtBase64
      ? Buffer.from(argsOutput).toString('base64')
      : argsOutput;
    const fbtSentinel = pluginOptions.fbtSentinel || SENTINEL;
    const args = [
      t.stringLiteral(fbtSentinel + encodedOutput + fbtSentinel),
    ];

    if (runtimeArgs.length > 0) {
      // See https://github.com/babel/babel/issues/10932
      // $FlowFixMe t.arrayExpression's argument type needs to use $ReadOnlyArray instead of Array
      args.push(t.arrayExpression(runtimeArgs));
    }
    return t.callExpression(
      t.memberExpression(t.identifier(this.moduleName), t.identifier('_')),
      args,
    );
  }

  convertToFbtRuntimeCall() /*: {
    callNode: BabelNodeCallExpression,
    phrase: FbtFunctionCallPhrase,
    texts: ExtractTableTextItems,
  } */ {
    this._assertJSModuleWasAlreadyRequired();
    this._assertHasEnoughArguments();
    const options = this._getOptions();

    const methodsState = this._collectFbtCalls(options);
    const {runtimeArgs, variations} = methodsState;
    const isTable = this._isTableNeeded(methodsState);
    const texts = this._getTexts(variations, options, isTable);
    const desc = this._getDescription(options);
    const phrase = this._getPhrase(texts, desc, options, isTable);
    const callNode = this._createFbtRuntimeCall(phrase, runtimeArgs);

    return {
      callNode,
      phrase,
      texts,
    };
  }
}

module.exports = FbtFunctionCallProcessor;
