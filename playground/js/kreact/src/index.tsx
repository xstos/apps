import hyperactiv from 'hyperactiv'

import React from "react";
import ReactDOM from 'react-dom'

import {logj, setStyles} from "./util";
import {foo} from "./jsParser";
import {bindkeys} from "./io";
import {getInitialState, Machine} from "./stateMachine";

export const cursorBlock = '█'
setStyles()
const { observe, computed } = hyperactiv

const ls = localStorage.getItem("state")
const state2 = ls && JSON.parse(ls) || getInitialState()
const machine = Machine(state2)
bindkeys(machine.input)

const derp = foo
let seed=0

//https://stackoverflow.com/questions/67759433/typescript-parcel-new-jsx-transform-react-is-not-defined-error
//https://stackoverflow.com/a/68238924/1618433
//https://dev.to/gugadev/use-custom-elements-in-react-using-a-custom-jsx-pragma-3kc
let reactMode = false
export function jsx(tag: any, props: Record<string, any>, ...children: any[]) {
  if (reactMode) return React.createElement(tag,props,...children)
  //console.log({type,props,children})
  if (props) {
    return {type: tag, props, children}
  }

  return {tag, children}
}

export const intellisense = <menu>
  <item selected>foo</item>
  <item>bar</item>
</menu>

const app = <cells>
  <pi>{3.14159}</pi>
  <radius>{3}</radius>
  <exponent>{2}</exponent>
  <area><pow><radius/><exponent/></pow></area>
</cells>

logj(app)
const builtin = {
  pow: Math.pow
}


function processNodes(root,state) {
  processNode(root,state, undefined)

  function nodeInit(node) {
    if (!node.children) return //
    if (!node.tag) return
    if (node.children.length === 1 && !node.children[0].tag) {
      node.value = node.children[0]
      delete node.children
      return
    }
    if (node.children.length === 0) {
      delete node.children
      return
    }

    node.children = node.children.map(c => {
      //if (c.tag) return `${c.id}(${c.tag})`
      if (c.tag) return c.id
      return c
    })
  }
  function addToByNameIndex(node, index) {
    if (!node.id) return
    if (node.children || node.value) {
      mystate.byName[node.tag] = node.id
    }
  }

  mystate.nodes.forEach(nodeInit)
  mystate.nodes.forEach(addToByNameIndex)
  return state
}
function processNode(node,state, parentId) {
  const id = seed++
  node.id = id
  node.parentId = parentId

  state.nodes[id]=node
  const isBuiltin = builtin[node.tag]
  isBuiltin && (node.formula = isBuiltin)
  //if (Object.keys(node.props).length <1) delete node.props

  function processChild(child, index) {
    if (!child.tag) return
    processNode(child, state, id)
  }
  if (node.children && node.children.length) {
    if (!node.formula && node.children[0].tag) {
      node.valueFromFirstChild=true
    }
    node.children.map(processChild)
  }

  return state
}
const mystate = { nodes: [], byName: {}, root: 0}
///

const ast = processNodes(app,mystate)
//logj(ast)




const observedState = observe(mystate)
function setupObserve(mystate) {
  const nodes = mystate.nodes
  for (const node of nodes) {
    if (node.value) continue
    if (node.formula) {
        computed(()=>{
          const args = node.children.map(childId=> getValue(nodes[childId]))
          const ret = node.formula.apply(null,args)
          console.log('apply', node.formula, args,"=", ret)
          node.value = ret
        })
    }
    if (node.valueFromFirstChild) {
      computed(()=>{
        node.value = getValue(idToNode(node.children[0]))
        console.log("set value ",node.tag, node.value)
      })

    }
  }
}
function getRef(node) {
  let lkup = nameToNode(node.tag);
  if (lkup.id !== node.id) {
    return lkup
  }
  return false
}
function nameToNode(name) {
  return idToNode(observedState.byName[name])
}
function idToNode(id) {
  return observedState.nodes[id]
}
function getValue(child) {
  const refNode = getRef(child)
  if (refNode) {
    return getValue(refNode)
  }
  if (child.value) return child.value
  if (child.valueFromFirstChild) {
    return getValue(idToNode(child.children[0])) //
  }
  return child.value
}
setupObserve(observedState)

reactMode=true
function Node(props) {
  const node = idToNode(props.id)

  let children = node.children && node.children.map(child=>(<Node id={child} />));
  return <div style={{padding: "5px", border: "1px solid red"}}>
    {node.tag} id={node.id} value={node.value} {children}
  </div>
}
const rootId = observedState.root
const Render = machine.Render
const renderMe = <>
  <Node id={rootId}></Node>
  <br/>
  <Render id={0}></Render>
</>
ReactDOM.render(
  renderMe,
  document.getElementById('root')
)