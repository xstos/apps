import React from "react";
import hyperactiv from "hyperactiv";
import {arreq, curryEquals, has, isString, swapIndexes} from "./util";
import {store as createStore, watch} from 'hyperactiv/src/react'
const { observe, computed, dispose } = hyperactiv

const rootNodeId = 1
const cursorChar = '█'
const ctrlEnter = "ctrl+enter"
const ctrlP = "ctrl+p"
const ctrlV = "ctrl+v"
const nbsp = "\u00a0"

let reactMode = false
export function jsx(tag: any, props: Record<string, any>, ...children: any[]) {
  if (reactMode) return React.createElement(tag,props,...children)
  if (props) {
    return {tag, props, children}
  }
  return {tag, children}
}
reactMode=true

export type TState = {
  Render: (props: {id: TChild}) => JSX.Element
  input: (data: TData) => void
  nodes: TNodeData[]
  console: any[]
}

const ioTag = 'io';
type TTag = "io"
type TData = { tag: TTag, key:string }

type TChild = number | string
type TNode = {
  tag: string,
  children: TChild[]
  lastNodeStack?: number[]
}
type TNodeData = TNode | number

type TNewCellArgs = {
  tag?: string
  children?: TChild[]
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

export function Machine(state: TState) {
  const observedState = createStore(state)
  const nodes: TNodeData[] = observedState.nodes
  const cursorId = 0
  const emptyNode = {
    tag: '',
    children: [],
  }
  function log(...items: any[]) {
    return
    state.console.push(...items)
  }
  function isRef(id: TChild) {
    if (typeof id !== "number") return false
    return typeof nodes[id] === 'number'
  }
  function getNodeById(id: TChild):TNode {
    if (typeof id === 'string') return emptyNode
    const ret = nodes[id]
    if (typeof ret === 'number') {
      return nodes[ret] as TNode
    }
    return ret
  }
  function hasChildren(node: TNode) {
    return node.tag!=="" && has(node, 'children')
  }
  function isCursor(node: TNode) {
    return node.tag==='cursor'
  }
  function createNode2(args: TNewCellArgs) {
    return createNode(args.children || [], args.tag)
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
  function createNodeAndRef(args : TNewCellArgs | undefined = undefined) {
    const id = args === undefined ? createNode() : createNode2(args)
    return createRef(id)
  }
  function getParentNodePosition(childNodeId: number) {
    const l = nodes.length
    const childNodeIdEqualsPredicate = curryEquals(childNodeId)
    for (let parentNodeId = 0; parentNodeId < l; parentNodeId++) {
      const parentNode = nodes[parentNodeId] as TNode
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

    if (tag===ioTag) {
      let { key } = data
      if (key==='unidentified') return;
      findChildrenBackward()
          .filter(pos=>pos.childValue===cursorId)
          .forEach(pos=> {
            applyInputToNode(pos.nodeId, pos.childIndex);
          })

      function applyInputToNode(focusedNodeId: number, cursorIndex: number) {
        const focusedNode = getNodeById(focusedNodeId)
        const focusedChildren = focusedNode.children

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

          const [directionLeft, directionRight] = [direction<0, direction>0]
          const [cursorLeftmost, cursorRightmost] = [cursorIndex===0,  cursorIndex === focusedChildren.length - 1]

          const offset = directionRight ? 1 : -1
          if (directionLeft && cursorLeftmost || directionRight && cursorRightmost) {
            //exiting a cell (ascending)
            if (!canNavUp(focusedNodeId)) return

            if (cursorNode.lastNodeStack?.length===1) return //root node
            const parentId = cursorNode.lastNodeStack?.pop()
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
            cursorNode.lastNodeStack?.push(targetNodeId as number)
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
        function newCell(args : TNewCellArgs | undefined = undefined) {
          const newNodeId = createNodeAndRef(args)
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

          // @ts-ignore
          const searchJsx = <cell><cell query><cursor/>hi there</cell><br/><cell containsQuery><contains><ref query/></contains></cell><br/><cell row><set visible/><action>yo</action><br/></cell><visible><action>yo2</action><br/></visible></cell>
          console.log(searchJsx)
          reactMode=true

          function injectJsxAsNodes(jsx: any) {
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
            const exploded = mappedChildren.reduce((accum: any[], current: string)=>{
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
        function insertKeys(chars: string[]) {
          insertItems(focusedChildren,cursorIndex, ...chars)
        }
        if (false) { }
        else if (key.startsWith('{') && key.endsWith('}')) {
          const command = JSON.parse(key)
          if (command.tag==='newRef') {
            const targetId = nodes[command.id] as number
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
        } else if (key==='shift+arrowleft') {

        } else if (key==='shift+arrowright') {

        } else if (key === ctrlEnter) {
          newCell();
        } else if (key === "ctrl+r") {
          newCell();
        } else if (key === "ctrl+p") {
          newCell({ tag: 'pipe'})
        } else if (key === "ctrl+v") {
          navigator.clipboard.readText().then(
            clipText => {
              const clipChars = clipText.split('')
              insertKeys(clipChars)
            });
        }
        else if (key === "enter") {
          linebreak();
        } else if (key === "`") {
          search();
        }
        else {
          insertKey();
        }
      }
    }
    const value = getStateAsJson()
    console.log(value)
    //localStorage.setItem("state", value)
  }
  function getStateAsJson() {
    return JSON.stringify(observedState, null, 2);
  }
  function Verb(props: {value: any, children: any}) {
    return <button onClick={()=>{
      input(props.value)
      blurActiveElement()
    }
    }>{props.children}</button>
  }
  function R(n: TNode,id: TChild, path: number[]) {
    const buttonLabel = isRef(id) ? nodes[id as number] : id
    function ActionButton(props: any) {
      return <button key={"ab_"+id} onClick={()=>{
        const key = JSON.stringify({ tag: 'newRef', id })
        input({tag:ioTag, key })
        blurActiveElement()
      }
      }>{props.children}</button>
    }
    function mapChild(childId: TChild) {
      if (typeof childId === 'string') {
        if (childId === 'br') {
          return <>↵<br/></>
        }
        if (childId === '\r') {
          return '␍'
        }
        if (childId === '\n') {
          return <>␤<br/></>
        }
        return childId
      }
      const cn = getNodeById(childId)
      if (isCursor(cn)) {
        if (!arreq(cn.lastNodeStack || [], path)) {
          //render alternate cursor inside cloned nodes that don't match the cursor's path
          return <span style={{color: '#303030'}}>{cursorChar}</span>
        }

        //const cursorDebugStr = <span>{buttonLabel}({id}) {JSON.stringify(cn.lastNodeStack)}</span>
        return <span className={'blink_me'}>{nbsp}</span>
      }
      const pathClone = [...path]
      pathClone.push(childId)
      return R(cn, childId, pathClone)
    }

    const showRefButton = id!==rootNodeId;
    const verbs = {
      newCell: <Verb value={{tag: ioTag, key: ctrlEnter}}>New Cell</Verb>,
      pipe: <Verb value={{tag: ioTag, key: ctrlP}}>Pipe</Verb>,
      paste: <Verb value={{tag: ioTag, key: ctrlV}}>Paste</Verb>,
    }
    const jpath = JSON.stringify(path);
    const style = {
      display: 'inline-block',
      maxWidth: '120ch',
      border: '1px dashed grey'
    };
    const rootStyle = {

    }
    //const s = '*'.repeat(1000)

    if (!showRefButton) {
      return <div className={"ofw"} style={rootStyle}>{[...Object.values(verbs)]}<br/>
        {n.children.map(mapChild)}</div>
    }
    return <div className={"ofw"} style={style}>{n.tag}<ActionButton>{buttonLabel}</ActionButton>{n.children.map(mapChild)}
    </div>
  }

  state.input = input
  state.Render = watch(()=>R(nodes[1] as TNode,1, [1]))

  return state
}

function If(props: {value: boolean, children: any}) {
  if (props.value) return <>{props.children}</>
  return null
}

function Color(props: any) {
  const {children, ...rest} =  props;
  const color = Object.keys(rest)[0]
  //const display = 'inline-block'
  return <span key={JSON.stringify(children)} style={{ color }}>{children}</span>
}

function blurActiveElement() {
  // @ts-ignore
  document.activeElement?.blur()
}

