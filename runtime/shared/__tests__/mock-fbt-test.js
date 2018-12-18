/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @emails i18n-tests@fb.com
 */
/* eslint "fb-www/require-flow-strict-local": "off" */

jest.disableAutomock();

var fbt = require('fbt');

// Note that running the typechecker in jst turns on fbt preprocessing so we
// have two almost identical test files: typechecked and not typechecked.
describe('mock fbt (no typechecks)', function() {
  it('should handle simple declarative strings', function() {
    expect(<fbt desc="description">some text</fbt>).toEqual('some text');
  });

  it("should handle <fbt> with embedded <fbt:param>'s", function() {
    var sample = (
      <fbt desc="description">
        {'Hello '}
        <fbt:param name="name">{'bubba'}</fbt:param>
      </fbt>
    );
    expect(sample).toEqual('Hello bubba');
  });

  it('should handle trivial strings', function() {
    expect(fbt('some text', 'description')).toEqual('some text');
  });

  it('should munge together fbt.param calls', function() {
    expect(fbt('Hello ' + fbt.param('name', 'bubba'), 'description')).toEqual(
      'Hello bubba',
    );
  });

  it('should work with enums', function() {
    expect(fbt('bar ' + fbt.enum('a', ['a', 'b']), 'd')).toEqual('bar a');
  });

  it('should work with enums/plurals/params mixed', function() {
    fbt.replaceParams = true;
    expect(
      fbt(
        'bar ' +
          fbt.enum('a', ['a', 'b']) +
          ' ' +
          fbt.plural('a thing', 3, {many: 'things', showCount: 'ifMany'}) +
          ' more plain text ' +
          fbt.param('baz', 'w00t') +
          ' ' +
          fbt.param('baz2', 'w00t2') +
          ' ' +
          fbt.enum('b', ['a', 'b']) +
          '. The end.',
        'd',
      ),
    ).toEqual('bar a 3 things more plain text w00t w00t2 b. The end.');
  });
});
