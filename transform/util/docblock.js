/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const docblockRe = /^\s*(\/\*\*(.|\r?\n)*?\*\/)/;
/**
 * @param {String} contents
 * @return {String}
 */
function extract(contents) {
  const match = contents.match(docblockRe);
  if (match) {
    return match[0].trimLeft() || '';
  }
  return '';
}

const commentStartRe = /^\/\*\*?/;
const commentEndRe = /\*+\/$/;
const wsRe = /[\t ]+/g;
const stringStartRe = /(\r?\n|^) *\*/g;
const multilineRe = /(?:^|\r?\n) *(@[^\r\n]*?) *\r?\n *([^@\r\n\s][^@\r\n]+?) *\r?\n/g;
const propertyRe = /(?:^|\r?\n) *@(\S+) *([^\r\n]*)/g;

/**
 * @param {Object} Babel's state object.
 */
function getFromState(state) {
  let docblock = state.docblock;
  if (!docblock) {
    docblock = {};
    const ast = state.file.ast;
    if (ast.comments && ast.comments[0]) {
      docblock = parseAsObject(ast.comments[0].value);
    }
    state.docblock = docblock;
  }
  return docblock;
}

/**
 * @param {String} docblock
 * @return {Array}
 */
function parse(docblock) {
  docblock = docblock
    .replace(commentStartRe, '')
    .replace(commentEndRe, '')
    .replace(wsRe, ' ')
    .replace(stringStartRe, '$1');

  // Normalize multi-line directives
  let prev = '';
  while (prev != docblock) {
    prev = docblock;
    docblock = docblock.replace(multilineRe, '\n$1 $2\n');
  }
  docblock = docblock.trim();

  const result = [];
  let match;
  while (match = propertyRe.exec(docblock)) {
    result.push([match[1], match[2]]);
  }

  return result;
}

/**
 * Same as parse but returns an object of prop: value instead of array of paris
 * If a property appers more than once the last one will be returned
 *
 * @param {String} docblock
 * @return {Object}
 */
function parseAsObject(docblock) {
  const pairs = parse(docblock);
  const result = {};
  for (let i = 0; i < pairs.length; i++) {
    result[pairs[i][0]] = pairs[i][1];
  }
  return result;
}

// type-checks
const paramRe = /^\{([^\}]+)\} ([^ ]+)/;
const returnsRe = /^\{([^\}]+)\}/;

/**
 * Extract type-check information from the docblock, used when Flow and inline
 * type-annotations are unavailable.
 *
 * @param {String} docblock
 * @return {Object}
 */
function parseTypeData(docblock) {
  const data = {
    params: {},
    returns: undefined,
  };
  const list = parse(docblock);
  for (let ii = 0; ii < list.length; ++ii) {
    switch (list[ii][0]) {
      case 'param': {
        const paramData = paramRe.exec(list[ii][1]);
        if (paramData) {
          data.params[paramData[2]] = paramData[1];
        }
        break;
      }
      case 'returns':
      case 'return':
        var returnData = returnsRe.exec(list[ii][1]);
        if (returnData) {
          data.returns = returnData[1];
        }
        break;
    }
  }
  return data;
}

exports.extract = extract;
exports.parse = parse;
exports.parseAsObject = parseAsObject;
exports.parseTypeData = parseTypeData;
exports.getFromState = getFromState;
