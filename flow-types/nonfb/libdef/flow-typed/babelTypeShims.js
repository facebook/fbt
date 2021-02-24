/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict
 * @emails oncall+internationalization
 */

declare module '@babel/core' {
  // See: https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#bindings
  declare class Binding {
    identifier: BabelNodeIdentifier; // not sure if it allows other types of nodes too
    scope: Scope<>;
    path: NodePathOf<BabelNode>;
    kind: 'var' | 'const' | 'let';
    referenced: boolean;
    references: number;
    referencePaths: Array<NodePathOf<BabelNode>>;
    constant: boolean;
    constantViolations: Array<NodePathOf<BabelNode>>;
  }

  // See: https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#scopes
  declare class Scope<N: BabelNode = BabelNode> {
    path: NodePath<N>;
    block: N;
    parentBlock: ?BabelNode;
    parent: ?Scope<>;
    bindings: Array<Binding>;
    getBinding(string): Binding;
  }

  declare class TraversalContext<B: BabelNode> {
    parentPath: NodePathOf<BabelNode>;
    scope: Scope<B>;

    // not sure what's in the below fields yet
    state: ?{};
    opts: {};
    priorityQueue: Array<mixed>;
  }

  declare class NodePath<B: BabelNode = BabelNode> {
    node: B;
    parent: ?BabelNode;
    parentPath: ?NodePath<>;
    replaceWith(replacement: BabelNode): this;
    traverse<State: {...}, ExtraProps: {}>(
      transform: BabelTransform<ExtraProps>,
      state: State,
    ): void;
    context: TraversalContext<B>;
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

  declare type BabelPresetList = BabelPluginList;

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
