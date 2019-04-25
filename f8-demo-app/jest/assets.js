/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @flow
 */

const path = require('path');

// See http://facebook.github.io/jest/docs/en/webpack.html#handling-static-assets
module.exports = {
  process(src: string, filename: string) {
    // return file name relative to the project root, with POSIX separators
    const relativePath = path.relative(path.resolve(__dirname, '..'), filename);
    const posixPath = relativePath.replace(/\\/g, '/');
    return `module.exports = ${JSON.stringify(posixPath)};`;
  },
};
