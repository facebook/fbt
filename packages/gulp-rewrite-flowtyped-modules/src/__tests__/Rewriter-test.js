/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @format
 * @noflow
 * @oncall i18n_fbt_oss
 */

'use strict';

const Rewriter = require('../Rewriter');
const {rewrite} = Rewriter;

describe('Rewriter', () => {
  it('Should add "./" by default', () => {
    const rewriter = new Rewriter('require("foo");');
    expect(rewriter.rewrite()).toEqual('require("./foo");');
    expect(rewrite('require("foo");')).toEqual('require("./foo");');
  });

  it('Should add replace modules in the map', () => {
    expect(
      new Rewriter('require("foo");', {map: {foo: 'bar'}}).rewrite(),
    ).toEqual('require("bar");');
    const result = rewrite('require("foo");', {map: {foo: 'bar'}});
    expect(result).toEqual('require("bar");');
  });

  it('Should handle import modules', () => {
    const rewriter = new Rewriter("import Baz from 'Foo';", {
      map: {Foo: 'Qux'},
    });
    expect(rewriter.rewrite()).toEqual("import Baz from 'Qux';");
    const result = rewrite("import Baz from 'Foo';", {map: {Foo: 'Qux'}});
    expect(result).toEqual("import Baz from 'Qux';");
  });
});
