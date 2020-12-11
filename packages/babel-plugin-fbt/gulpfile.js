/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @noflow
 */

'use strict';

const {PLUGINS} = require('../babelPlugins');
const del = require('del');
const gulp = require('gulp');
const babel = require('gulp-babel');
const gulpOnce = require('gulp-once');
const rename = require('gulp-rename');
const path = require('path');

const paths = {
  root: ['**/*.js', '!dist/**', '!gulpfile.js', '!node_modules/**'],
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

gulp.task(
  'build',
  gulp.parallel(
    function babelPluginFbt_buildDistJS() {
      return src(paths.root, {
        follow: true,
      })
        .pipe(once())
        .pipe(
          babel({
            plugins: PLUGINS,
          }),
        )
        .pipe(dest(paths.dist));
    },
    function babelPluginFbt_buildDistFlowJS() {
      return src(paths.root, {
        follow: true,
      })
        .pipe(rename({extname: '.js.flow'}))
        .pipe(once())
        .pipe(dest(paths.dist));
    },
  ),
);

gulp.task('watch', () => {
  gulp.watch(
    paths.root,
    {
      cwd: __dirname,
      ignoreInitial: false,
    },
    function watchBabelPluginFbt(done) {
      gulp.task('build')(done);
    },
  );
});

gulp.task(
  'clean',
  gulp.series(() =>
    del(
      [
        path.join(__dirname, checksumFile),
        path.join(__dirname, paths.dist, '*'),
      ],
      {force: true},
    ),
  ),
);

gulp.task('default', gulp.series('build'));

module.exports = {
  build: gulp.task('build'),
  clean: gulp.task('clean'),
  watch: gulp.task('watch'),
};
