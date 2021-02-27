export type TNodeType = 'cursor' | 'cell' | 'key' | 'menu' | 'ref'
export type TNodeId = number
export type TNode = {
  id: TNodeId
  parentId: TNodeId
  type: TNodeType
  children?: TNodeId[]
  key?: string
  refId?: TNodeId
}
export type TActionType =
  | 'cellAdd'
  | 'menuClose'
  | 'key'
  | 'menu'
  | 'cursorMove'
  | 'cursorDelete'
export type TAction = {
  type: TActionType
  payload: any
}
export type TState = {
  cursorId: TNodeId
  rootId: TNodeId
  nodes: TNode[]
  focus: TNodeId
}
