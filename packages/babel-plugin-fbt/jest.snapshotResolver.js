/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * See https://jestjs.io/docs/en/configuration#snapshotresolver-string
 *
 * @format
 * @noflow
 * @oncall i18n_fbt_js
 */

'use strict';

const paths = {
  babelPluginFbt: {
    dist: '/packages/babel-plugin-fbt/dist/',
    src: '/packages/babel-plugin-fbt/src/',
  },
  snapshotDir: '__snapshots__',
  patterns: {
    test: /(\/__tests__\/)(?!.*__tests__\/.*)(.*\/)*([^/]+)$/,
    snapshot: /(\/__snapshots__\/)(?!.*__snapshots__\/.*)([^/]+)$/,
  },
};

module.exports = {
  // resolves from test to snapshot path
  resolveSnapshotPath: (testPath, snapshotExtension) => {
    return (
      testPath
        .replace(paths.babelPluginFbt.dist, paths.babelPluginFbt.src)
        .replace(paths.patterns.test, '$1$2' + paths.snapshotDir + '/$3') +
      snapshotExtension
    );
  },

  // resolves from snapshot to test path
  resolveTestPath: (snapshotFilePath, snapshotExtension) => {
    return snapshotFilePath
      .replace(paths.babelPluginFbt.src, paths.babelPluginFbt.dist)
      .replace(paths.patterns.snapshot, '/$2')
      .slice(0, -snapshotExtension.length);
  },

  // Example test path, used for preflight consistency check of the implementation above
  testPathForConsistencyCheck:
    __dirname +
    '/packages/babel-plugin-fbt/dist/__tests__/foo/bar/__tests__/baz/fbs-test.js',
};
