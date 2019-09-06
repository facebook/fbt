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

const babelPresets = require('./babelPresets');
const packageData = require('./package.json');
const del = require('del');
const gulp = require('gulp');
const babel = require('gulp-babel');
const cleanCSS = require('gulp-clean-css');
const concatCSS = require('gulp-concat-css');
const derequire = require('gulp-derequire');
const flatten = require('gulp-flatten');
const header = require('gulp-header');
const gulpif = require('gulp-if');
const rename = require('gulp-rename');
const gulpUtil = require('gulp-util');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpackStream = require('webpack-stream');

const paths = {
  published: 'fbt-runtime',
  dist: 'fbt-runtime/dist',
  lib: 'fbt-runtime/lib',
  license: 'LICENSE',
  runtime: [
    'runtime/**/*.js',
    '!runtime/**/__tests__/*',
    '!runtime/**/__mocks__/*',
  ],
  css: ['runtime/**/*.css'],
};

const babelOptsJS = {
  presets: [babelPresets()],
};

const babelOptsFlow = {
  presets: [babelPresets({flow: true})],
};
const COPYRIGHT = 'Copyright (c) Facebook, Inc. and its affiliates.';

const COPYRIGHT_HEADER = `/**
 * fbt v<%= version %>
 *
 * ${COPYRIGHT}
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
`;

const buildDist = function(opts) {
  const webpackOpts = {
    externals: {},
    output: {
      filename: opts.output,
      libraryTarget: 'umd',
      library: 'fbt',
    },
    plugins: [
      new webpackStream.webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          opts.debug ? 'development' : 'production',
        ),
      }),
      new webpackStream.webpack.LoaderOptionsPlugin({
        debug: opts.debug,
      }),
    ],
    optimization: {
      minimize: !opts.debug,
    },
  };

  if (!opts.debug) {
    webpackOpts.plugins.push(new UglifyJsPlugin());
  }

  return webpackStream(webpackOpts, null, function(err, stats) {
    if (err) {
      throw new gulpUtil.PluginError('webpack', err);
    }
    if (stats.compilation.errors.length) {
      gulpUtil.log('webpack', '\n' + stats.toString({colors: true}));
    }
  });
};

gulp.task(
  'license',
  gulp.series(function() {
    return gulp.src(paths.license).pipe(gulp.dest(paths.published));
  }),
);

gulp.task(
  'modules',
  gulp.series(function() {
    return gulp
      .src(paths.runtime, {follow: true})
      .pipe(babel(babelOptsJS))
      .pipe(flatten())
      .pipe(gulp.dest(paths.lib));
  }),
);

gulp.task(
  'flow',
  gulp.series(function() {
    return gulp
      .src(paths.runtime, {follow: true})
      .pipe(babel(babelOptsFlow))
      .pipe(flatten())
      .pipe(rename({extname: '.js.flow'}))
      .pipe(gulp.dest(paths.lib));
  }),
);

gulp.task(
  'css',
  gulp.series(function() {
    return gulp
      .src(paths.css, {follow: true})
      .pipe(concatCSS('fbt.css'))
      .pipe(cleanCSS({advanced: false}))
      .pipe(header(COPYRIGHT_HEADER, {version: packageData.version}))
      .pipe(gulp.dest(paths.lib));
  }),
);

gulp.task(
  'dist',
  gulp.series('modules', 'css', function() {
    const opts = {
      debug: true,
      output: 'fbt.js',
    };
    return gulp
      .src('./fbt-runtime/lib/FbtPublic.js')
      .pipe(buildDist(opts))
      .pipe(derequire())
      .pipe(
        gulpif(
          '*.js',
          header(COPYRIGHT_HEADER, {version: packageData.version}),
        ),
      )
      .pipe(gulp.dest(paths.dist));
  }),
);

gulp.task(
  'dist:min',
  gulp.series('modules', function() {
    const opts = {
      debug: false,
      output: 'fbt.min.js',
    };
    return gulp
      .src('./fbt-runtime/lib/FbtPublic.js')
      .pipe(buildDist(opts))
      .pipe(
        gulpif(
          '*.js',
          header(COPYRIGHT_HEADER, {version: packageData.version}),
        ),
      )
      .pipe(gulp.dest(paths.dist));
  }),
);

gulp.task(
  'clean',
  gulp.series(function() {
    return del([
      paths.published + '/*',
      '!' + paths.published + '/package.json',
    ]);
  }),
);

gulp.task(
  'lib',
  gulp.series(
    'clean',
    gulp.parallel('license', 'modules', 'flow'),
    gulp.series('dist', 'dist:min'),
  ),
);
