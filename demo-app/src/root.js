/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @format
 * @noflow
 * @oncall i18n_fbt_js
 */

import './css/root.css';
import Example from './example/Example.react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'normalize.css';

const root = document.getElementById('root');

if (root == null) {
  throw new Error(`No root element found.`);
}

ReactDOM.render(<Example />, root);
