import React, { useState, useEffect } from "react";
import hyperactiv from "hyperactiv";
import {equalsAny, isNum, swapIndexes, TPredicate} from "./util";

const { observe, computed, dispose } = hyperactiv

const reactMode = true
export function jsx(tag: any, props: Record<string, any>, ...children: any[]) {
  if (reactMode) return React.createElement(tag,props,...children)
  if (props) {
    return {type: tag, props, children}
  }
  return {tag, children}
}

export type TState = {
  focused: number[]
  nodes: TNode[]
}
type TData = { tag:'io', key:string }
type TChild = number | string
type TNode = {
  tag: string,
  children: TChild[]
}
type TIdNode = {
  id: number,
  node: TNode
}
type TPosition = {
  parent: TIdNode,
  position: number
  child: TChild
}

export function getInitialState() {
  return {
    focused: [1],
    nodes:[
    {
      tag: 'cursor'
    },
    {
      tag: 'cell',
      children: [0]
    }
    ]
  }
}
function curryEquals(first: any) {
  return (second: any)=>first===second
}

export function Machine(state: TState) {
  const observedState = observe(state)
  const focused = observedState.focused
  const nodes: TNode[] = observedState.nodes
  const cursorId = 0
  const emptyNode = {
    tag: '',
    children: []
  }

  function getNodeById(id: TChild):TNode {
    if (!isNum(id)) return emptyNode
    return nodes[id]
  }
  function isContainer(node: TNode) {
    return equalsAny(node.tag,'cell','search')
  }
  function isCursor(node: TNode) {
    return node.tag==='cursor'
  }
  function createNode(children: TChild[], tag='cell'):number {
    const newIndex = nodes.length
    const newNode = {
      tag,
      children
    }
    nodes.push(newNode)
    return newIndex
  }
  function getParentNodePosition(childNodeId: number) {
    const l = nodes.length
    const childNodeIdEqualsPredicate = curryEquals(childNodeId)
    for (let parentNodeId = 0; parentNodeId < l; parentNodeId++) {
      const parentNode = nodes[parentNodeId]
      const children = parentNode.children;
      if (!children) continue
      const childIndex = children.findIndex(childNodeIdEqualsPredicate)
      if (childIndex === -1) continue
      return {
        parentNodeId,
        parentNode,
        childIndex
      }
    }
    return {
      empty: true,
      parentNodeId: -1,
      parentNode: emptyNode,
      childIndex: -1,
    }
  }
  function findCursorIndex(children: TChild[]) {
    return children.findIndex(childNodeId => isCursor(getNodeById(childNodeId)))
  }
  function changeFocus(oldNodeId: number, newNodeId: number) {
    focused._removeItem(oldNodeId) //change focus
    focused.push(newNodeId)
  }
  function navUpEnabled(nodeId: number) {
    const node = getNodeById(nodeId)
    if (node.tag==='search') return false
    return true
  }
  function input(data: TData) {
    const {tag}=data
    console.log(data)
    if (tag==='io') {
      const { key } = data;
      if (key==='unidentified') return
      [...focused].forEach(applyInputToNode)

      function applyInputToNode(focusedNodeId: number) {
        const focusedNode = getNodeById(focusedNodeId)
        const focusedChildren = focusedNode.children
        const cursorIndex = findCursorIndex(focusedChildren)
        function goTo(destNodeId: number, index) {
          if (destNodeId===focusedNodeId) {
            swapIndexes(focusedChildren, cursorIndex, index)
            return
          }
          const destNode = getNodeById(destNodeId)
          changeFocus(focusedNodeId, destNodeId)

          focusedChildren.splice(cursorIndex, 1) //delete current cursor
          destNode.children._insertItemsAtMut(index,cursorId)
        }
        function move(direction: number) {
          const right = direction>0;
          const endIndex = right ? focusedChildren.length - 1 : 0
          const offset = right ? 1 : -1
          if (cursorIndex === endIndex) {
            if (!navUpEnabled(focusedNodeId)) return
            const parent = getParentNodePosition(focusedNodeId)
            if (parent.empty) return //root node
            const offs = right ? 1 : 0
            goTo(parent.parentNodeId, parent.childIndex+offs)
            return
          }

          const targetNodeId = focusedChildren[cursorIndex+offset]
          const targetNode = getNodeById(targetNodeId)
          if (isContainer(targetNode)) {
            const gotoIndex = right ? 0 : targetNode.children.length
            goTo(targetNodeId,gotoIndex)
            return
          }
          swapIndexes(focusedChildren, cursorIndex, cursorIndex+offset)
        }

        function backspace() {
          if (cursorIndex === 0) return
          focusedChildren.splice(cursorIndex - 1, 1)
        }
        function del() {
          if (focusedChildren.length === cursorIndex + 1) return
          focusedChildren.splice(cursorIndex + 1, 1)
        }
        function newCell() {
          const newNodeId = createNode([cursorId])
          changeFocus(focusedNodeId, newNodeId)
          focusedChildren[cursorIndex] = newNodeId
        }
        function linebreak() {
          focusedChildren._insertItemsAtMut(cursorIndex, 'br')
        }
        function moveLeft() {
          move(-1)
        }
        function moveRight() {
          move(1)
        }
        function search() {
          const newNodeId = createNode([cursorId], 'search')
          const node = getNodeById(newNodeId)
          changeFocus(focusedNodeId, newNodeId)
          focusedChildren[cursorIndex] = newNodeId
        }
        function insertKey() {
          focusedChildren._insertItemsAtMut(cursorIndex, key)
        }

        if (key === 'backspace') {
          backspace();
        } else if (key === 'delete') {
          del();
        } else if (key === "arrowleft") {
          moveLeft();
        } else if (key === "arrowright") {
          moveRight();
        } else if (key === "ctrl+enter") {
          newCell();
        } else if (key === "enter") {
          linebreak();
        } else if (key === "`") {
          search();
        } else {
          insertKey();
        }
      }
    }
    const value = getStateAsJson()
    localStorage.setItem("state", value)
    console.log(value)
  }
  function getStateAsJson() {
    return JSON.stringify(observedState, null, 2);
  }
  function Render(props) {
    const id = props.id
    const currentNode = getNodeById(id)
    const isSearch = currentNode.tag==='search'
    function renderChildren() {
      const n = getNodeById(id)
      function mapChild(childId: TChild) {
        if (!isNum(childId)) {
          if (childId === 'br') {
            return <br/>
          }
          return childId
        }
        const cn = getNodeById(childId)
        if (isCursor(cn)) {
          return '█'
        }
        return <Render id={childId}/>
      }
      return n.children?.map(mapChild)
    }

    const [children, setChildren] = useState(renderChildren());
    const [refreshState, setRefreshState] = useState(showState())
    useEffect(()=>{
      console.log('mount '+id)
      const refreshChildren = computed(()=>{
        console.log("computed render "+id)
        setChildren(renderChildren())
        setRefreshState(showState())
      })

      return ()=>{
        console.log('unmount '+id)
        dispose(refreshChildren)
      }
    },[])
    const color = isSearch ? 'red' : 'green'
    const s={border: `1px solid ${color}`, padding: "3px", display: 'inline-block', margin: '0px'}
    const pos = getParentNodePosition(id)
    function showState() {
      return <If value={id===1}>
        <br/>
        <pre style={{fontSize: '10px'}}>{getStateAsJson()}</pre>
      </If>
    }
    return <>
      <pre style={s}>#[{id}] p[{pos.parentNodeId}] {children}</pre>
      {refreshState}
    </>
  }

  state.input = input
  state.Render = Render
  return state;
}

function If(props) {
  if (props.value) return props.children
  return null
}