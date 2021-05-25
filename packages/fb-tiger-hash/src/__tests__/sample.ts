/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * Intended for use with the Facebook FBT framework.
 *
 * @emails oncall+i18n_fbt_js
 * @format
 */
import {Tiger, getFbtHash} from 'fb-tiger-hash';

getFbtHash('Sponge Bob', 'Cartoon character name');

new Tiger(Tiger.L128, 0, true, Tiger.UTF8).hash('foo');
