import React, { useState, useEffect } from "react";
import hyperactiv from "hyperactiv";
import {equalsAny, isNum, swapIndexes} from "./util";
const { observe, computed, dispose } = hyperactiv

const reactMode = true
export function jsx(tag: any, props: Record<string, any>, ...children: any[]) {
  if (reactMode) return React.createElement(tag,props,...children)
  if (props) {
    return {type: tag, props, children}
  }
  return {tag, children}
}

type TData = { tag:'io', key:string }
type TChild = number | string
type TNode = {
  tag: string,
  children: TChild[]
}

export function Machine(state) {
  const observed = observe(state)
  const focused = observed.focused
  const nodes = observed.nodes
  const cursorId = 1
  function getNodeById(id):TNode {
    if (!isNum(id)) return ({
      tag: '',
      children: []
    })
    return nodes[id]
  }
  function isCursor(node: TNode) {
    return node.tag==='cursor'
  }
  function createNode(children):number {
    const newIndex = nodes.length
    const newNode = {
      tag: 'cell',
      children
    }
    nodes.push(newNode)
    return newIndex
  }
  function input(data: TData) {
    const {tag}=data
    console.log(data)
    if (tag==='io') {
      const { key } = data
      focused.forEach(applyInputToNode)

      function applyInputToNode(nodeId: number) {
        const focusedNode = getNodeById(nodeId)
        const focusedChildren = focusedNode.children
        const cursorIndex = focusedChildren.findIndex(childNodeId => isCursor(getNodeById(childNodeId)))
        if (key === 'backspace') {
          if (cursorIndex === 0) return
          focusedChildren.splice(cursorIndex - 1, 1)
        } else if (key === 'delete') {
          if (focusedChildren.length === cursorIndex + 1) return
          focusedChildren.splice(cursorIndex + 1, 1)
        } else if (key === "arrowleft") {
          if (cursorIndex === 0) return
          swapIndexes(focusedChildren, cursorIndex, cursorIndex - 1)
        } else if (key === "arrowright") {
          if (cursorIndex === focusedChildren.length - 1) return
          swapIndexes(focusedChildren, cursorIndex, cursorIndex + 1)
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
    localStorage.setItem("state", JSON.stringify(observed))
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

    const s={border: "1px solid green", padding: "5px"}
    return <pre style={s}>{id} {children}</pre>
  }

  state.input = input
  state.Render = Render
  return state;
}

