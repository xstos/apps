import React, {useEffect, useState} from "react";
import hyperactiv from "hyperactiv";
import {isNum, swapIndexes} from "./util";
import {debug} from "hyperactiv/types/handlers";

const { observe, computed, dispose } = hyperactiv

let reactMode = false
export function jsx(tag: any, props: Record<string, any>, ...children: any[]) {
  if (reactMode) return React.createElement(tag,props,...children)
  if (props) {
    return {type: tag, props, children}
  }
  return {tag, children}
}



const searchJsx = <jumpmenu>
  <text/>
  <results>

  </results>
</jumpmenu>

reactMode=true

export type TState = {
  Render: (props: {id: TChild}) => JSX.Element;
  input: (data: TData) => void;
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
const rootNodeId = 1
function isString(o) {
  return typeof o === 'string'
}
function hasTag(node: TNode, tag: string) {
  const spl = node.tag.split('_')
  return spl.includes(tag)
}
function curryEquals(first: any) {
  return (second: any)=>first===second
}
function has(o:any,key:string):boolean {
  return key in o
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
    return nodes[id as number]
  }
  function isContainer(node: TNode) {
    return node.tag !=='' && has(node, 'children')
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
  function evaluateNodeAsText(node: TNode) {
    return node.children && node.children.filter(isString).join('')
  }
  function navUpEnabled(nodeId: number) {
    const node = getNodeById(nodeId)
    if (node.tag==='search') return false
    return true
  }
  function getFocusedNodeIds() {
    return nodes.map((n, i) => [n, i])
        .filter(([n, i]) => isContainer(n) && findCursorIndex(n.children) !== -1)
        .map(([n, i]) => i as number)
  }
  function input(data: TData) {
    const {tag}=data

    if (tag==='io') {
      const { key } = data;
      if (key==='unidentified') return
      getFocusedNodeIds().forEach(applyInputToNode)

      function applyInputToNode(focusedNodeId: number) {
        const focusedNode = getNodeById(focusedNodeId)
        const focusedChildren = focusedNode.children
        const cursorIndex = findCursorIndex(focusedChildren)
        function goTo(destNodeId: number, index: number) {
          if (destNodeId===focusedNodeId) {
            swapIndexes(focusedChildren, cursorIndex, index)
            return
          }
          const destNode = getNodeById(destNodeId)
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
          const newNodeId = createNode([cursorId])
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

          reactMode = false
          const searchJsx = <jumpmenu>
            <text><cursor/>hi there</text>
            <results>

            </results>
          </jumpmenu>
          reactMode=true

          function injectJsxAsNodes(jsx) {
            if (isString(jsx)) {
              return jsx
            }
            const mappedChildren = jsx.children.map(childJsx=>{
              const cid = injectJsxAsNodes(childJsx)
              return cid
            })
            const exploded = mappedChildren.reduce((accum, current)=>{
              if (isString(current)) {
                const split = current.split('');

                const c = accum.concat(...split);
                debugger
                return c
              } else {
                return accum.concat(current)
              }
            },[])
            const newNodeId = createNode(exploded, jsx.tag)
            return newNodeId
          }
          const newNodeId = injectJsxAsNodes(searchJsx)
          const node = getNodeById(newNodeId)
          focusedChildren[cursorIndex] = newNodeId
          //const newNodeId = createNode([cursorId], 'search')

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
        } else if (key === "arrowup") {

        } else if (key === "arrowdown") {

        }
        else if (key === "ctrl+enter") {
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
    //localStorage.setItem("state", value)

  }
  function getStateAsJson() {
    return JSON.stringify(observedState, null, 2);
  }
  function Render(props: {id: TChild}): JSX.Element {
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
        return <Render id={childId as number}/>
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
    const s={border: `1px solid ${color}`}
    const pos = getParentNodePosition(id)
    function showState() {
      return <If value={id===1}>
        <br/>
        <pre style={{}}>{getStateAsJson()}</pre>
      </If>
    }
    function renderSearch() {
      const searchText = evaluateNodeAsText(currentNode)

      function canReferenceCell(n, i) {
        return i !== rootNodeId && n.tag === 'cell';
      }

      const cells = nodes._filterMap((n,i)=>[canReferenceCell(n,i), {n,i:id, text: evaluateNodeAsText(n)}])
      
      return (<div>
        {cells.map(({n,id,text})=><div>{id} {text}</div>)}
      </div>)
    }
    return <>
      <pre style={s}>id:{id} tag:{currentNode.tag} parent:{pos.parentNodeId} {children}</pre>
      {ternary(isSearch, renderSearch())}
      {refreshState}
    </>
  }

  state.input = input
  state.Render = Render
  return state
}
function mapFilter<T>(items: T[], )
function ternary(test, valueIfTrue, valueIfFalse=undefined) {
  return test ? valueIfTrue : valueIfFalse
}
function If(props: {value: boolean, children: any}) {
  if (props.value) return props.children
  return null
}

