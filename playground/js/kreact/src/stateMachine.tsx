import React, {useEffect, useState} from "react";
import hyperactiv from "hyperactiv";
import {arreq, curryEquals, has, isString, swapIndexes} from "./util";

const { observe, computed, dispose } = hyperactiv
import { watch, store as createStore } from 'hyperactiv/src/react'

/*
const testObj = {
  a: {
    a1: {

    }
  }
}
const obs = observe(testObj, {
  bubble: true,
  deep: true
})

obs.__handler = (keys, value, oldValue, observedObject) => {
  console.log({keys,value,oldValue, observedObject})
}

obs.a.a1.foo=true
*/

let reactMode = false
export function jsx(tag: any, props: Record<string, any>, ...children: any[]) {
  if (reactMode) return React.createElement(tag,props,...children)
  if (props) {
    return {tag, props, children}
  }
  return {tag, children}
}
reactMode=true
const br = <br/>
export type TState = {
  Render: (props: {id: TChild}) => JSX.Element
  input: (data: TData) => void
  nodes: TNode[]
  console: any[]
}
type TData = { tag:'io', key:string }
type TChild = number | string
type TNode = {
  tag: string,
  children: TChild[]
  positions: TPosition[]
  lastNodeStack: number[]
}
type TIdNode = {
  id: number,
  node: TNode
}
type TPosition = {
  id: number
  index: number
}

export function getInitialState() {
  return {
    nodes: [
    {
      id: 0,
      tag: 'cursor',
      lastNodeStack: [1]
    },
    {
      id: 1,
      root: true,
      tag: 'cell',
      children: [0]
    },
    ],
    console: []
  }
}
const rootNodeId = 1
const cursorChar = '█'
export function Machine(state: TState) {
  const observedState = createStore(state)
  const nodes: TNode[] = observedState.nodes
  const cursorId = 0
  const emptyNode = {
    tag: '',
    children: []
  }
  function log(...items) {
    return
    state.console.push(...items)
  }
  function isRef(id: TChild) {
    return typeof nodes[id] === 'number'
  }
  function getNodeById(id: TChild):TNode {
    if (typeof id === 'string') return emptyNode
    const ret = nodes[id]
    if (typeof ret === 'number') {
      return nodes[ret]
    }
    return ret
  }
  function hasChildren(node: TNode) {
    return node.tag !=='' && has(node, 'children')
  }
  function isCursor(node: TNode) {
    return node.tag==='cursor'
  }
  function createNode(children: TChild[]=[], tag='cell'):number {
    const newIndex = nodes.length
    const newNode = {
      id: newIndex,
      tag,
      children
    }
    nodes.push(newNode)
    return newIndex
  }
  function createRef(id: number) {
    const newIndex = nodes.length
    nodes.push(id)
    return newIndex
  }
  function createNodeAndRef() {
    const id = createNode()
    return createRef(id)
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
        id: parentNodeId,
        node: parentNode,
        index: childIndex
      }
    }
    return {
      empty: true,
      id: -1,
      node: emptyNode,
      index: -1,
    }
  }
  function findCursorIndex(children: TChild[]) {
    return children.findIndex(childNodeId => isCursor(getNodeById(childNodeId)))
  }
  function evaluateNodeAsText(node: TNode) {
    return node.children && node.children.filter(isString).join('')
  }
  function canNavUp(nodeId: number) {
    const node = getNodeById(nodeId)
    if (node.tag==='search') return false
    return true
  }
  function isFocused(n: TNode) {
    return hasChildren(n) && findCursorIndex(n.children) !== -1;
  }
  function findChildrenBackward() {
    const numNodes = nodes.length
    let node
    const ret = []
    for (let nodeId = 0; nodeId < numNodes; nodeId++) {
      node=getNodeById(nodeId)
      if (rootNodeId!==nodeId && typeof nodes[nodeId] ==='number') continue
      if (!hasChildren(node)) continue
      const children = node.children
      const numChildren = children.length
      for (let childIndex = numChildren-1; childIndex >= 0; childIndex--) {
        ret.push({
          node,
          nodeId,
          childIndex,
          childValue: children[childIndex]
        })
      }
    }
    return ret
  }
  function input(data: TData) {
    const {tag}=data

    if (tag==='io') {
      let { key } = data
      if (key==='unidentified') return
      findChildrenBackward()
          .filter(pos=>pos.childValue===cursorId)
          .forEach(pos=> {
            applyInputToNode(pos.nodeId, pos.childIndex);
          })

      function applyInputToNode(focusedNodeId: number, cursorIndex: number) {
        const focusedNode = getNodeById(focusedNodeId)
        const focusedChildren = focusedNode.children
        // if (focusedChildren.length===0) {
        //   debugger
        // }
        const cursorNode = getNodeById(focusedChildren[cursorIndex])

        function insertItems(children=focusedChildren, index=cursorIndex, ...items: TChild[]) {
          log(`insert ${index}`)
          children._insertItemsAtMut(index,...items)
        }

        function move(direction: number) {
          function goTo(destNodeId: number, index: number) {
            if (destNodeId===focusedNodeId) {
              swapIndexes(focusedChildren, cursorIndex, index)
              return
            }
            log(`goto ${destNodeId} ${index}`)

            const destNode = getNodeById(destNodeId)
            focusedChildren.splice(cursorIndex, 1) //delete current cursor
            //destNode.children._insertItemsAtMut(index,cursorId)
            insertItems(destNode.children,index,cursorId)
          }
          //debugger
          const directionRight = direction>0;
          const directionLeft = !directionRight
          const cursorLeftmost = cursorIndex === 0
          const cursorRightmost = cursorIndex === focusedChildren.length - 1
          const offset = directionRight ? 1 : -1
          if (directionLeft && cursorLeftmost || directionRight && cursorRightmost) {
            //exiting a cell (ascending)
            if (!canNavUp(focusedNodeId)) return

            if (cursorNode.lastNodeStack.length===1) return //root node
            const parentId = cursorNode.lastNodeStack.pop()
            if (!parentId) {
              debugger
              return
            }

            const parentPos = getParentNodePosition(parentId)

            const offs = directionRight ? 1 : 0
            goTo(parentPos.id, parentPos.index+offs)
            return
          }

          const targetNodeId = focusedChildren[cursorIndex+offset]

          const targetNode = getNodeById(targetNodeId)
          if (hasChildren(targetNode)) {
            //entering a cell (descending)
            const gotoIndex = directionRight ? 0 : targetNode.children.length
            cursorNode.lastNodeStack.push(targetNodeId)
            goTo(targetNodeId as number,gotoIndex)
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
          const newNodeId = createNodeAndRef()
          insertItems(focusedChildren,cursorIndex+1, newNodeId)
          //focusedChildren._insertItemsAtMut(cursorIndex, newNodeId)

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

          reactMode = false
          const searchJsx =
              <cell>
                <cell query><cursor/>hi there</cell><br/>
                <cell containsQuery><contains><ref query/></contains></cell>
                <br/>
                <cell row>
                  <set visible></set>
                  <action>yo</action><br/>
                </cell>
                <visible>
                  <action>yo2</action><br/>
                </visible>
              </cell>
          console.log(searchJsx)
          reactMode=true

          function injectJsxAsNodes(jsx) {
            if (isString(jsx)) {
              return jsx
            }
            if (jsx.tag==='br') {
              return 'br'
            }
            if (jsx.tag==='cursor') {
              return cursorId
            }
            const mappedChildren = jsx.children.map(injectJsxAsNodes)
            const exploded = mappedChildren.reduce((accum, current)=>{
              if (isString(current)) {
                if (current==='br') return accum.concat(['br'])
                return accum.concat(...(current._toCharArray()))
              } else {
                return accum.concat(current)
              }
            },[])
            return createNode(exploded, jsx.tag)
          }
          const newNodeId = injectJsxAsNodes(searchJsx)
          const node = getNodeById(newNodeId)
          focusedChildren[cursorIndex] = newNodeId
        }
        function insertKey(text: string = key) {
          insertItems(focusedChildren,cursorIndex, text)
          //focusedChildren._insertItemsAtMut(cursorIndex, text)
        }

        if (false) { }
        else if (key.startsWith('{')) {
          const command = JSON.parse(key)
          if (command.tag==='newRef') {
            const targetId = nodes[command.id]
            const newRefId = createRef(targetId)
            focusedChildren._insertItemsAtMut(cursorIndex+1,newRefId)
          }
        }
        else if (key === 'backspace') {
          backspace();
        } else if (key === 'delete') {
          del();
        } else if (key === "arrowleft") {
          moveLeft();
        } else if (key === "arrowright") {
          moveRight();
        } else if (key === "arrowup") {

        } else if (key === "arrowdown") {

        } else if (key.startsWith('shift+') && key.length===7) {
          insertKey(key.replace('shift+','').toUpperCase())
        }
        else if (key === "ctrl+enter") {
          newCell();
        }
        else if (key === "ctrl+r") {
          newCell();
        }
        else if (key === "enter") {
          linebreak();
        } else if (key === "`") {
          search();
        } else {
          insertKey();
        }
      }
    }
    const value = getStateAsJson()
    //localStorage.setItem("state", value)
  }
  function getStateAsJson() {
    return JSON.stringify(observedState, null, 2);
  }

  function R(n: TNode,id: TChild, path: number[]) {
    const buttonLabel = isRef(id) ? nodes[id] : id
    function ActionButton(props) {
      return <button key={"ab_"+id} onClick={()=>{
        const key = JSON.stringify({ tag: 'newRef', id })
        input({tag:'io', key })
        blurActiveElement()
      }
      }>{props.children}</button>
    }
    function mapChild(childId: TChild) {
      if (typeof childId === 'string') {
        if (childId === 'br') {
          return <>↵<br/></>
        }
        return childId
      }
      const cn = getNodeById(childId)
      if (isCursor(cn)) {
        if (!arreq(cn.lastNodeStack, path)) {
          //render alternate cursor inside cloned nodes that don't match the cursor's path
          return <span style={{color: '#303030'}}>{cursorChar}</span>
        }

        const lns = JSON.stringify(cn.lastNodeStack);
        const cursorDebugStr = <span>{buttonLabel}({id}) {lns}</span>
        return <span className={'blink_me'}> </span>
      }
      const pathClone = [...path]
      pathClone.push(childId)
      return R(cn, childId, pathClone)
    }

    const showRefButton = id!==rootNodeId;

    const jpath = JSON.stringify(path);
    return <pre style={{border: '1px dashed grey' , display: 'inline-block', padding: '5px'}}>
      <If value={showRefButton}>
        <ActionButton>{buttonLabel}</ActionButton>
      </If>
      {n.children.map(mapChild)}
    </pre>
  }

  state.input = input
  state.Render = watch(()=>R(nodes[1],1, [1]))

  return state
}

function ternary(test, valueIfTrue, valueIfFalse=undefined) {
  return test ? valueIfTrue : valueIfFalse
}
function If(props: {value: boolean, children: any}) {
  if (props.value) return <>{props.children}</>
  return null
}

function Color(props) {
  const {children, ...rest} =  props;
  const color = Object.keys(rest)[0]
  //const display = 'inline-block'
  return <span key={JSON.stringify(children)} style={{ color }}>{children}</span>
}

function blurActiveElement() {
  document.activeElement?.blur()
}

