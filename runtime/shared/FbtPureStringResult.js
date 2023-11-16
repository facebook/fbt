/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p fbt --local ~/www
 *
 * @flow strict-local
 * @format
 * @oncall i18n_fbt_js
 */

/* eslint-disable fb-www/no-commonjs */

const FbtResult = require('FbtResult');

class FbtPureStringResultImpl extends FbtResult {}

// $FlowExpectedError Force exported type to match FbtPureStringResult from the fbt.js libdef
const out: Class<FbtPureStringResult> = FbtPureStringResultImpl;
module.exports = out;
