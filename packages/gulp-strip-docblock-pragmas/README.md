# gulp-strip-docblock-pragmas
### Rewrites modules dependencies

## Implementation
Uses [`jest-docblock`](https://www.npmjs.com/package/jest-docblock) to parsed the docblock and strip all pragmas (default) or those specified in options.

## Options

`pragmas`: Array of pragmas to specifically strip.  If not specified, defaults to stripping all pragmas from the docblock

## Usage

**Strip all pragmas**
```
const stripPragmas = require('gulp-strip-docblock-pragmas');
gulp.pipe(stripPragms);
```

**Strip select pragmas**
```
const stripPragmas = require('gulp-strip-docblock-pragmas');
gulp
  .pipe(stripPragmas({pragmas: ['foo', 'bar']}));
```
