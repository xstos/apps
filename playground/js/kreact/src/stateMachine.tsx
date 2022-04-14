import React, {useEffect, useState} from "react";
import hyperactiv from "hyperactiv";
import { curryEquals, has, isString, swapIndexes} from "./util";

const { observe, computed, dispose } = hyperactiv

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
  Render: (props: {id: TChild}) => JSX.Element;
  input: (data: TData) => void;
  nodes: TNode[]
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
      tag: 'cursor',
      positions: [],
      lastNodeStack: []
    },
    {
      tag: 'cell',
      children: [0]
    },
    ],
    cells: {}
  }
}
const rootNodeId = 1
const cursorChar = '█'
export function Machine(state: TState) {
  const observedState = observe(state)

  const nodes: TNode[] = observe(state.nodes)
  const cursorId = 0
  const emptyNode = {
    tag: '',
    children: []
  }

  function getNodeById(id: TChild):TNode {
    if (typeof id === 'string') return emptyNode
    return nodes[id]
  }
  function hasChildren(node: TNode) {
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
      node=nodes[nodeId]
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
        const cursorNode = getNodeById(focusedChildren[cursorIndex])
        function saveCursorPos(id: number, index: number) {
          cursorNode.positions[id]={
            id, index
          }
        }

        function move(direction: number) {
          function goTo(destNodeId: number, index: number) {
            if (destNodeId===focusedNodeId) {
              swapIndexes(focusedChildren, cursorIndex, index)
              return
            }

            const destNode = getNodeById(destNodeId)
            focusedChildren.splice(cursorIndex, 1) //delete current cursor
            destNode.children._insertItemsAtMut(index,cursorId)
          }
          const directionRight = direction>0;
          const directionLeft = !directionRight
          const endIndex = directionRight ? focusedChildren.length - 1 : 0
          const offset = directionRight ? 1 : -1
          if (cursorIndex === endIndex) {
            //exiting a cell (ascending)
            if (!canNavUp(focusedNodeId)) return

            if (cursorNode.lastNodeStack.length<1) return //root node
            const parentId = cursorNode.lastNodeStack.pop() || rootNodeId
            if (!cursorNode.positions[parentId]) return //root node

            const parentPos = cursorNode.positions[parentId]
            const offs = directionRight ? 2 : 0
            //goTo(parent.id, parent.index+offs)
            const destIndex = directionLeft ? parentPos.index : parentPos.index+2
            saveCursorPos(focusedNodeId, destIndex)
            goTo(parentId, parentPos.index+offs)
            return
          }

          const targetNodeId = focusedChildren[cursorIndex+offset]
          const targetNode = getNodeById(targetNodeId)
          if (hasChildren(targetNode)) {
            //entering a cell (descending)
            const gotoIndex = directionRight ? 0 : targetNode.children.length
            if (focusedNodeId!==targetNodeId) {
              cursorNode.lastNodeStack.push(focusedNodeId)
              const adjustedCursorIndex = directionLeft ? cursorIndex-2 : cursorIndex
              saveCursorPos(focusedNodeId, adjustedCursorIndex)
            }
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
          cursorNode.lastNodeStack.push(focusedNodeId)
          saveCursorPos(focusedNodeId, cursorIndex)
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
          focusedChildren._insertItemsAtMut(cursorIndex, text)
        }

        if (false) { }
        else if (key.startsWith('{')) {
          const command = JSON.parse(key)
          if (command.tag==='newRef') {
            focusedChildren._insertItemsAtMut(cursorIndex+1,command.id)
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

  function Render(props: {id: TChild}): JSX.Element {
    const id = props.id
    const currentNode = getNodeById(id)
    const { tag } = currentNode
    const isSearch = currentNode.tag==='search'
    function renderChildren() {
      const n = getNodeById(id)
      function mapChild(childId: TChild) {
        if (typeof childId === 'string') {
          if (childId.startsWith('{')) {
            const obj = JSON.parse(childId)
            const { id, tag } = obj
            if (tag===cursorChar) {
              return '▒'
            }
          }
          if (childId === 'br') {
            return <br/>
          }

          return childId
        }
        const cn = getNodeById(childId)
        if (isCursor(cn)) {
          return <span className={'blink_me'}>{cursorChar}</span>
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
    const s={border: `1px solid ${color}`, padding: "3px"}
    //const pos = getParentNodePosition(id)
    function showState() {
      return <If value={id===rootNodeId}>
        <br/><br/>
        <div style={{font: '7px consolas, monospace', color: 'grey'}}>{getStateAsJson()}</div>
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
      return <button onClick={()=>{
        const key = JSON.stringify({ tag: 'newRef', id })
        input({tag:'io', key })
      }
      }>{props.children}</button>
    }
    function shouldInsertPrefixLineBreak() {
      return tag.startsWith('search')
    }
    const hasCursor = isFocused(currentNode)
    if (id===rootNodeId) {
      return <>

        <pre>{children}</pre>
        {refreshState}
      </>
    }
    function CursorBrackets(props) {
      if (!hasCursor) return props.children
      return <>
        <If value={hasCursor}>
          <Color red>[</Color>
        </If>
        {props.children}
        <If value={hasCursor}>
          <Color red>]</Color>
        </If>
      </>
    }
    //const ntag =currentNode.tag
    const ntag=null
    return <>
      <If value={shouldInsertPrefixLineBreak()}><br/></If>
      <pre style={s}>{id} {ntag}{br}
        <CursorBrackets>
          <pre style={{border: '1px dashed grey' , display: 'inline-block'}}>
            {children}
          </pre>

        </CursorBrackets>
        <ActionButton>📄</ActionButton>
      </pre>
    </>
  }

  state.input = input
  state.Render = Render
  return state
}

function ternary(test, valueIfTrue, valueIfFalse=undefined) {
  return test ? valueIfTrue : valueIfFalse
}
function If(props: {value: boolean, children: any}) {
  if (props.value) return props.children
  return null
}

function Color(props) {
  const {children, ...rest} =  props;
  const color = Object.keys(rest)[0]
  //const display = 'inline-block'
  return <span style={{ color }}>{children}</span>
}