/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @format
 * @noflow
 * @oncall i18n_fbt_js
 */

'use strict';

const stripPragmas = require('../stripPragmas');

describe('Rewriter', () => {
  it('Should strip all pragmas by default', () => {
    const input = `/**
 * Some header
 *
 * @foo
 * @bar
 */

function dummy() {
  return 0;
}`;

    const expected = `/**
 * Some header
 */

function dummy() {
  return 0;
}`;
    expect(stripPragmas(input)).toEqual(expected);
  });

  it('Should strip only specified pragmas', () => {
    const input = `/**
 * Some header
 *
 * @foo
 * @bar
 */

function dummy() {
  return 0;
}`;

    const expected = `/**
 * Some header
 *
 * @foo
 */

function dummy() {
  return 0;
}`;
    expect(stripPragmas(input, ['bar'])).toEqual(expected);
  });
});
