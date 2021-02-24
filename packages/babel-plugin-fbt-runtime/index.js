/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This is a React Native only transform that runs after the fbt syntax
 * transform. It extracts jsfbt and strip out extra information from the payload
 * produced by the fbt syntax transform.
 *
 * @format
 * @noflow
 * @emails oncall+internationalization
 */

'use strict';

/* eslint consistent-return: 0 */
/* eslint max-len: ["warn", 120] */
/* jslint node: true */

const {fbtHashKey: jenkinsHashKey} = require('babel-plugin-fbt');
const {shiftEnumsToTop} = require('babel-plugin-fbt').FbtShiftEnums;
const invariant = require('fbjs/lib/invariant');

let fbtHashKey = jenkinsHashKey;
module.exports = function fbtRuntime(babel) {
  const t = babel.types;

  function _buildEnumToHashKeyObjectExpression(curLevel, desc, enumsLeft) {
    const properties = [];

    for (const enumKey in curLevel) {
      properties.push(
        t.objectProperty(
          t.identifier(enumKey),
          enumsLeft === 1
            ? t.stringLiteral(fbtHashKey(curLevel[enumKey], desc))
            : _buildEnumToHashKeyObjectExpression(
                curLevel[enumKey],
                desc,
                enumsLeft - 1,
              ),
        ),
      );
    }

    return t.objectExpression(properties);
  }

  return {
    pre() {
      this.opts.fbtSentinel = this.opts.fbtSentinel || '__FBT__';
      if (this.opts.fbtHashKeyModule) {
        fbtHashKey = require(this.opts.fbtHashKeyModule);
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
        const sentinelLength = this.opts.fbtSentinel.length;
        let phrase = path.node.value;
        if (
          !phrase.startsWith(this.opts.fbtSentinel) ||
          !phrase.endsWith(this.opts.fbtSentinel) ||
          phrase.length <= sentinelLength * 2
        ) {
          return;
        }

        phrase = JSON.parse(
          phrase.slice(sentinelLength, phrase.length - sentinelLength),
        );

        let payload;
        if (phrase.type === 'text') {
          payload = phrase.jsfbt;
          path.replaceWith(t.stringLiteral(payload));
        } else {
          invariant(phrase.type === 'table', 'JSFbt only has 2 types');
          payload = phrase.jsfbt.t;
          path.replaceWithSourceString(JSON.stringify(payload));
        }

        // Append runtime options - key for runtime dictionary lookup
        if (path.parentPath.node.arguments.length === 1) {
          // Second param 'args' could be omitted sometimes. Use null here
          path.parentPath.node.arguments.push(t.nullLiteral());
        }
        invariant(
          path.parentPath.node.arguments.length === 2,
          'Expecting options to be the third param',
        );

        let shiftedJsfbt;
        let enumCount = 0;
        if (this.opts.reactNativeMode) {
          ({shiftedJsfbt, enumCount} = shiftEnumsToTop(phrase.jsfbt));
        }

        if (enumCount > 0) {
          path.parentPath.node.arguments.push(
            t.ObjectExpression([
              t.objectProperty(
                t.identifier('ehk'), // enumHashKey
                _buildEnumToHashKeyObjectExpression(
                  shiftedJsfbt,
                  phrase.desc,
                  enumCount,
                ),
              ),
            ]),
          );
        } else {
          path.parentPath.node.arguments.push(
            t.ObjectExpression([
              t.objectProperty(
                t.identifier('hk'),
                t.stringLiteral(fbtHashKey(payload, phrase.desc)),
              ),
            ]),
          );
        }
      },
    },
  };
};
