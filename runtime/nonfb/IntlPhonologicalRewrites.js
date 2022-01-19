/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * @generated SignedSource<<935df02211222de034e082b5f31e2627>>
 *
 * @flow strict
 * @emails oncall+i18n_fbt_js
 * @codegen-command: JSModulesToClientScript
 */

// flowlint implicit-inexact-object:error

'use strict';

type StringToStringMap = $ReadOnly<{|
  [string]: string,
|}>;
type PhonologicalRewriteMap = $ReadOnly<{|
  meta: StringToStringMap,
  patterns: StringToStringMap,
  male?: StringToStringMap,
  female?: StringToStringMap,
  unknown?: StringToStringMap,
|}>;

const REWRITES: {[string]: PhonologicalRewriteMap} = {
  en_GB: {
    meta: {},
    patterns: {
      "/\u0001(.*)('|&#039;)s\u0001(?:'|&#039;)s(.*)/": '\u0001$1$2s\u0001$3',
    },
  },
  en_IN: {
    meta: {},
    patterns: {
      "/\u0001(.*)('|&#039;)s\u0001(?:'|&#039;)s(.*)/": '\u0001$1$2s\u0001$3',
    },
  },
  en_PI: {
    meta: {},
    patterns: {
      "/\u0001(.*)('|&#039;)s\u0001(?:'|&#039;)s(.*)/": '\u0001$1$2s\u0001$3',
    },
  },
  en_US: {
    meta: {},
    patterns: {
      "/\u0001(.*)('|&#039;)s\u0001(?:'|&#039;)s(.*)/": '\u0001$1$2s\u0001$3',
    },
  },
  tr_TR: {
    meta: {
      '/_C/':
        '(\u015f|\u00e7|b|c|d|f|g|\u011f|h|j|k|l|m|n|p|q|r|s|t|v|w|x|y|z|B|C|D|F|G|\u011e|H|J|K|L|M|N|P|Q|R|S|T|V|W|X|Y|Z)',
      '/_T/': '(\u015f|\u00e7|p|t|k|s)',
      '/_V/': '(a|e|i|o|u|A|E|I|O|U|\u00e4|\u00f6|y|\u00c4|\u00d6|Y)',
    },
    patterns: {
      '/&#039;/': "'",
      '/(\u2018|\u2019)/': "'",
      '/((a|\u0131|A|I|u|o|U|O)_C*)\u0001 de\\/da_E/': '$1\u0001 da$4',
      '/((e|i|E|\u0130|\u00f6|\u00fc|\u00d6|\u00dc)_C*)\u0001 de\\/da_E/':
        '$1\u0001 de$4',
      "/((a|\u0131|A|I|u|o|U|O)_C*_T)\u0001'Da(ki|n|)_E/": "$1\u0001'ta$5$6",
      "/((e|i|E|\u0130|\u00f6|\u00fc|\u00d6|\u00dc)_C*_T)\u0001'Da(ki|n|)_E/":
        "$1\u0001'te$5$6",
      "/((a|\u0131|A|I|u|o|U|O)_C*)\u0001'Da(ki|n|)_E/": "$1\u0001'da$4$5",
      "/((e|i|E|\u0130|\u00f6|\u00fc|\u00d6|\u00dc)_C*)\u0001'Da(ki|n|)_E/":
        "$1\u0001'de$4$5",
      "/(e|i|E|\u0130)\u0001'\\(n\\)in_E/": "$1\u0001'nin$2",
      "/(a|\u0131|A|I)\u0001'\\(n\\)in_E/": "$1\u0001'n\u0131n$2",
      "/(\u00f6|\u00fc|\u00d6|\u00dc)\u0001'\\(n\\)in_E/":
        "$1\u0001'n\u00fcn$2",
      "/([uoUO])\u0001'\\(n\\)in_E/": "$1\u0001'nun$2",
      "/(_Cy)\u0001'\\(n\\)in_E/": "$1\u0001'nin$3",
      "/((e|i|E|\u0130)_C+)\u0001'\\(n\\)in_E/": "$1\u0001'in$4",
      "/((a|\u0131|A|I)_C+)\u0001'\\(n\\)in_E/": "$1\u0001'\u0131n$4",
      "/((\u00f6|\u00fc|\u00d6|\u00dc)_C+)\u0001'\\(n\\)in_E/":
        "$1\u0001'\u00fcn$4",
      "/([uoUO]_C+)\u0001'\\(n\\)in_E/": "$1\u0001'un$3",
      "/(e|i|E|\u0130)\u0001'\\(y\\)e_E/": "$1\u0001'ye$2",
      "/(a|\u0131|A|I)\u0001'\\(y\\)e_E/": "$1\u0001'ya$2",
      "/(\u00f6|\u00fc|\u00d6|\u00dc)\u0001'\\(y\\)e_E/": "$1\u0001'ye$2",
      "/([uoUO])\u0001'\\(y\\)e_E/": "$1\u0001'ya$2",
      "/(_Cy)\u0001'\\(y\\)e_E/": "$1\u0001'ye$3",
      "/((e|i|E|\u0130)_C+)\u0001'\\(y\\)e_E/": "$1\u0001'e$4",
      "/((a|\u0131|A|I)_C+)\u0001'\\(y\\)e_E/": "$1\u0001'a$4",
      "/((\u00f6|\u00fc|\u00d6|\u00dc)_C+)\u0001'\\(y\\)e_E/": "$1\u0001'e$4",
      "/([uoUO]_C+)\u0001'\\(y\\)e_E/": "$1\u0001'a$3",
      "/(e|i|E|\u0130)\u0001'\\(y\\)i_E/": "$1\u0001'yi$2",
      "/(a|\u0131|A|I)\u0001'\\(y\\)i_E/": "$1\u0001'y\u0131$2",
      "/(\u00f6|\u00fc|\u00d6|\u00dc)\u0001'\\(y\\)i_E/": "$1\u0001'y\u00fc$2",
      "/([uoUO])\u0001'\\(y\\)i_E/": "$1\u0001'yu$2",
      "/(_Cy)\u0001'\\(y\\)i_E/": "$1\u0001'yi$3",
      "/((e|i|E|\u0130)_C+)\u0001'\\(y\\)i_E/": "$1\u0001'i$4",
      "/((a|\u0131|A|I)_C+)\u0001'\\(y\\)i_E/": "$1\u0001'\u0131$4",
      "/((\u00f6|\u00fc|\u00d6|\u00dc)_C+)\u0001'\\(y\\)i_E/":
        "$1\u0001'\u00fc$4",
      "/([uoUO]_C+)\u0001'\\(y\\)i_E/": "$1\u0001'u$3",
      "/\u0001'Da(ki|n|)_E/": "\u0001'da$1$2",
      "/\u0001'\\(n\\)in_E/": "\u0001'in$1",
      "/\u0001'\\(y\\)e_E/": "\u0001'e$1",
      "/\u0001'\\(y\\)i_E/": "\u0001'i$1",
      '/\u0001 de\\/da_E/': '\u0001 de$1',
    },
  },
  sv_SE: {
    meta: {},
    patterns: {
      '/([szx])\u0001s_E/': '$1\u0001$2',
    },
  },
  de_DE: {
    meta: {},
    patterns: {
      '/(\u00df|s|z|x)\u0001s_E/': '$1\u0001$2',
    },
  },
  nb_NO: {
    meta: {},
    patterns: {
      '/([szx])\u0001s_E/': "$1\u0001'$2",
    },
  },
  da_DK: {
    meta: {
      '/_U/': '(\u00d8|\u00c5|\u00c6)',
    },
    patterns: {
      '/([szxSZX])\u0001s_E/': "$1\u0001'$2",
      '/([A-Z]|[0-9]|_U)\u0001s_E/': "$1\u0001's$3",
    },
  },
  ar_AR: {
    meta: {
      '/_RTL/': '(([\u0590-\u05bf]|[\u05c0-\u07ff]))',
      '/_Delim/': '(\u0001\u200f)',
    },
    patterns: {
      '/\u0629_Delim_RTL/': '\u062a\u0001$2',
      '/_RTL_Delim(\\s*)_RTL/': '$1\u0001$4$5',
    },
  },
  ca_ES: {
    meta: {
      '/_C/':
        '[b|c|d|f|g|h|j|k|l|m|n|p|q|r|s|t|v|w|x|y|z|B|C|D|F|G|H|J|K|L|M|N|P|Q|R|S|T|V|W|X|Y|Z]',
      '/_V/': '[a|e|i|o|u|A|E|I|O|U]',
    },
    patterns: {
      '/_By \u0001([Ii]|[Hh]i[^e])/': '$1e \u0001$2',
      '/_Bo \u0001([Oo]|[Hh]o)/': '$1u \u0001$2',
    },
    male: {
      '/(.)\u0001(_C.*)\u0001/': '$1\u0005el $2\u0001',
      '/(.)\u0001(_V.*)\u0001/': "$1\u0005l'$2\u0001",
      '/^\u0001(_C.*)\u0001/': '\u0005El $1\u0001',
      '/^\u0001(_V.*)\u0001/': "\u0005L'$1\u0001",
    },
    female: {
      '/(.)\u0001(_C.*)\u0001/': '$1\u0005la $2\u0001',
      '/(.)\u0001(_V.*)\u0001/': "$1\u0005l'$2\u0001",
      '/^\u0001(_C.*)\u0001/': '\u0005La $1\u0001',
      '/^\u0001(_V.*)\u0001/': "\u0005L'$1\u0001",
    },
    unknown: {
      '/(.)\u0001(_C.*)\u0001/': '$1\u0005el $2\u0001',
      '/(.)\u0001(_V.*)\u0001/': "$1\u0005l'$2\u0001",
      '/^\u0001(_C.*)\u0001/': '\u0005El $1\u0001',
      '/^\u0001(_V.*)\u0001/': "\u0005L'$1\u0001",
    },
  },
  es_LA: {
    meta: {},
    patterns: {
      '/_By \u0001([Ii]|[Hh]i[^e])/': '$1e \u0001$2',
      '/_Bo \u0001([Oo]|[Hh]o)/': '$1u \u0001$2',
    },
  },
  es_CL: {
    meta: {},
    patterns: {
      '/_By \u0001([Ii]|[Hh]i[^e])/': '$1e \u0001$2',
      '/_Bo \u0001([Oo]|[Hh]o)/': '$1u \u0001$2',
    },
  },
  es_CO: {
    meta: {},
    patterns: {
      '/_By \u0001([Ii]|[Hh]i[^e])/': '$1e \u0001$2',
      '/_Bo \u0001([Oo]|[Hh]o)/': '$1u \u0001$2',
    },
  },
  es_ES: {
    meta: {},
    patterns: {
      '/_By \u0001([Ii]|[Hh]i[^e])/': '$1e \u0001$2',
      '/_Bo \u0001([Oo]|[Hh]o)/': '$1u \u0001$2',
    },
  },
  es_MX: {
    meta: {},
    patterns: {
      '/_By \u0001([Ii]|[Hh]i[^e])/': '$1e \u0001$2',
      '/_Bo \u0001([Oo]|[Hh]o)/': '$1u \u0001$2',
    },
  },
  es_VE: {
    meta: {},
    patterns: {
      '/_By \u0001([Ii]|[Hh]i[^e])/': '$1e \u0001$2',
      '/_Bo \u0001([Oo]|[Hh]o)/': '$1u \u0001$2',
    },
  },
  sk_SK: {
    meta: {},
    patterns: {
      '/_B(s|z|S|Z) \u0001(s|\u0161|z|\u017e|S|\u0160|Z|\u017d)/':
        '$1$2o \u0001$3',
      '/_B(v|V) \u0001(f|v|F|V)/': '$1$2o \u0001$3',
      '/_B(k|K) \u0001(g|k|G|K)/': '$1$2u \u0001$3',
    },
  },
  bg_BG: {
    meta: {},
    patterns: {
      '/_B(\u0441|\u0421) \u0001(\u0441|\u0421|\u0437|\u0417)/':
        '$1$2\u044a\u0441 \u0001$3',
      '/_B(\u0432|\u0412) \u0001(\u0432|\u0412|\u0444|\u0424)/':
        '$1$2\u044a\u0432 \u0001$3',
    },
  },
  fb_HX: {
    meta: {
      '/_C/':
        '[\u015f|\u00e7|b|c|d|f|g|\u011f|h|j|k|l|m|n|p|q|r|s|t|v|w|x|y|z|B|C|D|F|G|\u011e|H|J|K|L|M|N|P|Q|R|S|T|V|W|X|Y|Z]',
      '/_T/': '[\u015f|\u00e7|p|t|k|s]',
      '/_V/': '[a|e|i|o|u|A|E|I|O|U|\u00e4|\u00f6|y|\u00c4|\u00d6|Y]',
    },
    patterns: {
      '/_By \u0001_C/': '$1i \u0001$2',
      '/_By \u0001_V/': '$1e \u0001$2',
      '/\u0001(_C[^\\s]*)\u0002\u0001/': 'el \u0001$1\u0001',
      '/\u0001(_C[^\\s]*)\u0003\u0001/': 'la \u0001$1\u0001',
      '/\u0001(_V[^\\s]*)\u0001/': "l'\u0001$1\u0001",
    },
  },
};
const GLOBAL_REWRITES: PhonologicalRewriteMap = {
  meta: {
    '/_B/': '([.,!?\\s]|^)',
    '/_E/': '([.,!?\\s]|$)',
  },
  patterns: {
    '/_\u0001([^\u0001]*)\u0001/': 'javascript',
  },
};
const EMPTY_REWRITES = {meta: {}, patterns: {}};
const DEFAULT_LOCALE = 'en_US';

const IntlPhonologicalRewrites = {
  get(localeTag: ?string): PhonologicalRewriteMap {
    const key = localeTag == null ? DEFAULT_LOCALE : localeTag;
    const rewrites = REWRITES[key] || EMPTY_REWRITES;
    return {
      meta: {...rewrites.meta, ...GLOBAL_REWRITES.meta},
      patterns: {...rewrites.patterns, ...GLOBAL_REWRITES.patterns},
    };
  },
};
module.exports = IntlPhonologicalRewrites;
