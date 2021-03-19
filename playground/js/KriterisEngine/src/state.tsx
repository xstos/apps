/* eslint-disable import/prefer-default-export */
import { TNode, TNodeId, TState } from './types'

export function stateLens(state: TState) {
  const { nodes, rootId, cursorId, focus: focusId } = state

  function pushNode(node: TNode) {
    nodes.push(node)
  }
  function getCursorId() {
    return state.cursorId
  }
  function getCursorIndex() {
    return findChildById(getFocusedNode(), getCursorId())
  }
  function getChildren(node: TNode) {
    if (node.type === 'ref' && node.refId) {
      return nodes[node.refId].children || []
    }
    return node.children || []
  }
  function getFocusedNode() {
    return getNodeById(state.focus)
  }
  function setFocus(id: TNodeId) {
    state.focus = id
  }
  function pushChild(node: TNode, id: TNodeId) {
    getChildren(node).push(id)
  }
  function enqueueChild(node: TNode, id: TNodeId) {
    getChildren(node).splice(0, 0, id)
  }
  function insertChildren(node: TNode, index: number, ...items: TNodeId[]) {
    getChildren(node).splice(index, 0, ...items)
  }
  function getChild(node: TNode, index: number): TNodeId {
    return getChildren(node)[index]
  }
  function getChildNode(node: TNode, index: number): TNode {
    return getNodeById(getChild(node, index))
  }
  function setChild(node: TNode, index: number, id: TNodeId) {
    const old = getChild(node, index)
    getChildren(node)[index] = id
    return old
  }
  function swapChild(node: TNode, index1: number, index2: number) {
    const focusedNode = getFocusedNode()
    const childAtIndex = getChild(focusedNode, index1)
    const replaced = setChild(focusedNode, index2, childAtIndex)
    setChild(focusedNode, index1, replaced)
  }
  function getNumChildren(node: TNode) {
    return getChildren(node).length
  }
  function deleteChildren(node: TNode, index: number, count: number) {
    const removed = getChildren(node).splice(index, count)
  }
  function getParentNode(node: TNode) {
    return getNodeById(node.parentId)
  }
  function findChildById(node: TNode, id: TNodeId): TNodeId {
    return getChildren(node).findIndex2(id)
  }
  function getNodeById(id: TNodeId): TNode {
    return nodes[id]
  }
  function getCursor() {
    return getNodeById(getCursorId())
  }
  return {
    getCursorId,
    getCursorIndex,
    getChildren,
    getFocusedNode,
    setFocus,
    pushChild,
    enqueueChild,
    insertChildren,
    getChild,
    getChildNode,
    setChild,
    swapChild,
    getNumChildren,
    deleteChildren,
    getParentNode,
    findChildById,
    pushNode,
    getNodeById,
    getCursor,
  }
}
