export type TNodeType = 'root' | 'cursor' | 'cell' | 'key' | 'menu';
export type TNodeId = number;
export type TNode = {
  id: TNodeId;
  parentId: TNodeId;
  type: TNodeType;
  children: TNodeId[];
  key?: string;
};
export type TState = {
  cursorId: TNodeId;
  rootId: TNodeId;
  nodes: TNode[];
  focus: TNodeId;
};
