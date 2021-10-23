---
id: utilities
title: Runtime Utilities
sidebar_label: Runtime Utilities
---

Bundled with fbt come a few useful utilities for constructing strings.
### intlList(...)
[`intlList`](https://github.com/facebook/fbt/blob/main/runtime/shared/intlList.js) creates `fbt` instances with selectable conjunctions given an array.

As an example
```js
const intlList = require('fbt/lib/intlList');
const CONJUNCTIONS = intlList.CONJUNCTIONS;
const DELIMITERS = intlList.DELIMITERS;
let people = ['Adam', 'Becky', fbt('4 others', 'last item')]
intlList(people, CONJUNCTIONS.AND, DELIMITERS.COMMA);
```
produces the fbt
```
<fbt
  desc={
    'A list of items of various types. {previous items} and' +
    ' {following items} are themselves lists that contain one or' +
    ' more items.'
  }>
  <fbt:param name="previous items">{output}</fbt:param>
  {', '}
  <fbt:param name="following items">{items[i]}</fbt:param>
</fbt>
```
recursively combining fbts.
**Note that genders are not used in this `fbt:param` instances, so they default to `UNKNOWN`**

### intlNumUtils and intlSummarizeNumber
There are a few utilities in both `intlNumUtils` and
`intlSummarizeNumber` that are documented in the source.

In fact `fbt.param` and `fbt.plural` default to displaying numbers
using `intlNumUtils.formatNumberWithThousandDelimiters`.
You can override this behavior in `fbt:param` by setting the
[number option](params#optional-attributes) and using your own
string in the replacement.

You can override this in `fbt.plural` [by providing the `value`
option](plurals#optional-arguments).
