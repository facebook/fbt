#!/usr/local/bin/php
<?hh
// Copyright 2004-present Facebook. All Rights Reserved.

/**
 * JS-specific i18n hash that mimics FB php internals.
 *
 * !!!!!! NOTE !!!!!!
 * This is not valid PHP. It requires hhvm to run it and the the custom
 * `tiger128,3-fb` hash algorithm
 *
 * @emails oncall+internationalization
 */
function intl_js_hash_babel7(
  string $text,
  string $desc,
): string {
  // @lint-ignore CRYPTO_HASH - this isn't for crypto
  return PHP\hash('tiger128,3-fb', $text.':::'.$desc.':');
}

function tiger128_main() {
  $stdin = PHP\file_get_contents("php://stdin");
  $phrase_hashes = vec[];
  foreach (PHP\json_decode($stdin) as $phrase) {
    $hashes = vec[];
    foreach ($phrase->texts as $text) {
      $hashes[] = intl_js_hash_babel7($text, $phrase->desc);
    }
    $phrase_hashes[] = $hashes;
  }
  echo PHP\json_encode($phrase_hashes);
  exit(0);
}

tiger128_main();
