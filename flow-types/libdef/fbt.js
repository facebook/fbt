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
declare type FbtElement = FbtResultBase;

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

declare interface IFbtResultBase {
  constructor(contents: $ReadOnlyArray<any>): void;
  getContents(): any;
  // This relies on toString() which contains i18n logging logic to track impressions.
  // I.e. If you use this, i18n will register the string as displayed!
  toJSON(): string;

  // Hack for allowing FBTResult to play nice in React components
  _store?: {validated: boolean};
}

declare interface IFbtStringish {
  // Warning: The following methods are only applicable during the transition
  // period for some existing code that uses string method on Fbt string.
  //
  // The fbt string should be considered as the final string to be displayed
  // and therefore should not be manipulated.
  // This relies on toString() which contains i18n logging logic to track impressions.
  // I.e. If you use this, i18n will register the string as displayed!
  //
  // The following methods are expected not to be supported soon.

  // Methods from String
  toString: typeof String.prototype.toString;
  charAt: typeof String.prototype.charAt;
  charCodeAt: typeof String.prototype.charCodeAt;
  codePointAt: typeof String.prototype.codePointAt;
  endsWith: typeof String.prototype.endsWith;
  includes: typeof String.prototype.includes;
  indexOf: typeof String.prototype.indexOf;
  lastIndexOf: typeof String.prototype.lastIndexOf;
  link: typeof String.prototype.link;
  localeCompare: typeof String.prototype.localeCompare;
  match: typeof String.prototype.match;
  normalize: typeof String.prototype.normalize;
  repeat: typeof String.prototype.repeat;
  replace: typeof String.prototype.replace;
  search: typeof String.prototype.search;
  slice: typeof String.prototype.slice;
  split: typeof String.prototype.split;
  startsWith: typeof String.prototype.startsWith;
  substr: typeof String.prototype.substr;
  substring: typeof String.prototype.substring;
  toLocaleLowerCase: typeof String.prototype.toLocaleLowerCase;
  toLocaleUpperCase: typeof String.prototype.toLocaleUpperCase;
  toLowerCase: typeof String.prototype.toLowerCase;
  toUpperCase: typeof String.prototype.toUpperCase;
  trim: typeof String.prototype.trim;
  trimLeft: typeof String.prototype.trimLeft;
  trimRight: typeof String.prototype.trimRight;
  // Deprecated String methods
  anchor(name: string): string;
  big(): string;
  blink(): string;
  bold(): string;
  fixed(): string;
  italics(): string;
  small(): string;
  fontcolor(color: string): string;
  fontsize(color: string): string;
  strike(): string;
  sub(): string;
  sup(): string;
  // FBism?
  contains(string): boolean;
}

// String result wrapper intended for ComponentScript.
// Similar to FbtResultBase except that:
// - it can only be assembled from strings, not React elements
// - it doesn't behave like a stringish object
declare class FbtPureStringResult implements IFbtResultBase {
  // implements IFbtResultBase
  constructor(contents: $ReadOnlyArray<any>): void;
  getContents: $PropertyType<IFbtResultBase, 'getContents'>;
  toJSON: $PropertyType<IFbtResultBase, 'toJSON'>;
  // TODO(T27672828) Move code of toString() inside unwrap()
  // Returns the translated string value (similar to a `toString()` method)
  // This is deliberately named differently to avoid making this class behave
  // in a "stringish" manner.
  // unwrap(): string;
}

declare class FbtResultBase extends FbtPureStringResult
  implements IFbtStringish {
  // implements IFbtStringish
  charAt: $PropertyType<IFbtStringish, 'charAt'>;
  charCodeAt: $PropertyType<IFbtStringish, 'charCodeAt'>;
  codePointAt: $PropertyType<IFbtStringish, 'codePointAt'>;
  endsWith: $PropertyType<IFbtStringish, 'endsWith'>;
  includes: $PropertyType<IFbtStringish, 'includes'>;
  indexOf: $PropertyType<IFbtStringish, 'indexOf'>;
  lastIndexOf: $PropertyType<IFbtStringish, 'lastIndexOf'>;
  link: $PropertyType<IFbtStringish, 'link'>;
  localeCompare: $PropertyType<IFbtStringish, 'localeCompare'>;
  match: $PropertyType<IFbtStringish, 'match'>;
  normalize: $PropertyType<IFbtStringish, 'normalize'>;
  repeat: $PropertyType<IFbtStringish, 'repeat'>;
  replace: $PropertyType<IFbtStringish, 'replace'>;
  search: $PropertyType<IFbtStringish, 'search'>;
  slice: $PropertyType<IFbtStringish, 'slice'>;
  split: $PropertyType<IFbtStringish, 'split'>;
  startsWith: $PropertyType<IFbtStringish, 'startsWith'>;
  substr: $PropertyType<IFbtStringish, 'substr'>;
  substring: $PropertyType<IFbtStringish, 'substring'>;
  toLocaleLowerCase: $PropertyType<IFbtStringish, 'toLocaleLowerCase'>;
  toLocaleUpperCase: $PropertyType<IFbtStringish, 'toLocaleUpperCase'>;
  toLowerCase: $PropertyType<IFbtStringish, 'toLowerCase'>;
  toString: $PropertyType<IFbtStringish, 'toString'>;
  toUpperCase: $PropertyType<IFbtStringish, 'toUpperCase'>;
  trim: $PropertyType<IFbtStringish, 'trim'>;
  trimLeft: $PropertyType<IFbtStringish, 'trimLeft'>;
  trimRight: $PropertyType<IFbtStringish, 'trimRight'>;
  // Deprecated String methods
  anchor: $PropertyType<IFbtStringish, 'anchor'>;
  big: $PropertyType<IFbtStringish, 'big'>;
  blink: $PropertyType<IFbtStringish, 'blink'>;
  bold: $PropertyType<IFbtStringish, 'bold'>;
  fixed: $PropertyType<IFbtStringish, 'fixed'>;
  italics: $PropertyType<IFbtStringish, 'italics'>;
  small: $PropertyType<IFbtStringish, 'small'>;
  fontcolor: $PropertyType<IFbtStringish, 'fontcolor'>;
  fontsize: $PropertyType<IFbtStringish, 'fontsize'>;
  strike: $PropertyType<IFbtStringish, 'strike'>;
  sub: $PropertyType<IFbtStringish, 'sub'>;
  sup: $PropertyType<IFbtStringish, 'sup'>;
  // FBism?
  contains: $PropertyType<IFbtStringish, 'contains'>;

  static usingStringProxyMethod(
    stringProxyFn: (stringMethodName: $Keys<IFbtStringish>) => Function,
  ): Class<this>;
}

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
    },
  ): Output,
  param(
    name: string,
    value: ParamInput,
    options?: {
      number?: boolean | number,
      gender?: $IntlVariationsEnum,
    },
  ): ParamOutput,
  enum(
    value: string,
    range: $ReadOnlyArray<string> | {[key: string]: string},
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
    },
  ): ParamOutput,
  pronoun(
    usage: 'object' | 'possessive' | 'reflexive' | 'subject',
    gender: $GenderConstEnum,
    options?: {capitalize?: boolean, human?: boolean},
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
  mixed,
  string,
> &
  $ArrayBasedFbtFunctionAPI<FbtWithoutString, mixed>;

type $FbsFunctionAPI = $StringBasedFbtFunctionAPI<
  FbtPureStringResult,
  $FbsParamInput,
  $FbtParamOutput,
> &
  $ArrayBasedFbtFunctionAPI<FbtPureStringResult, $FbsParamInput>;
