/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @format
 * @oncall i18n_fbt_js
 */
'use strict';
const Tiger = require('../Tiger');

describe('Tiger hash', () => {
  it('Tiger192,3 should match the spec', () => {
    // From: http://www.cs.technion.ac.il/~biham/Reports/Tiger/testresults.html
    const expected = {
      '': '3293ac630c13f0245f92bbb1766e16167a4e58492dde73f3',
      abc: '2aab1484e8c158f2bfb8c5ff41b57a525129131c957b5f93',
      Tiger: 'dd00230799f5009fec6debc838bb6a27df2b9d6f110c7937',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-':
        'f71c8583902afb879edfe610f82c0d4786a3a534504486b5',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ=abcdefghijklmnopqrstuvwxyz+0123456789':
        '48ceeb6308b87d46e95d656112cdf18d97915f9765658957',
      'Tiger - A Fast New Hash Function, by Ross Anderson and Eli Biham':
        '8a866829040a410c729ad23f5ada711603b3cdd357e4c15e',
      'Tiger - A Fast New Hash Function, by Ross Anderson and Eli Biham, proceedings of Fast Software Encryption 3, Cambridge.':
        'ce55a6afd591f5ebac547ff84f89227f9331dab0b611c889',
      'Tiger - A Fast New Hash Function, by Ross Anderson and Eli Biham, proceedings of Fast Software Encryption 3, Cambridge, 1996.':
        '631abdd103eb9a3d245b6dfd4d77b257fc7439501d1568dd',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-':
        'c54034e5b43eb8005848a7e0ae6aac76e4ff590ae715fd25',

      // Multi-byte string and conversion test:
      //
      // =PHP\hash('tiger192,3', '\u{1F4AF}k\u{00E5}\u{0019}-\u{00D4}\u{00B5}\u{00A6}\u{00A8}\u{00B7}G:\u{00ED}p\u{00D0}\u{FFFD}\u{001F}NT\u{0012}H\u{00E3}\u{FFFD}\u{001A}\u{00D2}')
      '\uD83D\uDCAFk\u00E5\u0019-\u00D4\u00B5\u00A6\u00A8\u00B7G:\u00EDp\u00D0\uFFFD\u001FNT\u0012H\u00E3\uFFFD\u001A\u00D2':
        'a2d217d69ca531ed4aa78ef45a2d40b053f741b293506a54',
    };
    const tiger192_3 = new Tiger(Tiger.L192, 0, false);
    for (const txt in expected) {
      expect(tiger192_3.hash(txt)).toEqual(expected[txt]);
    }
  });

  it('Tiger160,4 should match', () => {
    // Generated from HHVM:
    //
    // fbdbg> $txts=vec['', 'abc', 'Tiger', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ=abcdefghijklmnopqrstuvwxyz+0123456789', 'Tiger - A Fast New Hash Function, by Ross Anderson and Eli Biham', 'Tiger - A Fast New Hash Function, by Ross Anderson and Eli Biham, proceedings of Fast Software Encryption 3, Cambridge.', 'Tiger - A Fast New Hash Function, by Ross Anderson and Eli Biham, proceedings of Fast Software Encryption 3, Cambridge, 1996.', 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-']
    // fbdbg> p (Dict\from_keys($txts, $x ==> PHP\hash('tiger160,4', $x)))
    // Dict
    // (
    //   [] => '24cc78a7f6ff3546e7984e59695ca13d804e0b68'
    //   [abc] => '538883c8fc5f28250299018e66bdf4fdb5ef7b65'
    //   [Tiger] => 'aee020507279c0d2defcb767251cc0f824bbe385'
    //   [ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-] => '439c699b3ca4f2d0cedc940fabca8941932a729a'
    //   [ABCDEFGHIJKLMNOPQRSTUVWXYZ=abcdefghijklmnopqrstuvwxyz+0123456789] => 'c5fe245ba8e9e3a056efd9f6cfa79cead8571a3c'
    //   [Tiger - A Fast New Hash Function, by Ross Anderson and Eli Biham] => '81100cdf2076b0e0392004f703449f41a37b8404'
    //   [Tiger - A Fast New Hash Function, by Ross Anderson and Eli Biham, proceedings of Fast Software Encryption 3, Cambridge.] => 'a1e027aa525a38589ac97cfa325dc08417b3445a'
    //   [Tiger - A Fast New Hash Function, by Ross Anderson and Eli Biham, proceedings of Fast Software Encryption 3, Cambridge, 1996.] => 'f72ca9fa0db3332782d7b8ccac29575490b81008'
    //   [ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-] => '653b3075f1a85c6c74f1a9090b3c46239f29f0f9'
    // )
    const expected = {
      '': '24cc78a7f6ff3546e7984e59695ca13d804e0b68',
      abc: '538883c8fc5f28250299018e66bdf4fdb5ef7b65',
      Tiger: 'aee020507279c0d2defcb767251cc0f824bbe385',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-':
        '439c699b3ca4f2d0cedc940fabca8941932a729a',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ=abcdefghijklmnopqrstuvwxyz+0123456789':
        'c5fe245ba8e9e3a056efd9f6cfa79cead8571a3c',
      'Tiger - A Fast New Hash Function, by Ross Anderson and Eli Biham':
        '81100cdf2076b0e0392004f703449f41a37b8404',
      'Tiger - A Fast New Hash Function, by Ross Anderson and Eli Biham, proceedings of Fast Software Encryption 3, Cambridge.':
        'a1e027aa525a38589ac97cfa325dc08417b3445a',
      'Tiger - A Fast New Hash Function, by Ross Anderson and Eli Biham, proceedings of Fast Software Encryption 3, Cambridge, 1996.':
        'f72ca9fa0db3332782d7b8ccac29575490b81008',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-':
        '653b3075f1a85c6c74f1a9090b3c46239f29f0f9',
    };
    const tiger160_4 = new Tiger(Tiger.L160, 1, false);
    for (const txt in expected) {
      expect(tiger160_4.hash(txt)).toEqual(expected[txt]);
    }
  });

  it('Tiger128,3-fb should match HHVM', () => {
    const expected = {
      '': '24f0130c63ac933216166e76b1bb925f',
      abc: 'f258c1e88414ab2a527ab541ffc5b8bf',
      Tiger: '9f00f599072300dd276abb38c8eb6dec',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-':
        '87fb2a9083851cf7470d2cf810e6df9e',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ=abcdefghijklmnopqrstuvwxyz+0123456789':
        '467db80863ebce488df1cd1261655de9',
      'Tiger - A Fast New Hash Function, by Ross Anderson and Eli Biham':
        '0c410a042968868a1671da5a3fd29a72',
      'Tiger - A Fast New Hash Function, by Ross Anderson and Eli Biham, proceedings of Fast Software Encryption 3, Cambridge.':
        'ebf591d5afa655ce7f22894ff87f54ac',
      'Tiger - A Fast New Hash Function, by Ross Anderson and Eli Biham, proceedings of Fast Software Encryption 3, Cambridge, 1996.':
        '3d9aeb03d1bd1a6357b2774dfd6d5b24',
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-':
        '00b83eb4e53440c576ac6aaee0a74858',

      // Multi-byte string and conversion test:
      //
      // PHP\hash('tiger128,3-fb', '\u{1F4AF}k\u{00E5}\u{0019}-\u{00D4}\u{00B5}\u{00A6}\u{00A8}\u{00B7}G:\u{00ED}p\u{00D0}\u{FFFD}\u{001F}NT\u{0012}H\u{00E3}\u{FFFD}\u{001A}\u{00D2}')
      '\uD83D\uDCAFk\u00E5\u0019-\u00D4\u00B5\u00A6\u00A8\u00B7G:\u00EDp\u00D0\uFFFD\u001FNT\u0012H\u00E3\uFFFD\u001A\u00D2':
        'ed31a59cd617d2a2b0402d5af48ea74a',
    };

    const tiger128_3_FB = new Tiger(Tiger.L128, 0, true);
    for (const txt in expected) {
      expect(tiger128_3_FB.hash(txt)).toEqual(expected[txt]);
    }
  });
});
