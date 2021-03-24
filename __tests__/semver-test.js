/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @emails oncall+internationalization
 * @format
 */
jest.autoMockOff();

const semver = require('semver');
const glob = require('glob');

describe('Ensure package versions are in sync', () => {
  const paths = glob.sync('../packages/**/package.json', {
    cwd: __dirname,
    ignore: '../packages/**/node_modules/**',
  });
  const name2pkg = new Map();
  for (const path of paths) {
    const pkg = require(path);
    name2pkg.set(pkg.name, pkg);
  }
  for (const [name, pkg] of name2pkg) {
    for (const key of ['dependencies', 'devDependencies', 'peerDependencies']) {
      const deps = pkg[key];
      for (const depName in deps || {}) {
        if (!name2pkg.has(depName)) {
          continue;
        }
        const publishedVersion = name2pkg.get(depName).version;
        const versionWanted = deps[depName];
        it(`${depName} ${publishedVersion} satisfies ${versionWanted} from ${name}`, () => {
          expect(semver.satisfies(publishedVersion, versionWanted)).toBe(true);
        });
      }
    }
  }
});
