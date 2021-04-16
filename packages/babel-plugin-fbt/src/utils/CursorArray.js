/**
 * (c) Facebook, Inc. and its affiliates. Confidential and proprietary.
 *
 * @emails oncall+internationalization
 * @flow strict
 * @format
 */

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
    console.error(__filename + ': not implemented yet');
    return global.IMPLEMENT_MEEE;
  }

  /**
   * Same as `consume(1)`
   */
  consumeOne(): V {
    console.error(__filename + ': not implemented yet');
    return global.IMPLEMENT_MEEE;
  }
}

module.exports = CursorArray;
