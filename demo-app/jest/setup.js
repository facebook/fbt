/**
 * Copyright (c) Facebook, Inc. and its affiliates. All rights reserved.
 *
 * @flow
 */

// Ensures that `regeneratorRuntime` is defined.
require('babel-polyfill');

// Ensures that `requestAnimationFrame` is defined for React.
// http://fb.me/react-polyfills
require('raf').polyfill();
