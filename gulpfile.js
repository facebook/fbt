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

const {PLUGINS} = require('./babelPlugins');
const moduleMap = require('./moduleMap');
const babelPluginFbtGulp = require('./packages/babel-plugin-fbt/gulpfile');
const {version} = require('./packages/fbt/package.json');
const del = require('del');
const gulp = require('gulp');
const babel = require('gulp-babel');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const derequire = require('gulp-derequire');
const flatten = require('gulp-flatten');
const header = require('gulp-header');
const gulpif = require('gulp-if');
const once = require('gulp-once');
const rename = require('gulp-rename');
const rewriteModules = require('gulp-rewrite-flowtyped-modules');
const gulpUtil = require('gulp-util');
const webpackStream = require('webpack-stream');

const paths = {
  published: 'packages/fbt',
  dist: 'packages/fbt/dist',
  lib: 'packages/fbt/lib',
  license: 'LICENSE',
  runtime: [
    'runtime/**/*.js',
    '!runtime/**/__tests__/*',
    '!runtime/**/__mocks__/*',
  ],
  runtimeTests: ['runtime/nonfb/**/__tests__/*'],
  runtimeMocks: ['runtime/nonfb/**/__mocks__/*'],
  typedModules: ['flow-types/typed-js-modules/*.flow'],
  css: ['runtime/**/*.css'],
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

const buildDist = function (opts) {
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

  return webpackStream(webpackOpts, null, function (err, stats) {
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
  gulp.series(function () {
    return gulp.src(paths.license).pipe(gulp.dest(paths.published));
  }),
);

function flatLib(job) {
  return job.pipe(flatten()).pipe(gulp.dest(paths.lib));
}

gulp.task(
  'modules',
  gulp.series(babelPluginFbtGulp.build, function buildModules() {
    return flatLib(
      gulp
        .src(paths.runtime, {follow: true})
        .pipe(once())
        .pipe(
          babel({
            plugins: [
              ...PLUGINS,
              require('@babel/plugin-syntax-jsx'),
              require('babel-plugin-fbt'),
              require('babel-plugin-fbt-runtime'),
              [
                require('babel-preset-fbjs/plugins/rewrite-modules'),
                {map: moduleMap},
              ],
              require('@babel/plugin-transform-react-jsx'),
            ],
          }),
        ),
    );
  }),
);

const babelTestPresets = {
  plugins: [
    ...PLUGINS,
    '@babel/plugin-syntax-jsx',
    // TODO #81682213 - Bring in shared runtime tests
    // The fbtCommon map below is only applicable to fbt-test.js, which doesn't
    // yet run in github
    ['babel-plugin-fbt', {fbtCommon: {Accept: '...'}}],
    'babel-plugin-fbt-runtime',
    '@babel/plugin-transform-react-jsx',
  ],
};

gulp.task(
  'test-modules',
  gulp.series(
    babelPluginFbtGulp.build,
    gulp.parallel(
      function buildRuntimeTests() {
        return gulp
          .src(paths.runtimeTests, {follow: true})
          .pipe(once())
          .pipe(babel(babelTestPresets))
          .pipe(flatten())
          .pipe(gulp.dest(paths.lib + '/__tests__'));
      },
      function buildRuntimeMocks() {
        return gulp
          .src(paths.runtimeMocks, {follow: true})
          .pipe(once())
          .pipe(babel(babelTestPresets))
          .pipe(flatten())
          .pipe(gulp.dest(paths.lib + '/__mocks__'));
      },
    ),
  ),
);

// Copy raw source with rewritten modules to *.js.flow
gulp.task(
  'flow',
  gulp.parallel(
    () =>
      flatLib(
        gulp
          .src(paths.runtime, {follow: true})
          .pipe(rename({extname: '.js.flow'}))
          .pipe(rewriteModules({map: moduleMap})),
      ),
    () => flatLib(gulp.src(paths.typedModules, {follow: true})),
  ),
);

gulp.task(
  'css',
  gulp.series(function () {
    return gulp
      .src(paths.css, {follow: true})
      .pipe(concat('fbt.css'))
      .pipe(cleanCSS({advanced: false}))
      .pipe(header(COPYRIGHT_HEADER, {version}))
      .pipe(gulp.dest(paths.lib));
  }),
);

gulp.task(
  'dist',
  gulp.series('modules', 'css', function () {
    const opts = {
      debug: true,
      output: 'fbt.js',
    };
    return gulp
      .src('./packages/fbt/lib/FbtPublic.js')
      .pipe(buildDist(opts))
      .pipe(derequire())
      .pipe(gulpif('*.js', header(COPYRIGHT_HEADER, {version})))
      .pipe(gulp.dest(paths.dist));
  }),
);

gulp.task(
  'dist:min',
  gulp.series('modules', function () {
    const opts = {
      debug: false,
      output: 'fbt.min.js',
    };
    return gulp
      .src('./packages/fbt/lib/FbtPublic.js')
      .pipe(buildDist(opts))
      .pipe(gulpif('*.js', header(COPYRIGHT_HEADER, {version})))
      .pipe(gulp.dest(paths.dist));
  }),
);

gulp.task(
  'clean',
  gulp.parallel(babelPluginFbtGulp.clean, () =>
    del([
      '.checksums',
      paths.published + '/*',
      '!' + paths.published + '/package.json',
      '!' + paths.published + '/README.md',
    ]),
  ),
);

gulp.task(
  'build-runtime',
  gulp.series(
    gulp.parallel('license', 'modules', 'test-modules', 'flow'),
    gulp.series('dist', 'dist:min'),
  ),
);
