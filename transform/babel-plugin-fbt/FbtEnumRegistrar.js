/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p babel_plugin_fbt --remote localhost:~/www
 *
 * @emails oncall+internationalization
 * @format
 * @flow
 */

'use strict';

const {FBT_ENUM_MODULE_SUFFIX} = require('./FbtConstants');
const invariant = require('fbjs/lib/invariant');

const fbtEnumMapping /*: {[string]: ?string} */ = {};

const FbtEnumRegistrar = {
  /**
   * Associate a JS variable name to an Fbt enum module name
   * If the module name is invalid, then it's a no-op.
   */
  setModuleAlias(
    name /*: string */,
    fbtEnumModuleName /*: string */,
  ) /*: void */ {
    invariant(
      fbtEnumModuleName.trim() !== '',
      'JS module name must not be empty',
    );
    if (fbtEnumModuleName.endsWith(FBT_ENUM_MODULE_SUFFIX)) {
      fbtEnumMapping[name] = fbtEnumModuleName;
    }
  },

  /**
   * Returns the Fbt enum module name for a given variable name (if any)
   */
  getModuleName(name /*: string */) /*: ?string */ {
    return fbtEnumMapping[name];
  },
};

module.exports = FbtEnumRegistrar;
