#!/usr/local/bin/php
<?hh
// Copyright 2004-present Facebook. All Rights Reserved.

/**
 * JS-specific i18n hash that mimics FB php internals.
 * @emails oncall+internationalization
 */
function intl_js_hash_babel7(
  string $text,
  string $desc,
): string {
  // @lint-ignore HackLint5542 - this isn't for crypto
  return hash('tiger128,3-fb', $text.':::'.$desc.':');
}

$stdin = file_get_contents("php://stdin");
$phrase_hashes = vec[];
foreach (json_decode($stdin) as $phrase) {
  $hashes = vec[];
  foreach ($phrase->texts as $text) {
    $hashes[] = intl_js_hash_babel7($text, $phrase->desc);
  }
  $phrase_hashes[] = $hashes;
}
echo json_encode($phrase_hashes);
exit(0);
