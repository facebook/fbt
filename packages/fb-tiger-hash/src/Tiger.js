/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * An implementation of the Tiger hash function.  It specifically
 * supports the original PHP implementation that swapped byte order
 * (endianness) of the resulting digest to keep backwards
 * compatibility:
 * https://github.com/facebook/hhvm/blob/281303d/hphp/runtime/ext/hash/ext_hash.cpp#L94-L97
 *
 * More on the Tiger algorithm:
 *   https://www.cs.technion.ac.il/~biham/Reports/Tiger/tiger/node3.html
 *   https://www.cl.cam.ac.uk/~rja14/Papers/tiger.pdf
 *   https://www.cl.cam.ac.uk/~rja14/Papers/tigersb.pdf
 *
 * Implementation in C:
 *   https://www.cs.technion.ac.il/~biham/Reports/Tiger/tiger/node7.html
 *
 * Flow does not support BigInt yet
 *
 * @noflow
 * @oncall i18n_fbt_js
 */

/* eslint-disable no-bitwise */
/* global BigInt */

'use strict';

const {t1, t2, t3, t4} = require('./TigerTables');

const uint = BigInt.asUintN.bind(BigInt, 64);
const U64 = 0xffffffffffffffffn;

// Turn a buffer into a Tiger-padded array of 64-bit words
function _getMessage(buffer /*: Buffer*/) /*: Array<BigInt>*/ {
  const words = [];
  let word = 0n;
  let byteLen = 0n;
  for (const c of buffer) {
    const b = byteLen++ & 0x7n;
    word |= BigInt(c) << (b << 3n);
    if (byteLen % 8n == 0n) {
      words.push(word);
      word = 0n;
    }
  }
  // Store original size (in bits)
  const bitSize = (byteLen << 3n) & U64;

  // Pad our message with a byte of 0x1 ala MD4 (Tiger1) padding
  const b = byteLen & 0x7n;
  if (b) {
    word |= 0x1n << (b << 3n);
    words.push(word);
    byteLen += 8n - b;
  } else {
    words.push(0x1n);
    byteLen += 8n;
  }

  for (byteLen %= 64n; byteLen < 56n; byteLen += 8n) {
    words.push(0n);
  }
  words.push(bitSize);
  return words;
}

// BigInt.toString will naturally elide leading zero's.  Add them back
const ZERO_FILL = '000000000000000';
function _zeroFill(n /*: {value: BigInt}*/) {
  const str = n.value.toString(16);
  return ZERO_FILL.substr(0, 16 - str.length) + str;
}

// The registers a, b, c concatenated as a string yield the inverted byte order.
// Reverse the byte order of the concatenated digest string with an inversion
// lookup.
// prettier-ignore
const inversion = [
  14, 15, 12, 13, 10, 11,  8,  9,  6,  7,  4,  5,  2,  3,  0,  1,
  30, 31, 28, 29, 26, 27, 24, 25, 22, 23, 20, 21, 18, 19, 16, 17,
  46, 47, 44, 45, 42, 43, 40, 41, 38, 39, 36, 37, 34, 35, 32, 33
];

class Tiger {
  constructor(
    digestBitLen /*: number*/, // 128, 160, 192
    // For additional passes after the first 3.  For 'Tiger,4' we'd pass 1 here
    extraPasses /*: number*/ = 0,
    // PHP originally had the final byte-order of the digest inverted.  If this
    // old behavior is desired, set this to true.
    invertByte /*: boolean*/ = false,
    // Encoding to which to convert JS's internal string before hashing.
    // Defaults to encoding the string to UTF-8.  To use the string as the
    // native UTF-16, pass Tiger.UTF16 = 'utf16le'.
    encoding /*: string*/ = Tiger.UTF8,
  ) {
    this._digestBitLen = digestBitLen;
    this._extraPasses = extraPasses;
    this._invertByte = invertByte;
    this._encoding = encoding;
  }

  // The use of uint(...) and & U64 here are to ensure we maintain unsigned
  // 64-bit behavior.  We're ensuring BigInt's implementation doesn't exceed 64
  // bits (when multiplying, adding, or shifting left) and doesn't go negative
  // (when subtracting).  Negative numbers aren't a problem for bitwise & and |
  // operations, but BigInt will 1-fill the most-significant bits when shifting
  // right, whereas an unsigned word would have 0-filled.
  _keySchedule() {
    this._x0 = uint(this._x0 - (this._x7 ^ 0xa5a5a5a5a5a5a5a5n));
    this._x1 ^= this._x0;
    this._x2 = (this._x2 + this._x1) & U64;
    this._x3 = uint(this._x3 - (this._x2 ^ ((~this._x1 << 19n) & U64)));
    this._x4 ^= this._x3;
    this._x5 = (this._x5 + this._x4) & U64;
    this._x6 = uint(this._x6 - (this._x5 ^ (uint(~this._x4) >> 23n)));
    this._x7 ^= this._x6;
    this._x0 = (this._x0 + this._x7) & U64;
    this._x1 = uint(this._x1 - (this._x0 ^ (~this._x7 << 19n)));
    this._x2 ^= this._x1;
    this._x3 = (this._x3 + this._x2) & U64;
    this._x4 = uint(this._x4 - (this._x3 ^ (uint(~this._x2) >> 23n)));
    this._x5 ^= this._x4;
    this._x6 = (this._x6 + this._x5) & U64;
    this._x7 = uint(this._x7 - (this._x6 ^ 0x0123456789abcdefn));
  }

  _save() {
    this._aa = this._a.value;
    this._bb = this._b.value;
    this._cc = this._c.value;
  }

  _feedforward() {
    this._a.value ^= this._aa;
    this._b.value = uint(this._b.value - this._bb);
    this._c.value = (this._c.value + this._cc) & U64;
  }

  _compress() {
    this._save();
    this._pass(this._a, this._b, this._c, 5n);
    this._keySchedule();
    this._pass(this._c, this._a, this._b, 7n);
    this._keySchedule();
    this._pass(this._b, this._c, this._a, 9n);
    for (let pass = 0; pass < this._extraPasses; ++pass) {
      this._keySchedule();
      this._pass(this._a, this._b, this._c, 9n);
      const tmpa = this._a;
      this._a = this._c;
      this._c = this._b;
      this._b = tmpa;
    }
    this._feedforward();
  }

  _round(a, b, c, x, mul) {
    c.value ^= x;
    const d = c.value;
    const d_0 = d & 0xffn;
    const d_1 = (d >> 8n) & 0xffn;
    const d_2 = (d >> 16n) & 0xffn;
    const d_3 = (d >> 24n) & 0xffn;
    const d_4 = (d >> 32n) & 0xffn;
    const d_5 = (d >> 40n) & 0xffn;
    const d_6 = (d >> 48n) & 0xffn;
    const d_7 = (d >> 56n) & 0xffn;
    a.value = uint(a.value - (t1[d_0] ^ t2[d_2] ^ t3[d_4] ^ t4[d_6]));
    b.value = (b.value + (t4[d_1] ^ t3[d_3] ^ t2[d_5] ^ t1[d_7])) & U64;
    b.value = (b.value * mul) & U64;
  }

  _pass(a, b, c, mul) {
    this._round(a, b, c, this._x0, mul);
    this._round(b, c, a, this._x1, mul);
    this._round(c, a, b, this._x2, mul);
    this._round(a, b, c, this._x3, mul);
    this._round(b, c, a, this._x4, mul);
    this._round(c, a, b, this._x5, mul);
    this._round(a, b, c, this._x6, mul);
    this._round(b, c, a, this._x7, mul);
  }

  _split(message, block) {
    this._x0 = message[block];
    this._x1 = message[block + 1];
    this._x2 = message[block + 2];
    this._x3 = message[block + 3];
    this._x4 = message[block + 4];
    this._x5 = message[block + 5];
    this._x6 = message[block + 6];
    this._x7 = message[block + 7];
  }

  hash(input /*: string*/) /*: string*/ {
    // Tiger's supplied implementation in C makes heavy use of imperative macros
    // that overwrite the state of old values; specifically the `round` macro.
    // this doesn't map to the lexical scoping and pass-by-value semantics of
    // functions in JavaScript when passing primitives.  Here, we mimic "inout"
    // params or "references" with lightweight objects.
    this._a = {value: 0x0123456789abcdefn};
    this._b = {value: 0xfedcba9876543210n};
    this._c = {value: 0xf096a5b4c3b2e187n};
    const words = _getMessage(Buffer.from(input, this._encoding));

    for (let block = 0; block < words.length; block += 8) {
      this._split(words, block);
      this._compress();
    }

    const digest = [this._a, this._b, this._c].map(n => _zeroFill(n)).join('');
    const chars = this._digestBitLen / 4;
    if (!this._invertByte) {
      let inverted = '';
      for (let i = 0; i < digest.length && i < chars; ++i) {
        inverted += digest[inversion[i]];
      }
      return inverted;
    }
    return digest.substr(0, chars);
  }
}

Tiger.L128 = 128;
Tiger.L160 = 160;
Tiger.L192 = 192;

Tiger.UTF8 = 'utf8';
Tiger.UTF16 = 'utf16le';

module.exports = Tiger;
