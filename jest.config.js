/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @noflow
 * @emails oncall+internationalization
 */

const fs = require('fs');
const path = require('path');
const runtimePaths = [
  '<rootDir>/runtime/shared',
  '<rootDir>/runtime/shared/FbtNumber',
  '<rootDir>/runtime/nonfb',
  '<rootDir>/runtime/nonfb/mocks',
];
const {PLUGINS} = require('./babelPlugins');

const globalConfig = {
  setupFiles: ['fbjs-scripts/jest/environment.js'],
  timers: 'fake',
  transform: {
    '\\.js$': '<rootDir>/jest-preprocessor.js',
  },
  moduleNameMapper: {
    '^FBLocaleToLang$': '<rootDir>/runtime/nonfb/FBLocaleToLang',
  },
};

module.exports = {
  rootDir: '',
  projects: [
    {
      displayName: 'babel-plugin-fbt',
      roots: [
        fs.realpathSync(path.resolve('packages', 'babel-plugin-fbt', 'dist')),
      ],
      snapshotResolver:
        '<rootDir>/packages/babel-plugin-fbt/jest.snapshotResolver.js',
    },
    {
      displayName: 'babel-plugin-fbt-runtime',
      roots: [
        fs.realpathSync(path.resolve('packages', 'babel-plugin-fbt-runtime')),
      ],
    },
    {
      displayName: 'fbt-runtime',
      roots: [fs.realpathSync(path.resolve('packages', 'fbt', 'lib'))],
      modulePaths: [fs.realpathSync(path.resolve('packages', 'fbt', 'lib'))],
    },
    {
      displayName: 'gulp-rewrite-flowtyped-modules',
      roots: [fs.realpathSync(path.resolve('packages', 'gulp-rewrite-flowtyped-modules'))],
    },
    {
      displayName: 'gulp-strip-docblock-pragmas',
      roots: [fs.realpathSync(path.resolve('packages', 'gulp-strip-docblock-pragmas'))],
    },
    {
      displayName: 'fb-tiger-hash',
      roots: [fs.realpathSync(path.resolve('packages', 'fb-tiger-hash'))],
      testRegex: '/__tests__/.*\\.js$',
      transform: {
        '\\.js$': [
          '<rootDir>/jest-preprocessor.js',
          {plugins: ['@babel/plugin-syntax-bigint']},
        ],
      },
    },
    {
      displayName: 'demo-app',
      setupFiles: [
        'fbjs-scripts/jest/environment.js',
        '<rootDir>/demo-app/run_all.js',
      ],
      roots: ['<rootDir>/demo-app'],
      modulePaths: [
        '<rootDir>/demo-app/src',
        '<rootDir>/demo-app/src/example',
      ].concat(runtimePaths),
      transformIgnorePatterns: [
        '/node_modules/',
        '<rootDir>/demo-app/run_all\\.js',
      ],
      moduleNameMapper: {
        ...globalConfig.moduleNameMapper,
        '\\.(css)$': '<rootDir>/demo-app/jest/css.js',
      },
      timers: 'fake',
      transform: {
        '\\.js$': [
          '<rootDir>/jest-preprocessor.js',
          {
            plugins: [
              [
                'babel-plugin-fbt',
                {fbtEnumPath: path.resolve('demo-app', '.enum_manifest.json')},
              ],
              'babel-plugin-fbt-runtime',
            ],
          },
        ],
      },
    },
  ].map(project => ({...globalConfig, ...project})),
};
