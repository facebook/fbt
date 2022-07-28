/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @format
 * @oncall i18n_fbt_js
 */

const invariant = require('invariant');

jest
  .unmock('FbtEnv')
  .unmock('FbtTable')
  .unmock('FbtTableAccessor')
  .unmock('intlNumUtils')
  .unmock('IntlPhonologicalRewrites')
  .unmock('IntlPunctuation')
  .unmock('IntlVariationResolver')
  .unmock('IntlVariationResolverImpl')
  .unmock('NumberFormatConsts')
  .unmock('substituteTokens')
  .mock('FbtNumberType');

const fbtRuntime = jest.requireActual('fbt');

const WRAPPER = '__FBT__';

const fbt = jest.fn().mockImplementation(function () {
  throw new Error('should never be called');
});

/**
 * Algorithm copied from coerceToTableJSFBTTreeLeaf() in babel-plugin-fbt/src/JSFbtUtil.js
 * @return `true` if given object matches the TableJSFBTTreeLeaf shape
 */
function isTableJSFBTTreeLeaf(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.desc === 'string' &&
    typeof value.text === 'string' &&
    (typeof value.tokenAliases === 'object' || value.tokenAliases == null)
  );
}

function jsfbtLeafToPatternString(leaf) {
  const {tokenAliases} = leaf;
  return tokenAliases
    ? Object.keys(tokenAliases).reduce((mangledText, clearToken) => {
        const clearTokenName = `{${clearToken}}`;
        const mangledTokenName = `{${tokenAliases[clearToken]}}`;
        // String.prototype.replaceAll exists in modern browsers but only in node.js v15+
        return typeof String.prototype.replaceAll === 'function'
          ? mangledText.replaceAll(clearTokenName, mangledTokenName)
          : mangledText.split(clearTokenName).join(mangledTokenName);
      }, leaf.text)
    : leaf.text;
}

/**
 * Converts JSFBT leaf objects into the mangled text (type: PatternString)
 * @return JSFBT structure that emulates the output of MakeHaste or the fbt-translate transform
 */
function transformJSFBTLeaves(tree) {
  if (typeof tree === 'string') {
    return tree;
  }
  if (isTableJSFBTTreeLeaf(tree)) {
    return jsfbtLeafToPatternString(tree);
  }

  for (const key of Object.keys(tree)) {
    tree[key] = transformJSFBTLeaves(tree[key]);
  }
  return tree;
}

function unwrap(json) {
  let payload;
  try {
    payload = JSON.parse(json.slice(WRAPPER.length, -WRAPPER.length));
  } catch (ex) {
    throw new Error('Invalid FBT JSON: ' + json + ' (' + ex.message + ')');
  }
  if (payload.jsfbt && typeof payload.jsfbt === 'object') {
    try {
      payload.jsfbt.t = transformJSFBTLeaves(payload.jsfbt.t);
    } catch (error) {
      error.message += `\nJSFBT payload was: ${JSON.stringify(
        payload.jsfbt,
        null,
        2,
      )}`;
      throw error;
    }
  }
  return payload;
}

fbt._ = jest.fn().mockImplementation(
  // Do not use arrow function because we need `this` to refer to whatever runtime context
  // we'll be having later.
  // We expect `this` to be either from the usual fbt.js or from fbs.js
  function (wrappedJSON, args) {
    const unwrappedJson = unwrap(wrappedJSON);
    const jsfbt = unwrappedJson.jsfbt;
    return fbtRuntime._.call(
      this,
      unwrappedJson.type === 'text' ? jsfbt : jsfbt.t,
      args,
    );
  },
);

fbt._.getCallString = index => unwrap(fbt._.mock.calls[index][0]);

[
  '_enum',
  '_implicitParam',
  '_name',
  '_param',
  '_plural',
  '_pronoun',
  '_subject',
  '_wrapContent',
  'isFbtInstance',
].forEach(methodName => {
  invariant(
    typeof fbtRuntime[methodName] === 'function',
    'Expected method fbt.%s() to be defined',
    methodName,
  );
  fbt[methodName] = fbtRuntime[methodName];
});

module.exports = fbt;
