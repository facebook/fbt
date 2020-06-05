/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict
 */

declare module '@babel/core' {
  declare class NodePath<T: BabelNode = BabelNode> {
    node: T;
    parent: ?BabelNode;
    parentPath: ?NodePath<>;
    replaceWith(replacement: BabelNode): this;
    traverse<State: {...}, ExtraProps: {}>(
      transform: BabelTransform<ExtraProps>,
      state: State,
    ): void;
  }

  declare type NodePathOf<BabelNode> = NodePath<BabelNode>;

  declare type BabelTransform<ExtraProps: {}> = {
    CallExpression?: (
      path: NodePathOf<BabelNodeCallExpression & ExtraProps>,
    ) => void,
    JSXElement?: (path: NodePathOf<BabelNodeJSXElement & ExtraProps>) => void,
  };

  declare type BabelTransformPlugin<ExtraProps: {}> = {
    pre: () => void,
    name: string,
    visitor: BabelTransform<ExtraProps>,
  };

  declare type BabelPluginList = Array<
    string | [string] | [string, {[option: string]: mixed}],
  >;

  declare function transformSync(
    code: string,
    opts: {
      ast?: boolean,
      code?: boolean,
      filename?: string,
      plugins: BabelPluginList,
      sourceType?: string,
    },
  ): void;
}
