/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Started by the parent `fbt()` calls visitor (`fbt.CallExpression`) to visit
 * all children with method calls (fbt.param, fbt.enum, etc). Also collects
 * these calls into `params` and `enums` for further processing by parent
 * visitor.
 *
 * @emails oncall+internationalization
 * @format
 * @noflow
 */
/*eslint max-len: ["error", 100]*/

'use strict';

/* eslint fb-www/comma-dangle: "off" */
// See explanation in ./index.js

const {
  ValidPluralOptions,
  ValidPronounOptions,
  ValidPronounUsages,
} = require('./FbtConstants');
const FbtEnumRegistrar = require('./FbtEnumRegistrar');
const FbtNodeChecker = require('./FbtNodeChecker');
const {
  collectOptions,
  errorAt,
  getOptionBooleanValue,
  getRawSource,
  getVariationValue,
  setUniqueToken,
} = require('./FbtUtil');
const PLURAL_PARAM_TOKEN = 'number';
const t = require('@babel/types');

/**
 * Variations.
 */
const Variation = {
  number: 0,
  gender: 1,
};

const call = function (moduleName) {
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
      const {node} = path;
      const {arguments: args, callee} = node;
      const [arg0, arg1, arg2] = args;
      const {runtimeArgs, variations} = this;

      if (!FbtNodeChecker.forModule(moduleName).isMemberExpression(callee)) {
        // We're not invoking a member function from the fbt/fbs module
        return;
      }

      const construct = callee.property;
      const constructName = construct.name;
      if (construct.type !== 'Identifier') {
        throw errorAt(
          construct,
          `Expected ${moduleName} method to be an identifier, but got ` +
            construct.type,
        );
      }

      if (constructName === 'param' || constructName === 'sameParam') {
        if (arg0.type !== 'StringLiteral') {
          throw errorAt(
            arg0,
            `Expected first argument to ${moduleName}.param to be a string, but got ` +
              arg0.type,
          );
        }
        // Collect params only if it's original one (not "sameParam").
        if (constructName === 'param') {
          runtimeArgs.push(fbtCallExpression('param', args));
          setUniqueToken(node, moduleName, arg0.value, this.paramSet);
        }

        // Variation case. Replace:
        // {number: true}     -> {type: "number", token: <param-name>}
        // {gender: <gender>} -> {type: "gender", token: <param-name>}
        if (args.length === 3) {
          const paramName = arg0.value;
          // TODO(T69419475): detect variation type by property name instead
          // of expecting it to be the first object property
          const variationInfo = arg2.properties[0];
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
          args[2] = t.arrayExpression(variationValues);
          return;
        }

        // Else, simple param, encoded directly into
        // the string as {<param-name>}.
        path.replaceWith(t.stringLiteral('{' + arg0.value + '}'));
      } else if (constructName === 'enum') {
        this.hasTable = true;
        // `enum` is a reserved word so it should be quoted.

        const rangeArg = arg1;
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
          const manifest = FbtEnumRegistrar.getEnum(rangeArg.name);
          if (manifest == null) {
            throw errorAt(
              rangeArg,
              `Fbt Enum \`${rangeArg.name}\` not registered, ensure the enum ` +
                `was correctly imported.`,
            );
          }
          rangeProps = Object.keys(manifest).map(key => {
            return t.objectProperty(
              t.stringLiteral(key),
              t.stringLiteral(manifest[key]),
            );
          });
        } else {
          throw errorAt(
            rangeArg,
            `Expected an array or object as a second argument in \`${moduleName}.enum\``,
          );
        }
        // Normalize enum range into a dictionary format for table creation
        args[1] = t.objectExpression(rangeProps);

        // Keep track of duplicate enums, and only add unique entries to
        // our runtime argument list.  Duplicates will not be added to
        // our table as keys.
        const rawValue = getRawSource(this.fileSource, arg0);

        const usedVal = this.usedEnums[rawValue];
        if (!usedVal) {
          this.usedEnums[rawValue] = true;
          runtimeArgs.push(fbtCallExpression('enum', [arg0, runtimeRange]));
        }
      } else if (constructName === 'plural') {
        this.hasTable = true;
        const count = arg1;
        const options = collectOptions(moduleName, arg2, ValidPluralOptions);
        const pluralArgs = [count];
        if (options.showCount && options.showCount !== 'no') {
          const name = options.name || PLURAL_PARAM_TOKEN;
          setUniqueToken(node, moduleName, name, this.paramSet);
          pluralArgs.push(t.stringLiteral(name));
          if (options.value) {
            pluralArgs.push(options.value);
          }
        }
        runtimeArgs.push(fbtCallExpression('plural', pluralArgs));
      } else if (constructName === 'pronoun') {
        // Usage: fbt.pronoun(usage, gender [, options])
        // - enum string usage
        //    e.g. 'object', 'possessive', 'reflexive', 'subject'
        // - enum int gender
        //    e.g. GenderConst.MALE_SINGULAR, FEMALE_SINGULAR, etc.

        this.hasTable = true;

        if (args.length < 2 || 3 < args.length) {
          throw errorAt(
            node,
            `Expected '(usage, gender [, options])' arguments to ${moduleName}.pronoun`,
          );
        }

        const usageExpr = arg0;
        if (usageExpr.type !== 'StringLiteral') {
          throw errorAt(
            node,
            `First argument to ${moduleName}.pronoun must be a StringLiteral, got ` +
              usageExpr.type,
          );
        }
        if (!ValidPronounUsages.hasOwnProperty(usageExpr.value)) {
          const usages = Object.keys(ValidPronounUsages);
          throw errorAt(
            usageExpr,
            `First argument to ${moduleName}.pronoun must be one of [${usages}], ` +
              `got ${usageExpr.value}`,
          );
        }
        const numericUsageExpr = t.numericLiteral(
          ValidPronounUsages[usageExpr.value],
        );
        const genderExpr = arg1;
        const pronounArgs = [numericUsageExpr, genderExpr];

        const optionsExpr = arg2;
        const options = collectOptions(
          moduleName,
          optionsExpr,
          ValidPronounOptions,
        );
        if (getOptionBooleanValue(options, 'human', optionsExpr)) {
          pronounArgs.push(
            t.objectExpression([
              t.objectProperty(t.identifier('human'), t.numericLiteral(1)),
            ]),
          );
        }

        runtimeArgs.push(fbtCallExpression('pronoun', pronounArgs));
      } else if (constructName === 'name') {
        if (arg0.type !== 'StringLiteral') {
          throw errorAt(
            arg0,
            `Expected first argument to ${moduleName}.name to be a string, but got ` +
              arg0.type,
          );
        }
        if (args.length < 3) {
          throw errorAt(
            node,
            `Missing arguments. Must have three arguments: label, value, gender`,
          );
        }
        const paramName = arg0.value;
        variations[paramName] = {
          type: 'gender',
          token: paramName,
        };
        runtimeArgs.push(fbtCallExpression('name', args));
      } else {
        throw errorAt(
          construct,
          `Unknown ${moduleName} method ${constructName}`,
        );
      }
    },
  };
};

module.exports = {
  call,
};
