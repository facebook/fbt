/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 *
 * @emails oncall+internationalization
 * @format
 */
'use strict';

jest.disableAutomock();

const childProcess = require.requireActual('child_process');
const fs = require('fs');
const path = require('path');

describe('manifest', () => {
  it('should extract strings', () => {
    const packageRoot = path.resolve(__dirname, '../../');
    const srcPath = 'bin/__fixtures__/';
    const srcManifestPath = path.join(srcPath, '.src_manifest.json');
    const enumManifestPath = path.join(srcPath, '.enum_manifest.json');

    var child = childProcess.spawnSync(
      'node',
      [
        require.resolve('../manifest'),
        '--src=' + srcPath,
        '--src-manifest=' + srcManifestPath,
        '--enum-manifest=' + enumManifestPath,
      ],
      {cwd: packageRoot},
    );

    if (
      (child.stderr && child.stderr.toString() !== '') ||
      child.error ||
      child.status !== 0
    ) {
      throw new Error(
        (child.stderr && child.stderr.toString()) ||
          child.error ||
          'Child process exited with code ' + child.status,
      );
    }

    expect(
      fs.readFileSync(path.join(packageRoot, srcManifestPath), {
        encoding: 'utf8',
      }),
    ).toMatchSnapshot();
    expect(
      fs.readFileSync(path.join(packageRoot, enumManifestPath), {
        encoding: 'utf8',
      }),
    ).toMatchSnapshot();
  });
});
