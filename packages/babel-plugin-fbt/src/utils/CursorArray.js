/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @emails oncall+internationalization
 * @flow strict
 * @format
 */

const invariant = require('invariant');

/**
 * A special wrapper class for arrays that has an internal cursor.
 * This allows callers to "consume" / "retrieve" array items in
 * sequential order without having to keep track of the cursor index themselves.
 */
class CursorArray<V> {
  _index: number = 0;
  _values: $ReadOnlyArray<V>;

  constructor(values: $ReadOnlyArray<V>): void {
    this._values = values;
  }

  /**
   * Retrieve `itemCount` items and update the cursor index
   */
  consume(itemCount: number): Array<V> {
    const {_index: curIndex, _values: values} = this;
    invariant(
      values.length - curIndex >= itemCount,
      'Trying to consume %s item(s) but there are only %s item(s) left. ' +
        'Array[length=%s, index=%s] ',
      itemCount,
      values.length - curIndex,
      curIndex,
      values.length,
    );
    this._index += itemCount;
    return values.slice(curIndex, curIndex + itemCount);
  }

  /**
   * Same as `consume(1)`
   */
  consumeOne(): V {
    return this.consume(1)[0];
  }
}

module.exports = CursorArray;
