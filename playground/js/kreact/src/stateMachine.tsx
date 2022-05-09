import React, {useEffect, useState} from "react";
import hyperactiv from "hyperactiv";
import { curryEquals, has, isString, swapIndexes} from "./util";

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
      lastNodeStack: []
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
          const endIndex = directionRight ? focusedChildren.length - 1 : 0
          const offset = directionRight ? 1 : -1
          if (cursorIndex === endIndex) {
            //exiting a cell (ascending)
            if (!canNavUp(focusedNodeId)) return

            if (cursorNode.lastNodeStack.length<1) return //root node
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

  function Render(props: {id: TChild, index: number}): JSX.Element {
    const id = props.id
    const index = props.index
    const currentNode = getNodeById(id)
    const hasCursor = isFocused(currentNode)
    const { tag } = currentNode
    const isSearch = currentNode.tag==='search'
    function renderChildren() {
      const n = getNodeById(id)
      function mapChild(childId: TChild, index: number) {
        if (typeof childId === 'string') {
          const indexStr = '' // `(${index})`
          if (childId.startsWith('{')) {
            const obj = JSON.parse(childId)
            const { id, tag } = obj
            if (tag===cursorChar) {
              return '▒' + indexStr
            }
          }
          if (childId === 'br') {
            return <br/>
          }

          return childId + indexStr
        }
        const cn = getNodeById(childId)
        if (isCursor(cn)) {
          if (isRef(id) && cn.lastNodeStack[cn.lastNodeStack.length-1]!==id) {
            return null
          }

          return <span className={'blink_me'}>{cursorChar}</span>
        }
        return <Render id={childId as number} index={index}/>
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
    const s={border: `1px solid ${color}`, padding: "3px"}
    //const pos = getParentNodePosition(id)
    function showState() {
      return <If value={id===rootNodeId}>
        <br/><br/>
        <pre style={{font: '8px consolas, monospace', color: 'grey'}}>{getStateAsJson()}</pre>
      </If>
    }
    function renderSearchResultsWip() {
      const searchText = evaluateNodeAsText(currentNode)

      function canReferenceCell(n, i) {
        return i !== rootNodeId && n.tag === 'cell';
      }

      const cells = nodes._filterMap((n,i)=>[canReferenceCell(n,i), {n,i:id, text: evaluateNodeAsText(n)}])
      
      return (<div>
        {cells.map(({n,id,text})=><div>{id} {text}</div>)}
      </div>)
    }
    function ActionButton(props) {
      return <button key={"ab_"+id} onClick={()=>{
        const key = JSON.stringify({ tag: 'newRef', id })
        input({tag:'io', key })
        document.activeElement?.blur()
      }
      }>{props.children}</button>
    }
    function shouldInsertPrefixLineBreak() {
      return tag.startsWith('search')
    }

    if (id===rootNodeId) {
      return <>
        <pre key={id}>{children}</pre>
        {refreshState}
      </>
    }
    function CursorBrackets(props) {
      if (!hasCursor) return props.children
      return <>
        <If value={hasCursor}>
          <Color red>[</Color></If>
        {props.children}
        <If value={hasCursor}><Color red>]</Color>
        </If>
      </>
    }
    //const ntag =currentNode.tag

    return <>

      <If value={shouldInsertPrefixLineBreak()}><br/></If>
      <pre key={id} style={s}><ActionButton>{id}</ActionButton>
        <CursorBrackets>
          <pre key={id+"_2"} style={{border: '1px dashed grey' , display: 'inline-block'}}>
            {children}
          </pre>
        </CursorBrackets>
      </pre>
    </>
  }

  state.input = input
  function R(n: TNode,id: TChild) {
    function ActionButton(props) {
      return <button key={"ab_"+id} onClick={()=>{
        const key = JSON.stringify({ tag: 'newRef', id })
        input({tag:'io', key })
        document.activeElement?.blur()
      }
      }>{props.children}</button>
    }
    function mapChild(childId: TChild) {
      if (typeof childId === 'string') {
        if (childId === 'br') {
          return <br/>
        }
        return childId
      }
      const cn = getNodeById(childId)
      if (isCursor(cn)) {
        if (isRef(id) && cn.lastNodeStack[cn.lastNodeStack.length - 1] !== id) {
          return null
        }

        return <span className={'blink_me'}>{cursorChar}</span>
      }
      return R(cn, childId)
    }
    return <pre style={{border: '1px dashed grey' , display: 'inline-block'}}>
      <ActionButton>{id}</ActionButton>
      {n.children.map(mapChild)}
    </pre>
  }

  state.Render = watch(()=>R(nodes[1],1))

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