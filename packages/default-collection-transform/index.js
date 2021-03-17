const babel = require('@babel/core');

/* import type {BabelPluginList, BabelPresetList} from '@babel/core'; */

const defaultSyntaxPlugins = [
  '@babel/plugin-syntax-class-properties',
  '@babel/plugin-syntax-flow',
  '@babel/plugin-syntax-jsx',
  '@babel/plugin-syntax-object-rest-spread',
  '@babel/plugin-syntax-numeric-separator',
  '@babel/plugin-syntax-optional-chaining',
  '@babel/plugin-syntax-nullish-coalescing-operator',
  '@babel/plugin-syntax-optional-catch-binding',
];

function transform(
  code /*: string*/,
  options /*: TransformOptions*/,
  plugins /*: BabelPluginList */,
  presets  /*: BabelPresetList */
)/*: void*/ {
  const opts = {
    ast: false,
    code: false,
    filename: options.filename,
    plugins: defaultSyntaxPlugins.concat(plugins, [['babel-plugin-fbt', options]]),
    presets,
    sourceType: 'unambiguous',
  };
  babel.transformSync(code, opts);
}

module.exports = transform;
