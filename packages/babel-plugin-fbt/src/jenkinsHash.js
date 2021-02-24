/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict
 * @emails oncall+internationalization
 */
/* eslint no-bitwise: 0 */

'use strict';

function toUtf8(str) {
  var result = [];
  var len = str.length;
  for (var i = 0; i < len; i++) {
    var charcode = str.charCodeAt(i);
    if (charcode < 0x80) {
      result.push(charcode);
    } else if (charcode < 0x800) {
      result.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      result.push(
        0xe0 | (charcode >> 12),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f),
      );
    } else {
      i++;
      charcode =
        0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      result.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f),
      );
    }
  }
  return result;
}

// Hash computation for each string that matches the dump script in i18n's php.
function jenkinsHash(str /*: string */) /*: number */ {
  if (!str) {
    return 0;
  }

  var utf8 = toUtf8(str);
  var hash = 0;
  var len = utf8.length;
  for (var i = 0; i < len; i++) {
    hash = hash + utf8[i];
    hash = (hash + (hash << 10)) >>> 0;
    hash = hash ^ (hash >>> 6);
  }

  hash = (hash + (hash << 3)) >>> 0;
  hash = hash ^ (hash >>> 11);
  hash = (hash + (hash << 15)) >>> 0;

  return hash;
}

module.exports = jenkinsHash;
