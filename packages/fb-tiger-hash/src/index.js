/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @emails oncall+internationalization
 * @format
 */

'use strict';

const Tiger = require('./Tiger');
const hashPhrases = require('./hashPhrases');

module.exports = {
  __esModule: true,
  default: Tiger,
  Tiger: Tiger,
  hashPhrases: hashPhrases,
};
