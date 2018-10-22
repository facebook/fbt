/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Started by the parent `fbt()` calls visitor (`fbt.CallExpression`) to visit
 * all children with method calls (fbt.param, fbt.enum, etc). Also collects
 * these calls into `params` and `enums` for further processing by parent
 * visitor.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p babel_plugin_fbt --remote localhost:~/www
 *
 * @emails oncall+internationalization
 * @format
 */
'use strict';

/* eslint fb-www/comma-dangle: "off" */
// See explaination in /js/fb-transforms/babel-7/babel-plugin-fbt/index.js

const {
  ValidPluralOptions,
  ValidPronounOptions,
  ValidPronounUsages,
} = require('./FbtConstants');
const FbtNodeChecker = require('./FbtNodeChecker');
const {
  collectOptions,
  getOptionBooleanValue,
  getRawSource,
  getVariationValue,
  nest,
  throwAt,
  verifyUniqueToken,
} = require('./FbtUtil');
const PLURAL_PARAM_TOKEN = 'number';

/**
 * Variations.
 */
const Variation = {
  number: 0,
  gender: 1,
};

/**
 * Map of alias to module name.
 */
const fbtEnumRequireMap = {};

let enumManifest;

function setEnumManifest(manifest) {
  enumManifest = manifest;
}

function setFbtEnumRequireMap(alias, moduleName) {
  fbtEnumRequireMap[alias] = moduleName;
}

const call = function(t, moduleName) {
  function fbtCallExpression(name, args) {
    return t.callExpression(
      t.memberExpression(
        t.identifier(moduleName),
        t.identifier('_' + name),
        false,
      ),
      args,
    );
  }

  return {
    CallExpression(path) {
      const node = path.node;
      const runtimeArgs = this.runtimeArgs;
      const variations = this.variations;

      const callee = node.callee;

      if (!FbtNodeChecker.forModule(moduleName).isMemberExpression(callee)) {
        return;
      }

      if (callee.property.type !== 'Identifier') {
        throwAt(
          callee.property,
          `Expected ${moduleName} method to be an identifier, but got ` +
            callee.property.type,
        );
      }

      if (
        callee.property.name === 'param' ||
        callee.property.name === 'sameParam'
      ) {
        if (node.arguments[0].type !== 'StringLiteral') {
          throwAt(
            node.arguments[0],
            `Expected first argument to ${moduleName}.param to be a string, but got ` +
              node.arguments[0].type,
          );
        }
        // Collect params only if it's original one (not "sameParam").
        if (callee.property.name === 'param') {
          runtimeArgs.push(fbtCallExpression('param', node.arguments));
          verifyUniqueToken(moduleName, node.arguments[0].value, this.paramSet);
        }

        // Variation case. Replace:
        // {number: true}     -> {type: "number", token: <param-name>}
        // {gender: <gender>} -> {type: "gender", token: <param-name>}
        if (node.arguments.length === 3) {
          const paramName = node.arguments[0].value;
          const variationInfo = node.arguments[2].properties[0];
          const variationName =
            variationInfo.key.name || variationInfo.key.value;
          variations[paramName] = {
            type: variationName,
            token: paramName,
          };
          const variationValues = [t.numericLiteral(Variation[variationName])];
          const variationValue = getVariationValue(
            moduleName,
            variationName,
            variationInfo,
          );
          if (variationValue) {
            variationValues.push(variationValue);
          }
          // The actual value of the variation, e.g. [0] for number,
          // or [1, <gender>] for gender.
          node.arguments[2] = t.arrayExpression(variationValues);
          return;
        }

        // Else, simple param, encoded directly into
        // the string as {<param-name>}.
        path.replaceWith(t.stringLiteral('{' + node.arguments[0].value + '}'));
      } else if (callee.property.name === 'enum') {
        this.hasTable = true;
        // `enum` is a reserved word so it should be quoted.

        const rangeArg = node.arguments[1];
        let runtimeRange = rangeArg;
        let rangeProps;
        if (t.isArrayExpression(rangeArg)) {
          rangeProps = rangeArg.elements.map(v => t.objectProperty(v, v));
          runtimeRange = t.objectExpression(rangeProps);
        } else if (t.isObjectExpression(rangeArg)) {
          rangeProps = rangeArg.properties.map(prop => {
            if (t.isIdentifier(prop.key)) {
              return t.objectProperty(
                t.stringLiteral(prop.key.name),
                prop.value,
              );
            } else {
              return prop;
            }
          });
          runtimeRange = t.objectExpression(rangeProps);
        } else if (t.isIdentifier(rangeArg)) {
          const enumModule = fbtEnumRequireMap[rangeArg.name];
          rangeProps = Object.keys(enumManifest[enumModule]).map(key => {
            return t.objectProperty(
              t.stringLiteral(key),
              t.stringLiteral(enumManifest[enumModule][key]),
            );
          });
        } else {
          throwAt(
            rangeArg,
            `Expected an array or object as a second argument in \`${moduleName}.enum\``,
          );
        }
        // Normalize enum range into a dictionary format for table creation
        node.arguments[1] = t.objectExpression(rangeProps);

        // Keep track of duplicate enums, and only add unique entries to
        // our runtime argument list.  Duplicates will not be added to
        // our table as keys.
        const rawValue = getRawSource(this.src, node.arguments[0]);
        const usedVal = nest(this, 'usedEnums')[rawValue];
        if (!usedVal) {
          this.usedEnums[rawValue] = true;
          runtimeArgs.push(
            fbtCallExpression('enum', [node.arguments[0], runtimeRange]),
          );
        }
      } else if (callee.property.name === 'plural') {
        this.hasTable = true;
        const count = node.arguments[1];
        const options = collectOptions(
          moduleName,
          t,
          node.arguments[2],
          ValidPluralOptions,
        );
        const pluralArgs = [count];
        if (options.showCount && options.showCount !== 'no') {
          const name = options.name || PLURAL_PARAM_TOKEN;
          verifyUniqueToken(moduleName, name, this.paramSet);
          pluralArgs.push(t.stringLiteral(name));
          if (options.value) {
            pluralArgs.push(options.value);
          }
        }
        runtimeArgs.push(fbtCallExpression('plural', pluralArgs));
      } else if (callee.property.name === 'pronoun') {
        // Usage: fbt.pronoun(usage, gender [, options])
        // - enum string usage
        //    e.g. 'object', 'possessive', 'reflexive', 'subject'
        // - enum int gender
        //    e.g. GenderConst.MALE_SINGULAR, FEMALE_SINGULAR, etc.

        this.hasTable = true;

        if (node.arguments.length < 2 || 3 < node.arguments.length) {
          throwAt(
            node,
            `Expected '(usage, gender [, options])' arguments to ${moduleName}.pronoun`,
          );
        }

        const usageExpr = node.arguments[0];
        if (usageExpr.type !== 'StringLiteral') {
          throwAt(
            node,
            `First argument to ${moduleName}.pronoun must be a StringLiteral, got ` +
              usageExpr.type,
          );
        }
        if (!ValidPronounUsages.hasOwnProperty(usageExpr.value)) {
          const usages = Object.keys(ValidPronounUsages);
          throwAt(
            usageExpr,
            `First argument to ${moduleName}.pronoun must be one of [${usages}], ` +
              `got ${usageExpr.value}`,
          );
        }
        const numericUsageExpr = t.numericLiteral(
          ValidPronounUsages[usageExpr.value],
        );
        const genderExpr = node.arguments[1];
        const pronounArgs = [numericUsageExpr, genderExpr];

        const optionsExpr = node.arguments[2];
        const options = collectOptions(
          moduleName,
          t,
          optionsExpr,
          ValidPronounOptions,
        );
        if (getOptionBooleanValue(options, 'human')) {
          pronounArgs.push(
            t.objectExpression([
              t.objectProperty(t.identifier('human'), t.numericLiteral(1)),
            ]),
          );
        }

        runtimeArgs.push(fbtCallExpression('pronoun', pronounArgs));
      } else if (callee.property.name === 'name') {
        if (node.arguments[0].type !== 'StringLiteral') {
          throwAt(
            node.arguments[0],
            `Expected first argument to ${moduleName}.name to be a string, but got ` +
              node.arguments[0].type,
          );
        }
        if (node.arguments.length < 3) {
          throwAt(
            node,
            `Missing arguments. Must have three arguments: label, value, gender`,
          );
        }
        const paramName = node.arguments[0].value;
        variations[paramName] = {
          type: 'gender',
          token: paramName,
        };
        runtimeArgs.push(fbtCallExpression('name', node.arguments));
      } else {
        throwAt(
          callee.property,
          `Unknown ${moduleName} method ${callee.property.name}`,
        );
      }
    },
  };
};

module.exports = {
  setEnumManifest,
  setFbtEnumRequireMap,
  call,
};
