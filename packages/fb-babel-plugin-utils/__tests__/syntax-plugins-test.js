/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+jsinfra
 * @nolint
 */

jest.autoMockOff();

const babel = require('@babel/core');
const SyntaxPlugins = require('../SyntaxPlugins');

test('syntax-plugins list', () => {
  function transform(source) {
    babel.transformSync(source, {
      plugins: SyntaxPlugins.list,
    });
  }

  expect(() => {
    transform(`
      // Supported syntax
      class Foo {
        prop = 1;
        list: Array;
        async bar() {}
      }
      <MyComponent/>;
      const [a, ...b] = {...c, ...d};
      async function trailingComma(a,) {}
    `);
  }).not.toThrowError();

  expect(() => {
    transform(`
      // Unterminated JSX contents
      <MyComponent>;
    `);
  }).toThrowError(SyntaxError);
});
