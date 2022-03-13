import React, { useState, useEffect } from "react";
import hyperactiv from "hyperactiv";
import {equalsAny, isNum, swapIndexes} from "./util";

const reactMode = true
export function jsx(tag: any, props: Record<string, any>, ...children: any[]) {
  if (reactMode) return React.createElement(tag,props,...children)
  if (props) {
    return {type: tag, props, children}
  }
  return {tag, children}
}

const { observe, computed, dispose } = hyperactiv

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

  function input(data: TData) {
    const {tag}=data
    console.log(data)
    if (tag==='io') {
      const { key } = data
      focused.forEach((nodeId: number) => {
        const focusedNode = getNodeById(nodeId)
        const focusedChildren = focusedNode.children
        const focusedNodeIndex = focusedChildren.findIndex(childNodeId => isCursor(getNodeById(childNodeId)))
        if (key === 'backspace') {
          if (focusedNodeIndex === 0) return
          focusedChildren.splice(focusedNodeIndex-1, 1)
        }
        else if (key==="arrowleft") {
          if (focusedNodeIndex === 0) return
          swapIndexes(focusedChildren,focusedNodeIndex,focusedNodeIndex-1)
        }
        else if (key==="arrowright") {
          if (focusedNodeIndex === focusedChildren.length-1) return
          swapIndexes(focusedChildren,focusedNodeIndex,focusedNodeIndex+1)
        }
        else if (equalsAny(key,"arrowleft","arrowright","arrowup","arrowdown")) {

        } else {
          focusedChildren._insertItemsAtMut(focusedNodeIndex, key)
        }
      })
    }
    localStorage.setItem("state", JSON.stringify(observed))
  }

  state.input = input

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

  state.Render = Render
  return state;
}

