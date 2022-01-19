/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This is a React Native only transform that runs after the fbt syntax
 * transform. It extracts jsfbt and strip out extra information from the payload
 * produced by the fbt syntax transform.
 *
 * @emails oncall+i18n_fbt_js
 * @flow
 * @noformat
 */

'use strict';

/* eslint consistent-return: 0 */
/* eslint max-len: ["warn", 120] */

/*::
import typeof BabelTypes from '@babel/types';
import type {BabelTransformPlugin} from '@babel/core';
import type {SentinelPayload} from 'babel-plugin-fbt/dist/babel-processors/FbtFunctionCallProcessor';
import type {FbtTableKey, PatternString} from '../../runtime/shared/FbtTable';
import type {TableJSFBTTree, TableJSFBTTreeLeaf} from 'babel-plugin-fbt';
import type {FbtRuntimeInput} from 'FbtHooks';

export type PluginOptions = {|
  fbtHashKeyModule?: string,
  fbtSentinel?: string,
  reactNativeMode?: boolean,
|};
*/

const {
  FbtUtil: {replaceClearTokensWithTokenAliases},
  JSFbtUtil: {mapLeaves},
  fbtHashKey: jenkinsHashKey,
} = require('babel-plugin-fbt');
const {shiftEnumsToTop} = require('babel-plugin-fbt').FbtShiftEnums;
const {SENTINEL} = require('babel-plugin-fbt/dist/FbtConstants');
const invariant = require('invariant');

let fbtHashKey /*: typeof jenkinsHashKey */ = jenkinsHashKey;

/**
 * Utility function to cast the Babel transform plugin options to the right type
 */
function getPluginOptions(plugin /*: $Shape<{opts: ?PluginOptions}> */) /*: PluginOptions */ {
  const {opts} = plugin;
  if (opts == null || typeof opts !== 'object') {
    // eslint-disable-next-line fb-www/no-new-error
    throw new Error(`Expected to opts property to be an object. `
      + `Current value is ${String(opts)} (${typeof opts})`);
  }
  // $FlowExpectedError[prop-missing]
  // $FlowExpectedError[incompatible-exact]
  return opts;
}

/**
 * Helper method to convert jsfbt tree leaf to runtime input leaf by:
 *  1. Stripping away keys (e.g desc and tokenAliases) that are unneccessary
 *    for runtime and only keep the `text` key.
 *  2. Replacing clear token names in the text with mangled tokens.
 */
function convertJSFBTLeafToRuntimeInputText(leaf /*: $ReadOnly<TableJSFBTTreeLeaf> */) /* : PatternString */ {
  return replaceClearTokensWithTokenAliases(leaf.text, leaf.tokenAliases);
}

module.exports = function BabelPluginFbtRuntime(babel /*: {
  types: BabelTypes,
} */) /*: BabelTransformPlugin */ {
  const t = babel.types;

  // Need to extract this as a standalone function for Flow type check refinements
  const {isCallExpression} = t;

  function _buildEnumToHashKeyObjectExpression(
    curLevel /*: PatternString | $ReadOnly<TableJSFBTTree> */,
    enumsLeft /*: number */,
  ) /*: BabelNodeObjectExpression */ {
    const properties = [];
    invariant(typeof curLevel === 'object',
      'Expected curLevel to be an object instead of %s', typeof curLevel);
    for (const enumKey in curLevel) {
      properties.push(
        t.objectProperty(
          t.identifier(enumKey),
          enumsLeft === 1
            ? t.stringLiteral(fbtHashKey(curLevel[enumKey]))
            : _buildEnumToHashKeyObjectExpression(
              // TODO(T86653403) Add support for consolidated JSFBT structure to RN
              // $FlowFixMe[incompatible-call]
              curLevel[enumKey],
              enumsLeft - 1,
            ),
        ),
      );
    }

    return t.objectExpression(properties);
  }

  return {
    pre() {
      // $FlowFixMe[object-this-reference] Babel transforms run with the plugin context by default
      const visitor = this;
      const opts = getPluginOptions(visitor);
      visitor.opts.fbtSentinel = opts.fbtSentinel || SENTINEL;
      if (opts.fbtHashKeyModule) {
        // $FlowExpectedError[unsupported-syntax] Dynamic import needed
        fbtHashKey = require(opts.fbtHashKeyModule);
      }
    },

    name: 'fbt-runtime',
    visitor: {
      /**
       * Transform the following:
       * fbt._(
       *   fbtSentinel +
       *   JSON.strinfigy({
       *     type: "text",
       *     jsfbt: "jsfbt test" | {
       *       "t": {... jsfbt table}
       *        ...
       *     },
       *     desc: "desc",
       *     project: "project",
       *   }) +
       *   fbtSentinel
       * );
       * to:
       * fbt._("jsfbt test") or fbt._({... jsfbt table})
       */
      StringLiteral(path) {
        // $FlowFixMe[object-this-reference] Babel transforms run with the plugin context by default
        const {fbtSentinel, reactNativeMode} = getPluginOptions(this);
        if (fbtSentinel == null || fbtSentinel.trim() == '') {
          // eslint-disable-next-line fb-www/no-new-error
          throw new Error(`fbtSentinel must be a non-empty string. `
            + `Current value is ${String(fbtSentinel)} (${typeof fbtSentinel})`);
        }
        const sentinelLength = fbtSentinel.length;
        let phrase = path.node.value;
        if (
          !phrase.startsWith(fbtSentinel) ||
          !phrase.endsWith(fbtSentinel) ||
          phrase.length <= sentinelLength * 2
        ) {
          return;
        }

        phrase = (JSON.parse(
          phrase.slice(sentinelLength, phrase.length - sentinelLength),
        ) /*: SentinelPayload */);

        const payload = phrase.jsfbt.t;
        const runtimeInput = mapLeaves(
          payload,
          convertJSFBTLeafToRuntimeInputText,
        );
        // $FlowFixMe[prop-missing] replaceWithSourceString's type is not defined yet
        path.replaceWithSourceString(JSON.stringify(runtimeInput));

        const parentNode = path.parentPath && path.parentPath.node;
        invariant(isCallExpression(parentNode),
          'Expected parent node to be a BabelNodeCallExpression');

        // Append runtime options - key for runtime dictionary lookup
        if (parentNode.arguments.length === 1) {
          // Second param 'args' could be omitted sometimes. Use null here
          parentNode.arguments.push(t.nullLiteral());
        }
        invariant(
          parentNode.arguments.length === 2,
          'Expecting options to be the third param',
        );

        let shiftedJsfbt;
        let enumCount = 0;
        if (reactNativeMode) {
          ({enumCount, shiftedJsfbt} = shiftEnumsToTop(phrase.jsfbt));
        }

        if (enumCount > 0) {
          invariant(
            shiftedJsfbt != null,
            'Expecting shiftedJsfbt to be defined',
          );
          parentNode.arguments.push(
            // The expected method name is `objectExpression` but
            // it already works as-is apparently...
            // $FlowFixMe[prop-missing] Use objectExpression() instead
            t.ObjectExpression([
              t.objectProperty(
                t.identifier('ehk'), // enumHashKey
                _buildEnumToHashKeyObjectExpression(
                  shiftedJsfbt,
                  enumCount,
                ),
              ),
            ]),
          );
        } else {
          parentNode.arguments.push(
            // The expected method name is `objectExpression` but
            // it already works as-is apparently...
            // $FlowFixMe[prop-missing] Use objectExpression() instead
            t.ObjectExpression([
              t.objectProperty(
                t.identifier('hk'),
                t.stringLiteral(fbtHashKey(payload)),
              ),
            ]),
          );
        }
      },
    },
  };
};
