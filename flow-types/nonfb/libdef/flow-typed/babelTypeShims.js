/**
 * (c) Meta Platforms, Inc. and affiliates. Confidential and proprietary.
 *
 * @flow strict
 * @format
 * @oncall i18n_fbt_js
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
  declare export class Scope<N: BabelNode = BabelNode> {
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

  declare class Hub<B: BabelNode = BabelNode> {
    file: File<B>;
    getCode(): string;
    getScope(): Scope<B>;
    addHelper(): void;
    buildError<E: Class<SyntaxError> = Class<SyntaxError>>(
      node: BabelNode,
      message: string,
      ErrorClass?: ?E,
    ): E;
  }

  declare class File<B: BabelNode = BabelNode> {
    ast: BabelNode;
    code: string;
    declarations: {};
    hub: Hub<B>;
    metadata: {};
    opts: {};
    path: NodePath<B>;
    scope: Scope<B>;
  }

  declare class NodePath<B: BabelNode = BabelNode> {
    node: B;
    parent: ?BabelNode;
    parentPath: ?NodePath<>;
    hub: Hub<B>;
    container: BabelNode;
    context: TraversalContext<B>;
    contexts: [];
    data: ?[];
    opts: {};
    key: string;
    listKey: ?string;
    scope: Scope<B>;
    skipKeys: ?[];
    type: B['type'];
    replaceWith(replacement: BabelNode): this;
    traverse<State: {...}>(transform: BabelTransform, state?: State): void;
    skip(): void;
    buildCodeFrameError<E: Class<SyntaxError> = Class<SyntaxError>>(
      message: string,
      ErrorClass?: ?E,
    ): E;
    unshiftContainer(
      listKey: string,
      nodes: BabelNode | $ReadOnlyArray<BabelNode>,
    ): void;
  }

  declare export type NodePathOf<BabelNode> = NodePath<BabelNode>;

  declare type BabelTransform = $ReadOnly<{
    CallExpression?: (path: NodePathOf<BabelNodeCallExpression>) => void,
    JSXElement?: (path: NodePathOf<BabelNodeJSXElement>) => void,
    StringLiteral?: (path: NodePathOf<BabelNodeStringLiteral>) => void,
    ...
  }>;

  declare export type BabelTransformPlugin = $ReadOnly<{
    pre: () => void,
    name: string,
    visitor: BabelTransform,
  }>;

  declare export type BabelPluginList = $ReadOnlyArray<
    string | [string] | [string, {+[option: string]: mixed}],
  >;

  declare export type BabelPresetList = BabelPluginList;

  declare export function transformSync(
    code: string,
    opts: $ReadOnly<{
      ast?: boolean,
      code?: boolean,
      filename?: ?string,
      plugins: BabelPluginList,
      sourceType?: string,
      ...
    }>,
  ): void;
}
