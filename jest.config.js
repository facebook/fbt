/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 * @format
 */
const fs = require('fs');
const path = require('path');
const runtimePaths = [
  '<rootDir>/runtime/shared',
  '<rootDir>/runtime/shared/FbtNumber',
  '<rootDir>/runtime/nonfb',
  '<rootDir>/runtime/nonfb/mocks',
];

const globalConfig = {
  setupFiles: ['fbjs-scripts/jest/environment.js'],
  timers: 'fake',
};

module.exports = {
  rootDir: '',
  projects: [
    {
      displayName: 'babel-plugin-fbt',
      roots: [fs.realpathSync('transform/babel-plugin-fbt')],
      transform: {'\\.js$': 'fbjs-scripts/jest/preprocessor.js'},
    },
    {
      displayName: 'babel-plugin-fbt-runtime',
      roots: [fs.realpathSync('transform/babel-plugin-fbt-runtime')],
      transform: {'\\.js$': 'fbjs-scripts/jest/preprocessor.js'},
    },
    {
      displayName: 'fb-tiger-hash',
      roots: ['<rootDir>/fb-tiger-hash'],
      transform: {
        '\\.js$': [
          '<rootDir>/jest-preprocessor.js',
          {plugins: ['@babel/plugin-syntax-bigint']},
        ],
      },
    },
    {
      displayName: 'demo-app',
      roots: ['<rootDir>/demo-app'],
      modulePaths: [
        '<rootDir>/demo-app/src',
        '<rootDir>/demo-app/src/example',
      ].concat(runtimePaths),
      testPathIgnorePatterns: ['/output/', '/node_modules/'],
      moduleNameMapper: {
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
  ].map(project => Object.assign(project, globalConfig)),
};
