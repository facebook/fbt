/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 */
declare interface PhraseData {
  desc: string;
  texts: Array<string>;
}

declare module "fb-tiger-hash" {
  export class Tiger {
    constructor(
      digestBitLen: number,
      extraPasses?: number,
      invertByte?: boolean,
      encoding?: string,
    );

    hash(input: string): string;

    static L128: number;
    static L160: number;
    static L192: number;

    static UTF8: string;
    static UTF16: string;
  }

  export function getFbtHash(
    text: string,
    description: string,
  ): string;
}
