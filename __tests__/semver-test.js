/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @format
 * @oncall i18n_fbt_js
 */
jest.autoMockOff();

const fs = require('fs');
const glob = require('glob');
const path = require('path');
const semver = require('semver');

describe('Ensure package versions are in sync', () => {
  const paths = glob.sync('../packages/**/package.json', {
    cwd: __dirname,
    ignore: '../packages/**/node_modules/**',
  });
  const name2pkg = paths.reduce((agg, modulePath) => {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, modulePath)));
    return agg.set(pkg.name, pkg);
  }, new Map());

  for (const [name, pkg] of name2pkg) {
    for (const key of ['dependencies', 'devDependencies', 'peerDependencies']) {
      const deps = pkg[key];
      for (const depName in deps || {}) {
        if (!name2pkg.has(depName)) {
          continue;
        }
        const publishedVersion = name2pkg.get(depName).version;
        const versionWanted = deps[depName];
        it(`${depName}@${publishedVersion} satisfies '${versionWanted}' for ${name}`, () => {
          expect(semver.satisfies(publishedVersion, versionWanted)).toBe(true);
        });
      }
    }
  }
});
