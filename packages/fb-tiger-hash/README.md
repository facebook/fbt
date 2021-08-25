## fb-tiger-hash
### A Native JS implementation of Tiger hash.

Provides a cross-platform Tiger hash implementation that supports the
flipped byte-order (endianness) of PHP's original Tiger
implementation for backwards compatability.


See [its use in HHVM](https://github.com/facebook/hhvm/blob/281303d/hphp/runtime/ext/hash/ext_hash.cpp#L94-L97)

It's main intended use is for the [Facebook FBT internationalization
framework](https://facebook.github.io/fbt), where a hashing
algorithm is supplied to create unique identifiers from source strings
and their descriptions.

NOTE: This implementation is not optimized for reading large blocks of
data or streams. It both expects a simple string AND loads the entire
input into memory in a `Buffer`.

More on the Tiger algorithm:
 * https://www.cs.technion.ac.il/~biham/Reports/Tiger/tiger/node3.html
 * https://www.cl.cam.ac.uk/~rja14/Papers/tiger.pdf
