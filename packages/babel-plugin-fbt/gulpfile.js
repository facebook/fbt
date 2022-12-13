/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @noflow
 * @oncall i18n_devex
 */

'use strict';

const setGeneratedFilePragmas = require('../../setGeneratedFilePragmas');
const del = require('del');
const gulp = require('gulp');
const babel = require('gulp-babel');
const gulpOnce = require('gulp-once');
const rename = require('gulp-rename');
const path = require('path');

const ONCALL_ID = 'i18n_fbt_oss';

const paths = {
  src: {
    js: ['src/**/*.js', '!dist/**', '!gulpfile.js', '!node_modules/**'],
    json: ['src/**/*.json', '!dist/**', '!node_modules/**'],
  },
  dist: 'dist',
};

const checksumFile = '.checksums';
const once = () => gulpOnce({file: path.join(__dirname, checksumFile)});

const src = (glob, opts) =>
  gulp.src(glob, {
    cwd: __dirname,
    ...opts,
  });

const dest = (glob, opts) =>
  gulp.dest(glob, {
    cwd: __dirname,
    ...opts,
  });

const babelPluginFbt_buildDistJS = () =>
  src(paths.src.js, {
    follow: true,
  })
    .pipe(once())
    .pipe(setGeneratedFilePragmas(ONCALL_ID))
    .pipe(
      babel({
        plugins: [
          require('@babel/plugin-proposal-optional-catch-binding'),
          require('@babel/plugin-proposal-class-properties'),
          [require('@babel/plugin-syntax-flow'), {enums: true}],
          require('babel-plugin-transform-flow-enums'),
          require('babel-preset-fbjs/plugins/dev-expression'),
          require('@babel/plugin-proposal-nullish-coalescing-operator'),
          require('@babel/plugin-proposal-optional-chaining'),
          require('@babel/plugin-transform-flow-strip-types'),
        ],
      }),
    )
    .pipe(dest(paths.dist));

const babelPluginFbt_buildDistFlowJS = () =>
  src(paths.src.js, {
    follow: true,
  })
    .pipe(rename({extname: '.js.flow'}))
    .pipe(once())
    .pipe(setGeneratedFilePragmas(ONCALL_ID))
    .pipe(dest(paths.dist));

const babelPluginFbt_copyJsonToDist = () =>
  src(paths.src.json, {follow: true}).pipe(once()).pipe(dest(paths.dist));

gulp.task(
  'build',
  gulp.parallel(
    babelPluginFbt_buildDistJS,
    babelPluginFbt_buildDistFlowJS,
    babelPluginFbt_copyJsonToDist,
  ),
);

gulp.task('watch', () => {
  gulp.watch(
    paths.src.js.concat(paths.src.json),
    {
      cwd: __dirname,
      ignoreInitial: false,
    },
    function watchBabelPluginFbt(done) {
      gulp.task('build')(done);
    },
  );
});

const babelPluginFbt_clean = () =>
  del(
    [path.join(__dirname, checksumFile), path.join(__dirname, paths.dist, '*')],
    {force: true},
  );
gulp.task('clean', gulp.series(babelPluginFbt_clean));

gulp.task('default', gulp.series('build'));

module.exports = {
  build: gulp.task('build'),
  clean: gulp.task('clean'),
  watch: gulp.task('watch'),
};
