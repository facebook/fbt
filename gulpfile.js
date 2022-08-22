/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @noflow
 * @oncall i18n_fbt_oss
 */

'use strict';

const {PLUGINS} = require('./babelPlugins');
const moduleMap = require('./moduleMap');
const babelPluginFbtGulp = require('./packages/babel-plugin-fbt/gulpfile');
const {version} = require('./packages/fbt/package.json');
const setGeneratedFilePragmas = require('./setGeneratedFilePragmas');
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
const rewriteFlowtypedModules = require('gulp-rewrite-flowtyped-modules');
const gulpUtil = require('gulp-util');
const webpackStream = require('webpack-stream');

const paths = {
  published: 'packages/fbt',
  dist: 'packages/fbt/dist',
  lib: 'packages/fbt/lib',
  license: 'LICENSE',
  runtime: [
    // Individually listing subfolders of `runtime` to allow watching through these symlinks
    'runtime/nonfb/**/*.js',
    'runtime/shared/**/*.js',
    'runtime/shared_deps/**/*.js',
    '!runtime/**/__tests__/*',
    '!runtime/**/__mocks__/*',
  ],
  runtimeTests: ['runtime/nonfb/**/__tests__/*'],
  runtimeMocks: ['runtime/nonfb/**/__mocks__/*'],
  typedModules: ['flow-types/typed-js-modules/*.flow'],
  css: ['runtime/**/*.css'],
};

const COPYRIGHT = 'Copyright (c) Meta Platforms, Inc. and affiliates.';
const ONCALL_ID = 'i18n_fbt_oss';

const COPYRIGHT_HEADER = `/**
 * fbt v<%= version %>
 *
 * ${COPYRIGHT}
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @${'generated'}
 * @${'nolint'}
 * @${'nogrep'}
 * @oncall ${ONCALL_ID}
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

const copyLicense = () =>
  gulp.src(paths.license).pipe(gulp.dest(paths.published));

gulp.task('license', gulp.series(copyLicense));

function flatLib(job) {
  return job
    .pipe(flatten())
    .pipe(setGeneratedFilePragmas(ONCALL_ID))
    .pipe(gulp.dest(paths.lib));
}

const buildModules = () =>
  flatLib(
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
gulp.task('modules', gulp.series(babelPluginFbtGulp.build, buildModules));

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

const transformTests = (src, dest) =>
  gulp
    .src(src, {follow: true})
    .pipe(once())
    .pipe(babel(babelTestPresets))
    .pipe(flatten())
    .pipe(setGeneratedFilePragmas())
    .pipe(gulp.dest(dest));

const buildRuntimeTests = () =>
  transformTests(paths.runtimeTests, paths.lib + '/__tests__');

const buildRuntimeMocks = () =>
  transformTests(paths.runtimeMocks, paths.lib + '/__mocks__');

gulp.task(
  'test-modules',
  gulp.series(
    babelPluginFbtGulp.build,
    gulp.parallel(buildRuntimeTests, buildRuntimeMocks),
  ),
);

// Copy raw source with rewritten modules to *.js.flow
const buildRuntimeFlowJS = () =>
  flatLib(
    gulp
      .src(paths.runtime, {follow: true})
      .pipe(rename({extname: '.js.flow'}))
      .pipe(once())
      .pipe(rewriteFlowtypedModules({map: moduleMap})),
  );

const copyFlowTypedModules = () =>
  flatLib(gulp.src(paths.typedModules, {follow: true}));

gulp.task('flow', gulp.parallel(buildRuntimeFlowJS, copyFlowTypedModules));

const buildCSS = () =>
  gulp
    .src(paths.css, {follow: true})
    .pipe(once())
    .pipe(concat('fbt.css'))
    .pipe(cleanCSS({advanced: false}))
    .pipe(header(COPYRIGHT_HEADER, {version}))
    .pipe(gulp.dest(paths.lib));

gulp.task('css', gulp.series(buildCSS));

const buildDistTask = () =>
  gulp
    .src('./packages/fbt/lib/FbtPublic.js')
    .pipe(buildDist({debug: true, output: 'fbt.js'}))
    .pipe(derequire())
    .pipe(gulpif('*.js', header(COPYRIGHT_HEADER, {version})))
    .pipe(gulp.dest(paths.dist));

gulp.task('dist', gulp.series('modules', 'css', buildDistTask));

const buildDistMinTask = () =>
  gulp
    .src('./packages/fbt/lib/FbtPublic.js')
    .pipe(buildDist({debug: false, output: 'fbt.min.js'}))
    .pipe(gulpif('*.js', header(COPYRIGHT_HEADER, {version})))
    .pipe(gulp.dest(paths.dist));

gulp.task('dist:min', gulp.series('modules', buildDistMinTask));

const cleanTask = () =>
  del([
    '.checksums',
    paths.published + '/*',
    '!' + paths.published + '/package.json',
    '!' + paths.published + '/README.md',
  ]);

gulp.task('clean', gulp.parallel(babelPluginFbtGulp.clean, cleanTask));

gulp.task(
  'build-runtime',
  gulp.series(
    gulp.parallel('license', 'modules', 'test-modules', 'flow'),
    gulp.series('dist', 'dist:min'),
  ),
);

gulp.task('watch-runtime', () => {
  gulp.watch(
    [paths.license].concat(
      paths.runtime,
      paths.runtimeTests,
      paths.runtimeMocks,
      paths.typedModules,
      paths.css,
    ),
    {
      cwd: __dirname,
      ignoreInitial: false,
    },
    function watchRuntimeFbt(done) {
      gulp.task('build-runtime')(done);
    },
  );
});
