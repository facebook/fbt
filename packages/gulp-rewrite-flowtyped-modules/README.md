# gulp-rewrite-flowtyped-modules
### Rewrites modules dependencies

## Implementation
Uses [`flow-parser`](https://www.npmjs.com/package/flow-parser) to scan the
potentially-flow-typed JavaScript AST file for `import` and `require` statements.
It rewrites modules according to the options passed in.

This behaves very similar to the
[`rewrite-module`](https://github.com/facebook/fbjs/blob/main/packages/babel-preset-fbjs/plugins/rewrite-modules.js)
in [babel-preset-fbjs](https://www.npmjs.com/package/babel-preset-fbjs) from the
[fbjs](https://github.com/facebook/fbjs) package.  The difference here is that
it isn't done through Babel, but through [`flow-parser`](https://www.npmjs.com/package/flow-parser), and therefore keeps flow types intact.

## Options

`prefix`: Module prefix to prepend to all rewritten modules. (defaults to `'./'`)

`map`: moduleMap to use for rewriting modules (empty by default)

`flow`: options to pass to `flow-parser`. See https://www.npmjs.com/package/flow-parser#options
