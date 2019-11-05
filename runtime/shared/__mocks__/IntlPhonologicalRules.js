/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @flow strict
 * @format
 * @emails oncall+internationalization
 */

module.exports = {
  meta: {'/_B/': '([.,!?s]|^)', '/_E/': '([.,!?s]|$)'},
  patterns: {
    "/\u0001(.*)('|&#039;)s\u0001(?:'|&#039;)s(.*)/": '\u0001$1$2s\u0001$3',
    '/_\u0001([^\u0001]*)\u0001/': 'javascript',
  },
};
