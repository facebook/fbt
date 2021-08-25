/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 *
 * @emails oncall+i18n_fbt_js
 * @format
 */

'use strict';

jest.disableAutomock();

const {generateManifest} = require('../manifestUtils');
const path = require('path');

describe('manifest', () => {
  it('should extract strings', () => {
    const srcPath = 'bin/__fixtures__';
    const enumManifestPath = path.join(srcPath, '.enum_manifest.json');

    const {enumManifest, srcManifest} = generateManifest(
      enumManifestPath,
      [srcPath],
      __dirname + '/../..',
    );

    expect(JSON.stringify(srcManifest, null, 2)).toMatchSnapshot();
    expect(JSON.stringify(enumManifest, null, 2)).toMatchSnapshot();
  });
});
