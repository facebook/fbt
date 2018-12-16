/**
 * Copyright (c) Facebook, Inc. and its affiliates. All rights reserved.
 *
 * @flow strict-local
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Example from './example/Example.react';

import 'normalize.css';
import './css/root.css';

const root = document.getElementById('root');

if (root == null) {
  throw new Error(`No root element found.`);
}

ReactDOM.render(<Example />, root);
