/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p babel_plugin_fbt --remote localhost:~/www
 *
 * @emails oncall+internationalization
 * @format
 */

'use strict';

/* eslint consistent-return: 0 */
/* eslint max-len: ["warn", 120] */

// fb-www/comma-dangle checks that various multi-line "list" constructs have trailing commas. Unfortunately, the in-use
// version of Node breaks when such syntax is used in arguments lists for function invocations, the rule implementation
// does not provide a way to override the check for particular grammar elements (like current ESLint's built-in rule),
// and there are quite a few instances in this file where the rule applies. Rather than disabling on a one-by-one basis,
// throw out the baby with the bath water and disable the whole shebang.
/* eslint fb-www/comma-dangle: "off" */

const docblock = require('../util/docblock');
const {isRequireAlias} = require('../util/require-check');
const autoWrap = require('./fbt-auto-wrap');
const fbtMethodCallVisitors = require('./fbt-method-call-visitors');
const namespacedElementsArgsHandler = require('./fbt-namespaced-args-handler');
const FbtCommonConstants = require('./FbtCommonConstants');
const {
  FbtBooleanOptions,
  FbtRequiredAttributes,
  FbtType,
  JSModuleName: {FBS, FBT},
  PLURAL_PARAM_TOKEN,
  ValidFbtOptions,
  ValidPluralOptions,
  ValidPronounOptions,
} = require('./FbtConstants');
const FbtNodeChecker = require('./FbtNodeChecker');
const {
  checkOption,
  collectOptions,
  expandStringConcat,
  extractEnumRange,
  filterEmptyNodes,
  getAttributeByName,
  getAttributeByNameOrThrow,
  getOptionBooleanValue,
  getOptionsFromAttributes,
  getRawSource,
  normalizeSpaces,
  throwAt,
  validateNamespacedFbtElement,
} = require('./FbtUtil');
const JSFbtBuilder = require('./js-fbt-builder');
const fbtChecker = FbtNodeChecker.forModule(FBT);
const fbsChecker = FbtNodeChecker.forModule(FBS);

/**
 * Default options passed from a docblock.
 */
let defaultOptions;

/**
 * An array containing all collected phrases.
 */
let phrases;

/**
 * An array containing the child to parent relationships for implicit nodes.
 */
let childToParent;

function BabelPluginFbt(babel) {
  const t = babel.types;

  return {
    pre() {
      this.opts.fbtSentinel = this.opts.fbtSentinel || '__FBT__';
      this.opts.fbtBase64 = this.opts.fbtBase64;
      fbtMethodCallVisitors.setEnumManifest(this.opts.fbtEnumManifest);
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
        const {node} = path;
        const isFbtJSX = fbtChecker.isJSXElement(node);
        const isFbsJSX = fbsChecker.isJSXElement(node);

        if (!isFbtJSX && !isFbsJSX) {
          return;
        }

        const moduleName = isFbtJSX ? FBT : FBS;

        FbtNodeChecker.forModule(moduleName).assertNoNestedFbts(node);

        if (!node.implicitFbt) {
          autoWrap.createImplicitDescriptions(moduleName, node);
        }

        giveParentPhraseLocation(node, phrases.length);

        const children = filterEmptyNodes(node.children).map(
          transformNamespacedFbtElement.bind(null, moduleName),
        );

        const text =
          children.length > 1
            ? createConcatFromExpressions(children)
            : children[0];

        const common = getCommonAttributeValue(moduleName, path.node);
        let desc;
        if (common && common.value) {
          const textValue = normalizeSpaces(
            expandStringConcat(moduleName, t, text).value.trim(),
          );
          const descValue = FbtCommonConstants[textValue];
          if (!descValue) {
            throwAt(
              path.node,
              getUnknownCommonStringErrorMessage(moduleName, textValue),
            );
          }
          if (getAttributeByName(path.node.openingElement.attributes, 'desc')) {
            throwAt(
              path.node,
              `<${moduleName} common={true}> must not have "desc" attribute`,
            );
          }
          desc = t.stringLiteral(descValue);
        } else {
          desc = getDescAttributeValue(moduleName, path.node);
        }

        const args = [text, desc];

        // Optional attributes to be passed as options.
        var attrs = node.openingElement.attributes;
        if (attrs.length > 1) {
          args.push(
            getOptionsFromAttributes(
              t,
              attrs,
              ValidFbtOptions,
              FbtRequiredAttributes,
            ),
          );
        }

        const callNode = t.callExpression(t.identifier(moduleName), args);

        callNode.loc = node.loc;
        if (node.parentIndex !== undefined) {
          callNode.parentIndex = node.parentIndex;
        }
        path.replaceWith(callNode);
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
        const moduleName =
          fbsChecker.isModuleCall(node) || fbsChecker.isCommonStringCall(node)
            ? FBS
            : FBT;
        const checker = FbtNodeChecker.forModule(moduleName);

        if (checker.isCommonStringCall(node)) {
          processFbtCommonCall(moduleName, path);
          return;
        }

        if (!checker.isModuleCall(node)) {
          if (isRequireAlias(path.parentPath)) {
            const _moduleName = node.arguments[0].value;
            const alias = path.parentPath.node.id.name;
            fbtMethodCallVisitors.setFbtEnumRequireMap(alias, _moduleName);
          }
          return;
        }

        if (moduleName === FBT && !checker.isJSModuleBound(path)) {
          throwAt(
            path.node,
            "`fbt` is not bound. Did you forget to require('fbt')?",
          );
        }

        if (node.arguments.length < 2) {
          throwAt(
            node,
            `Expected ${moduleName} calls to have at least two arguments. ` +
              `Only ${node.arguments.length} was given.`,
          );
        }

        // Contains params and enums in the order in which they appear.
        const runtimeArgs = [];
        const variations = {};

        const methodsState = {
          paramSet: {},
          runtimeArgs,
          variations,
          hasTable: false, // can be mutated during `fbtMethodCallVisitors`.
          enumManifest: visitor.opts.fbtEnumManifest,
          src: visitor.file.code,
        };

        path.traverse(fbtMethodCallVisitors.call(t, moduleName), methodsState);

        let texts;
        const optionsNode = node.arguments[2];
        const options = collectOptions(
          moduleName,
          t,
          optionsNode,
          ValidFbtOptions,
        );

        if (options.subject) {
          methodsState.hasTable = true;
        }
        const isTable =
          Object.keys(variations).length > 0 || methodsState.hasTable;

        for (const key in FbtBooleanOptions) {
          if (options.hasOwnProperty(key)) {
            options[key] = getOptionBooleanValue(t, options, key, optionsNode);
          }
        }

        if (options.doNotExtract) {
          return;
        }

        if (isTable) {
          texts = normalizeTableTexts(
            extractTableTexts(
              moduleName,
              visitor.file.code,
              node.arguments[0],
              variations,
            ),
          );
        } else {
          texts = [
            normalizeSpaces(
              expandStringConcat(moduleName, t, node.arguments[0]).value,
              options,
            ).trim(),
          ];
        }

        const desc = normalizeSpaces(
          expandStringConcat(moduleName, t, node.arguments[1]).value,
          options,
        ).trim();

        const phrase = {
          type: isTable ? FbtType.TABLE : FbtType.TEXT,
          desc: desc,
        };

        if (options.subject) {
          texts.unshift({
            type: 'subject',
          });

          runtimeArgs.unshift(
            t.callExpression(
              t.memberExpression(
                t.identifier(moduleName),
                t.identifier('_subject'),
                false,
              ),
              [getOptionAST(node.arguments[2], 'subject')],
            ),
          );
        }

        appendOptions(phrase, options);
        phrase.jsfbt = JSFbtBuilder.build(
          phrase.type,
          texts,
          visitor.opts.reactNativeMode,
        );

        if (visitor.opts.collectFbt) {
          if (visitor.opts.auxiliaryTexts) {
            phrase.texts = texts;
          }

          addPhrase(node, phrase, visitor);

          if (node.parentIndex !== undefined) {
            addEnclosingString(phrases.length - 1, node.parentIndex);
          }
        }

        const argsOutput = JSON.stringify({
          type: phrase.type,
          jsfbt: phrase.jsfbt,
          desc: phrase.desc,
          project: phrase.project,
        });
        const encodedOutput = visitor.opts.fbtBase64
          ? Buffer.from(argsOutput).toString('base64')
          : argsOutput;
        const args = [
          t.stringLiteral(
            visitor.opts.fbtSentinel + encodedOutput + visitor.opts.fbtSentinel,
          ),
        ];

        if (runtimeArgs.length > 0) {
          args.push(t.arrayExpression(runtimeArgs));
        }

        path.replaceWith(
          t.callExpression(
            t.memberExpression(t.identifier(moduleName), t.identifier('_')),
            args,
          ),
        );
      },
    },
  };

  /**
   * Transform a namespaced fbt JSXElement (or its React equivalent) into a
   * method call. E.g. `<fbt:param>` or <FbtParam> to `fbt.param()`
   */
  function transformNamespacedFbtElement(moduleName, node) {
    switch (node.type) {
      case 'JSXElement':
        return toFbtNamespacedCall(moduleName, node);
      case 'JSXText':
        return t.stringLiteral(normalizeSpaces(node.value));
      case 'JSXExpressionContainer':
        return t.stringLiteral(
          normalizeSpaces(
            expandStringConcat(moduleName, t, node.expression).value,
          ),
        );
      default:
        throwAt(node, `Unknown namespace fbt type ${node.type}`);
    }
  }

  function toFbtNamespacedCall(moduleName, node) {
    let name = validateNamespacedFbtElement(
      moduleName,
      node.openingElement.name,
    );
    const args = namespacedElementsArgsHandler
      .getArgs(moduleName, t)
      [name](node);
    if (name == 'implicitParamMarker') {
      name = 'param';
    }
    return t.callExpression(
      t.memberExpression(t.identifier(moduleName), t.identifier(name), false),
      args,
    );
  }

  /**
   * Extracts texts that contains variations or enums, contatenating
   * literal parts. Example:
   *
   * "Hello, " + fbt.param('user', user, {gender: 'male'}) + "! " +
   * "Your score is " + fbt.param('score', score) + "!"
   *
   * ["Hello, ", {type: 'gender', token: 'user'}, "! Your score is {score}!"]
   */
  function extractTableTexts(moduleName, src, node, variations, texts) {
    texts || (texts = []);
    if (node.type === 'BinaryExpression') {
      if (node.operator !== '+') {
        throwAt(
          node,
          `Expected concatenation operator (+) but got ${node.operator}`,
        );
      }
      extractTableTexts(moduleName, src, node.left, variations, texts);
      extractTableTexts(moduleName, src, node.right, variations, texts);
    } else if (node.type === 'TemplateLiteral') {
      let index = 0;
      for (const elem of node.quasis) {
        if (elem.value.cooked) {
          extractTableTexts(
            moduleName,
            src,
            t.stringLiteral(elem.value.cooked),
            variations,
            texts,
          );
        }
        if (index < node.expressions.length) {
          const expr = node.expressions[index++];
          extractTableTexts(moduleName, src, expr, variations, texts);
        }
      }
    } else if (node.type === 'StringLiteral') {
      // If we already collected a literal part previously, and
      // current part is a literal as well, just concatenate them.
      const previousText = texts[texts.length - 1];
      if (typeof previousText === 'string') {
        texts[texts.length - 1] = normalizeSpaces(previousText + node.value);
      } else {
        texts.push(node.value);
      }
    } else if (node.type === 'CallExpression') {
      const callee = node.callee.property;
      switch (callee.name || callee.value) {
        case 'param':
          texts.push(variations[node.arguments[0].value]);
          break;
        case 'enum':
          texts.push({
            type: 'enum',
            range: extractEnumRange(node.arguments[1]),
            value: getRawSource(src, node.arguments[0]),
          });
          break;
        case 'plural':
          const singular = node.arguments[0].value;
          const opts = collectOptions(
            moduleName,
            t,
            node.arguments[2],
            ValidPluralOptions,
          );
          const defaultToken =
            opts.showCount && opts.showCount !== 'no'
              ? PLURAL_PARAM_TOKEN
              : null;
          if (opts.showCount === 'ifMany' && !opts.many) {
            throwAt(
              node,
              "The 'many' attribute must be set explicitly if showing count only " +
                " on 'ifMany', since the singular form presumably starts with an article",
            );
          }
          const data = {
            type: 'plural',
            showCount: 'no',
            name: defaultToken,
            singular: singular,
            many: singular + 's',
            ...opts,
          };
          if (data.showCount !== 'no') {
            if (data.showCount === 'yes') {
              data.singular = '1 ' + data.singular;
            }
            data.many = '{' + data.name + '} ' + data.many;
          }
          texts.push(data);
          break;
        case 'pronoun':
          // Usage: fbt.pronoun(usage, gender [, options])
          const optionsNode = node.arguments[2];
          const options = collectOptions(
            moduleName,
            t,
            node.arguments[2],
            ValidPronounOptions,
          );
          for (const key of Object.keys(options)) {
            options[key] = getOptionBooleanValue(t, options, key, optionsNode);
          }
          texts.push({
            type: 'pronoun',
            usage: node.arguments[0].value,
            ...options,
          });
          break;
        case 'name':
          texts.push(variations[node.arguments[0].value]);
          break;
      }
    }

    return texts;
  }

  /**
   * Given an array of nodes, recursively construct a concatenation of all
   * these nodes.
   */
  function createConcatFromExpressions(nodes) {
    if (nodes.length === 0) {
      throw new Error(`Cannot create an expression without nodes.`);
    }
    return nodes.reduceRight(function(rest, node) {
      return t.binaryExpression('+', node, rest);
    });
  }

  /**
   * fbt.c(text) --> fbt(text, desc)
   */
  function processFbtCommonCall(moduleName, path) {
    if (path.node.arguments.length !== 1) {
      throwAt(
        path.node,
        `Expected ${moduleName}.c to have exactly 1 argument. ${
          path.node.arguments.length
        } was given.`,
      );
    }

    const text = normalizeSpaces(
      expandStringConcat(moduleName, t, path.node.arguments[0]).value,
    ).trim();

    const desc = FbtCommonConstants[text];
    if (!desc) {
      throwAt(path.node, getUnknownCommonStringErrorMessage(moduleName, text));
    }

    const callNode = t.callExpression(t.identifier(moduleName), [
      t.stringLiteral(text),
      t.stringLiteral(desc),
    ]);

    callNode.loc = path.node.loc;
    path.replaceWith(callNode);
  }
}

BabelPluginFbt.getExtractedStrings = function() {
  return phrases;
};

BabelPluginFbt.getChildToParentRelationships = function() {
  return childToParent || {};
};

BabelPluginFbt.getDefaultOptions = function() {
  return defaultOptions;
};

function initExtraOptions(state) {
  Object.assign(ValidFbtOptions, state.opts.extraOptions || {});
}

function initDefaultOptions(state) {
  defaultOptions = {};
  const fbtDocblockOptions = docblock.getFromState(state).fbt;
  if (fbtDocblockOptions) {
    defaultOptions = JSON.parse(fbtDocblockOptions);
    Object.keys(defaultOptions).forEach(o => checkOption(o, ValidFbtOptions));
  }
  if (!defaultOptions.project) {
    defaultOptions.project = '';
  }
}

function getDescAttributeValue(moduleName, node) {
  const descAttr = getAttributeByNameOrThrow(
    node.openingElement.attributes,
    'desc',
  );
  if (!descAttr) {
    throw new Error(`<${moduleName}> requires a "desc" attribute`);
  }
  if (descAttr.value.type === 'JSXExpressionContainer') {
    return descAttr.value.expression;
  }
  return descAttr.value;
}

function getCommonAttributeValue(moduleName, node) {
  const commonAttr = getAttributeByName(
    node.openingElement.attributes,
    'common',
  );
  if (!commonAttr) {
    return null;
  }
  if (commonAttr.value.type === 'JSXExpressionContainer') {
    const expression = commonAttr.value.expression;
    if (expression.type === 'BooleanLiteral') {
      return expression;
    }
  }

  throw new Error(
    `\`common\` attribute for <${moduleName}> requires boolean literal`,
  );
}

/**
 * Appends additional options to the main
 * fbt call argument.
 */
function appendOptions(fbtArg, options) {
  Object.assign(fbtArg, defaultOptions, options);
}

/**
 * Returns the AST node associated with the key provided, or null if it doesn't exist.
 */
function getOptionAST(options, name) {
  const props = (options && options.properties) || [];
  for (var ii = 0; ii < props.length; ii++) {
    const option = props[ii];
    const curName = option.key.name || option.key.value;
    if (name === curName) {
      return option.value.expression || option.value;
    }
  }
  return null;
}

/**
 * Normalizes first and last elements in the
 * table texts by triming them left and right accordingly.
 * [" Hello, ", {enum}, " world! "] -> ["Hello, ", {enum}, " world!"]
 */
function normalizeTableTexts(texts) {
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

/** Given a node, and its index location in phrases, any children of the given
 * node that are implicit are given their parent's location. This can then
 * be used to link the inner strings with their enclosing string.
 */
function giveParentPhraseLocation(parentNode, parentIdx) {
  if (!parentNode.children) {
    return;
  }
  for (let ii = 0; ii < parentNode.children.length; ++ii) {
    const child = parentNode.children[ii];
    if (child.implicitDesc) {
      child.parentIndex = parentIdx;
    }
  }
}

function addPhrase(node, phrase, state) {
  phrases.push({
    filepath: state.opts.filepath,
    line_beg: node.loc.start.line,
    col_beg: node.loc.start.column,
    line_end: node.loc.end.line,
    col_end: node.loc.end.column,
    ...phrase,
  });
}

function addEnclosingString(childIdx, parentIdx) {
  childToParent[childIdx] = parentIdx;
}

function getUnknownCommonStringErrorMessage(moduleName, text) {
  return `Unknown string "${text}" for <${moduleName} common={true}>`;
}

module.exports = BabelPluginFbt;
