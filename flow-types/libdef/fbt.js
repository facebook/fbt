/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict
 */

'use strict';

/**
 * Translated string from an `fbt()` call.
 *
 * This is an opaque type so you may _only_ create an `FbtString` by calling
 * `fbt()` or one of its methods.
 *
 * You may use an `FbtString` as any normal string, but you can't create a new
 * `FbtString` without `fbt()`.
 *
 * @warning Because fbt.param() accepts any value,
 * we can't guarantee that this Fbt contents isn't made of React elements
 */
declare opaque type FbtString: string;

/**
 * Translated string from an `<fbt>` element.
 *
 * This is an opaque type so you may _only_ create an `FbtElement` by using an
 * `<fbt>` element.
 *
 * Unlike `FbtString`, you cannot use `FbtElement` like any normal string. Since
 * `<fbt>` can have nested React nodes its internal structure is hidden from the
 * end user.
 *
 * There are some string-like properties and methods you may use, like `length`
 * and `toString()`.
 */
// Not using `opaque` yet since there are flow issues with React's defaultProps
// See:
// - An Fbt in defaultProps breaks: https://fburl.com/cer2jdjd
// - Opaque types with truthy bounds aren't excluded from the type of
//   logical 'and' expressions. https://fburl.com/9b5vm9wh
declare type FbtElement = $FbtResultBase;

/**
 * All translated strings. Could either be a translated string returned by an
 * `fbt()` call or a translated string returned by an `<fbt>` element.
 */
declare type FbtWithoutString = FbtString | FbtElement;

/**
 * All translated strings wrapped in `fbt` and the `string` type. `string` is
 * mostly included for legacy purposes.
 *
 * NOTE: If you want to use a type that requires your string to be wrapped in
 * `fbt` use `FbtWithoutString`. Not this type. It may be wise to run a
 * codemod which renames this `Fbt` type to `Fbt | string` and renames
 * `FbtWithoutString` to `Fbt` so that all future uses of `Fbt` require
 * translated strings.
 */
declare type Fbt = string | FbtWithoutString;

/**
 * All translated strings wrapped in `fbs()` or `<fbs>` type.
 * If this is composed of "string parameters" (fbs.param),
 * then it'll only accept plain string values, or other `Fbs` objects.
 */
declare type Fbs = FbtPureStringResult;

// Read-only array of Fbt items. Use this only when your code is meant to
// handle a list of Fbts from different source code locations.
// Avoid returning an array of Fbt like [<fbt/>, <fbt/>] for a single site
// because it's an anti-pattern similar to string concatenation.
// Favor using a single <fbt/> element as often as possible.
declare type FbtCollection = Fbt | $ReadOnlyArray<Fbt>;

// Similar to React$Node without `Iterable<React$Node>`
declare type $FbtContentItem =
  | boolean
  | FbtElement
  | FbtPureStringResult
  | FbtString
  | null
  | number
  | React$Element<any>
  | React$Portal
  | string
  | void;

declare type $NestedFbtContentItems = $ReadOnlyArray<
  $FbtContentItem | $NestedFbtContentItems,
>;

declare type FbtErrorContext = {
  hash: ?string,
  translation: string,
  ...
};

/**
 * A delegate used in FbtResult for handling errors when toString
 * can't serialize due to non-string and non-Fbt elements in the
 * interpolated payload (e.g. React nodes, DOM nodes, etc).
 */
declare interface IFbtErrorListener {
  constructor(context: FbtErrorContext): void;

  /**
   * Handle the error scenario where the FbtResultBase contains non-string elements
   * (usually React components) and tries to run .toString()
   *
   * Example of bad usage of <fbt> with rich contents that will trigger this error
   *
   * render() {
   *   const text = (
   *     <fbt desc="...">
   *       I have <Link href="#">no name</Link>.
   *     </fbt>
   *   );
   *   return (
   *     <div className={cx('FiddleCSS/root')}>
   *       <p>Text = "{text}"</p>
   *       <p>Truncated Text = "{text.substr(0, 9)}"</p> // will output: "I have ."
   *       <em>You might have expected "I have no name" but we don't support
   *           this in the FBT API.</em>
   *     </div>
   *   );
   * }
   */
  +onStringSerializationError?: (content: $FbtContentItem) => void;

  +onStringMethodUsed?: (method: string) => void;
}

declare interface IFbtResultBase {
  constructor(
    contents: $ReadOnlyArray<any>,
    errorListener: ?IFbtErrorListener,
  ): void;
  getContents(): any;
  // This relies on toString() which contains i18n logging logic to track impressions.
  // I.e. If you use this, i18n will register the string as displayed!
  toJSON(): string;

  // Hack for allowing FBTResult to play nice in React components
  _store?: {validated: boolean, ...};
}

// String result wrapper intended for ComponentScript.
// Similar to FbtResultBase except that:
// - it can only be assembled from strings, not React elements
// - it doesn't behave like a stringish object
declare class FbtPureStringResult implements IFbtResultBase {
  // implements IFbtResultBase
  constructor(
    contents: $ReadOnlyArray<any>,
    errorListener: ?IFbtErrorListener,
  ): void;
  getContents: $PropertyType<IFbtResultBase, 'getContents'>;
  toJSON: $PropertyType<IFbtResultBase, 'toJSON'>;
  // TODO(T27672828) Move code of toString() inside unwrap()
  // Returns the translated string value (similar to a `toString()` method)
  // This is deliberately named differently to avoid making this class behave
  // in a "stringish" manner.
  // unwrap(): string;
}

declare class $FbtResultBase extends FbtPureStringResult {
  toString: typeof String.prototype.toString;
}

// Represents the input of an fbt.param
type $FbtParamInput = React$Node;
type $FbsParamInput = FbtPureStringResult | string;

// Represents the output of an fbt.param, fbt.enum, etc...
// It's voluntarily not an accurate representation of the real output.
// Non-internal i18n code should not need to know its actual type.
opaque type $FbsParamOutput = mixed;
opaque type $FbtParamOutput: $FbsParamOutput = $FbsParamOutput;

// NOTE: DO NOT USE THE $-prefixed versions of these types;
// import them from their respective JS modules instead.
opaque type $IntlVariationsEnum: number = number;
opaque type $GenderConstEnum: number = number;

// i18n INTERNAL USE ONLY! DO NOT USE THIS TYPE OUTSIDE OF THIS FILE!
// Defines the fbt or fbs common procedural-style API
type $GenericFbtFunctionAPI<Input, Output, ParamInput, ParamOutput> = {
  (
    text: Input,
    description: string,
    options?: {
      author?: string,
      project?: string,
      ...
    },
  ): Output,
  param(
    name: string,
    value: ParamInput,
    options?: {
      number?: boolean | number,
      gender?: $IntlVariationsEnum,
      ...
    },
  ): ParamOutput,
  enum(
    value: string,
    range: $ReadOnlyArray<string> | {[key: string]: string, ...},
  ): ParamOutput,
  name(
    tokenName: string,
    value: string,
    gender: $IntlVariationsEnum,
  ): ParamOutput,
  plural(
    label: string,
    count: number,
    options?: {
      many?: string,
      showCount?: 'ifMany' | 'no' | 'yes',
      name?: string, // token name
      value?: $FbtContentItem, // optional value to replace token (rather than count)
    },
  ): ParamOutput,
  pronoun(
    usage: 'object' | 'possessive' | 'reflexive' | 'subject',
    gender: $GenderConstEnum,
    options?: {
      capitalize?: boolean,
      human?: boolean,
      ...
    },
  ): ParamOutput,
  sameParam(name: string): ParamOutput,
  c(text: string): Output,
  jsonEncode: boolean,
  replaceParams: boolean,
  // Only used in React Native in fbsource
  enableJsonExportMode(): void,
  // Only used in React Native in fbsource
  disableJsonExportMode(): void,
  isFbtInstance(value: mixed): boolean,
  ...
};

type $StringBasedFbtFunctionAPI<
  Output,
  ParamInput,
  ParamOutput,
> = $GenericFbtFunctionAPI<string, Output, ParamInput, ParamOutput>;

type $ArrayBasedFbtFunctionAPI<Output, ParamInput> = $GenericFbtFunctionAPI<
  $ReadOnlyArray<string | $FbtParamOutput>,
  Output,
  ParamInput,
  $FbtParamOutput,
>;

type $FbtFunctionAPI = $StringBasedFbtFunctionAPI<
  FbtWithoutString,
  $FbtParamInput,
  string,
> &
  $ArrayBasedFbtFunctionAPI<FbtWithoutString, $FbtParamInput>;

type $FbsFunctionAPI = $StringBasedFbtFunctionAPI<
  FbtPureStringResult,
  $FbsParamInput,
  $FbtParamOutput,
> &
  $ArrayBasedFbtFunctionAPI<FbtPureStringResult, $FbsParamInput>;
