import React, { useState, useEffect } from "react";
import hyperactiv from "hyperactiv";
import {equalsAny, isNum, TPosition, swapIndexes, TPredicate} from "./util";
import {TState} from "./index";
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
  const observed = observe(state)
  const focused = observed.focused
  const nodes: TNode[] = observed.nodes
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
    return node.tag==='cell'
  }
  function isCursor(node: TNode) {
    return node.tag==='cursor'
  }
  function createNode(children: TChild[]):number {
    const newIndex = nodes.length
    const newNode = {
      tag: 'cell',
      children
    }
    nodes.push(newNode)
    return newIndex
  }
  function getParentNodePosition(childNodeId: number) {
    const l = nodes.length
    const childNodeIdEquals = curryEquals(childNodeId)
    for (let parentNodeId = 0; parentNodeId < l; parentNodeId++) {
      const parentNode = nodes[parentNodeId]
      const children = parentNode.children;
      if (!children) continue
      const childIndex = children.findIndex(childNodeIdEquals)
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

  function input(data: TData) {
    const {tag}=data
    console.log(data)
    if (tag==='io') {
      const { key } = data;
      [...focused].forEach(applyInputToNode)
      function changeFocus(oldNodeId, newNodeId) {
        focused._removeItem(oldNodeId) //change focus
        focused.push(newNodeId)
      }
      function applyInputToNode(nodeId: number) {
        const focusedNode = getNodeById(nodeId)
        const focusedChildren = focusedNode.children
        const cursorIndex = focusedChildren.findIndex(childNodeId => isCursor(getNodeById(childNodeId)))
        function goTo(destNodeId, index) {
          if (destNodeId===nodeId) {
            swapIndexes(focusedChildren, cursorIndex, index)
            return
          }
          const destNode = getNodeById(destNodeId)
          changeFocus(nodeId, destNodeId)

          focusedChildren.splice(cursorIndex, 1) //delete current cursor
          destNode.children._insertItemsAtMut(index,cursorId)
        }
        function move(direction) {
          const right = direction>0;
          const endIndex = right ? focusedChildren.length - 1 : 0
          const offset = right ? 1 : -1
          if (cursorIndex === endIndex) {
            const parent = getParentNodePosition(nodeId)
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
        if (key === 'backspace') {
          if (cursorIndex === 0) return
          focusedChildren.splice(cursorIndex - 1, 1)
        } else if (key === 'delete') {
          if (focusedChildren.length === cursorIndex + 1) return
          focusedChildren.splice(cursorIndex + 1, 1)
        } else if (key === "arrowleft") {
          move(-1)
        } else if (key === "arrowright") {
          move(1)
        } else if (key === "ctrl+enter") {
          const newNodeId = createNode([cursorId])
          state.focused.length = 0
          state.focused.push(newNodeId)
          focusedChildren[cursorIndex]=newNodeId

        } else {
          focusedChildren._insertItemsAtMut(cursorIndex, key)
        }
      }
    }
    const value = JSON.stringify(observed, null, 2);
    localStorage.setItem("state", value)
    console.log(value)
  }

  function Render(props) {
    const id = props.id
    function renderChildren() {
      const n = getNodeById(id)

      return n.children?.map(childId => {
        if (!isNum(childId)) return childId
        const cn = getNodeById(childId)
        if (isCursor(cn)) {
          return '█'
        }
        return <Render id={childId}/>
      })
    }

    const [children, setChildren] = useState(renderChildren());
    useEffect(()=>{
      console.log('mount '+id)
      const refreshChildren = computed(()=>{
        console.log("computed render "+id)
        setChildren(renderChildren())
      })

      return ()=>{
        console.log('unmount '+id)
        dispose(refreshChildren)
      }
    },[])

    const s={border: "1px solid green", padding: "3px", display: 'inline-block', margin: '0px'}
    const pos = getParentNodePosition(id)
    return <pre style={s}>{id} {pos.parentNodeId} {children}</pre>
  }

  state.input = input
  state.Render = Render
  return state;
}

