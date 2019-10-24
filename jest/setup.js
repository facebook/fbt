/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @flow
 */

// Ensures that `regeneratorRuntime` is defined.
require('babel-polyfill');

// Ensures that `requestAnimationFrame` is defined for React.
// http://fb.me/react-polyfills
require('raf').polyfill();
