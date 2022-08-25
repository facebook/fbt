/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Intended for use with the Facebook FBT framework.
 *
 * @format
 * @oncall i18n_fbt_js
 */
import {Tiger, getFbtHash} from 'fb-tiger-hash';

getFbtHash('Sponge Bob', 'Cartoon character name');

new Tiger(Tiger.L128, 0, true, Tiger.UTF8).hash('foo');
