import './index.css';
import React, {useEffect, useState} from "react";
import ReactDOM from 'react-dom'
import hyperactiv from 'hyperactiv'
import { stringify } from "javascript-stringify";
const { observe, computed } = hyperactiv
import {derp} from "./dag"


declare var v: any
declare var o: any
declare var global: any

derp()

export const cursorBlock = '█'
document.body.style.color="grey"
document.body.style.backgroundColor="rgb(28,28,28)"
let seed=0

let reactMode = false
export function jsx(tag: any, props: Record<string, any>, ...children: any[]) {
  if (reactMode) return React.createElement(tag,props,...children)
  //console.log({type,props,children})
  if (props) {
    return {type: tag, props, children}
  }
  //console.log(arguments)
  return {tag, children}
}

function newProxy(state, handler) {
  return new Proxy(state, handler)
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

const state = {
  vars: {},
  nodes: [],
  dirty: [],
}
function defGlobalProp(key,get) {
  Object.defineProperty(global, key, {
    get
  })
}
function addNode() {
  const nodeIndex = state.nodes.length
  const node = { id: nodeIndex }
  state.nodes.push(node)
  return node
}

function addEdge(node, otherNode, i) {
  if (!('out' in node)) {
    node.out=[]
  }

  const edge = {id: otherNode.id}
  if (i!==undefined) {
    edge.i=i
  }
  node.out.push(edge)

  return [node, otherNode, i]
}
function setNodeDirty(id) {
  state.dirty.push(id)
}
function calculate() {
  const dirty = state.dirty
  while(dirty.length>0) {
    const id = dirty.pop()
    const node = getNodeById(id)
    
  }
}

function getCreateNode(key, type) {
  let node, nodeId
  const {vars, nodes}=state
  if (type === 'var') {
    if (!(key in vars)) {
      node = addNode()
      nodeId = node.id
      vars[key] = nodeId
      node.type = type
      node.key = key
    } else {
      nodeId = vars[key]
      node = nodes[nodeId]
    }
  } else if (type === 'op') {
    node = addNode()
    nodeId = node.id
    node.type = type
    node.key = key
  }
  return nodeId
}
function getNodeById(id) {
  return state.nodes[id]
}
function isNodeReference(data) {
  if (typeof data === 'object') {
    return 'type' in data && 'id' in data
  }
  return false
}

function apply(data, args) {
  const { id, type } = data
  const node = getNodeById(id)
  if (type === 'var') {
    const [arg] = args
    if (isNodeReference(arg)) {
      const argNode = getNodeById(arg.id)
      addEdge(argNode,node, undefined)
    } else {
      node.value = arg
      node.leaf = true
      setNodeDirty(id)
    }
  } else if (type === 'op') {
    const l = args.length
    node.args = []
    setNodeDirty(id)
    for (let i = 0; i < l; i++) {
      const arg = args[i]
      if (isNodeReference(arg)) {
        const argNode = getNodeById(arg.id)
        addEdge(argNode,node, i)
        node.args[i]={}
      } else {
        node.args[i]={ v: arg}
      }
    }
  }
}

function makeProxy(type) {
  let handler = null
  function prox(target) {
    return newProxy(target, handler)
  }

  handler = {
    get(target, key) {
      if (key.startsWith('_')) {
        return target[key]
      }

      const data = target._data
      const nodeId = getCreateNode(key, data.type)
      data.id = nodeId
      return prox(target)
    },
    apply(target, thisArg, args) {
      const data = target._data
      apply(data, args.map(a=>a._data ? a._data : a))
      return prox(target)
    },
  }

  const f = ()=>{}
  f._data = {
    type
  }

  return newProxy(f, handler)
}

let nodes = []
function nodeBuilder(type) {
  let handler = null
  handler = {
    get(target, key) {
      if (key.startsWith('_')) {
        return target[key]
      }
      const data = target._data
      //data.verb='get'
      data.key=key
      return new Proxy(target, handler)
    },
    apply(target, thisArg, args) {
      const data = target._data
      //data.verb='apply'
      data.args=args.map(a=>{
        if (a._data) {
          a._data.root = false
        }
        return a._data ? a._data : a
      })
      return new Proxy(target, handler)
    },
  }

  const f = ()=>{}
  const data = {
    type
  }
  f._data = data
  nodes.push(data)
  return new Proxy(f, handler)
}
const getNodeBuilder = (type) => () => nodeBuilder(type)
defGlobalProp('v',getNodeBuilder('var'))
defGlobalProp('o',getNodeBuilder('op'))

const cells = observe({},{
  bubble: true,
  deep: true
})
cells.__handler = (keys, value, oldValue, observedObject) => {
  console.log({key: keys[0] ,value,oldValue})
}
function getOp(name) {
  switch (name) {
    case 'plus':
      return function (...args) {
        return args.reduce((accum,current) => {
          //console.log({accum,current})
          return accum + current
        },0)
      }
  }
  return null
}

v.a(1)
v.b(v.a)
v.d(10)
v.c(o.plus(o.plus(v.d,v.d),v.a,v.b,v.d, 100))

const rdom = {}

nodes=nodes.filter(n => !(n.root===false))
console.log(JSON.stringify(nodes,null,2))
function isNode(o) {
  return typeof o === "object" && "type" in o
}

function Cell(props) {
  let { name, value, readonly } = props
  if (readonly) {
    value=cells[name]
  }
  const [v,setV] = useState(value)
  if (readonly) {
    useEffect(() => {
      computed(()=>{
        setV(cells[name])
      })
    });
  }
  const ctor = Object.getPrototypeOf(value).constructor

  return <div>{name} <input readOnly={readonly} style={{color: 'white', backgroundColor:'black'}} value={v} onChange={!readonly ? onChange : undefined}/></div>

  function onChange(e) {
    const value1 = e.target.value
    console.log(value1)
    setV(value1)
    setCellValue(name,ctor(value1))
  }
}
function processNode(n) {
  const { type, key, args} = n
  if (type==='var') {
    if (args) {
      const [arg] = args
      if (isNode(arg)) {
        const argNode = processNode(arg)
        const argKey = argNode.key
        assignCell(key, argKey)
        rdom[key]={ name:key, value:null, readonly:true}
        return { key }
      } else {
        const argKey = stringify(arg)
        setCellValue(argKey,arg)
        assignCell(key, argKey)
        const foo = { name:key, value:arg, readonly:false}
        rdom[key]=foo
        return { key: argKey }
      }
    } else {
      return { key }
    }
  } else if (type==='op') {
    if (args) {
      const mappedArgs = args.map(maparg)

      function maparg(arg) {
        if (isNode(arg)) {
          const n = processNode(arg)
          return n
        }
        const argKey = stringify(arg)
        cells[argKey]=arg


        return {key:argKey}
      }

      const opFun = getOp(key)
      const argKey = nodeToString(n)
      rdom[argKey]={ name:argKey, value:null, readonly:true}
      assignCellOperator(mappedArgs, argKey, opFun)

      return {key: argKey}
    }
  }
}

type TOpFun = (...args) => any

function assignCellOperator(mappedArgs, argKey: string, opFun: TOpFun) {
  computed(() => {
    const argCells = mappedArgs.map(a => cells[a.key])
    cells[argKey] = opFun(...argCells)
  })
}
function assignCell(a, b) {
  computed(() => {
    cells[a] = cells[b]
  })
}
function setCellValue(key, value) {
  cells[key]=value
}
function mapArgToString(a) {
  if (isNode(a)) {
    return nodeToString(a)
  } else {
    return stringify(a)
  }
}
function nodeToString(n) {
  const { type, key, args} = n
  if (type==='var') {
    return `v.${key}${args ? args.map(mapArgToString) : ''}`
  } else if (type==='op') {
    return `o.${key}(${args.map(mapArgToString)})`
  }
}
nodes.forEach(processNode)
console.log(rdom)
cells.a=2
console.log(rdom)
reactMode=true


function render() {
  const v = Object.values(rdom)
  console.log(v)
  ReactDOM.render(
    <div>{
      v.map((o) => <Cell {...o}></Cell>)
    }</div>,
    document.getElementById('root')
  )
}
render()

