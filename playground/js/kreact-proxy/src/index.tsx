import './index.css';
import React, {useEffect, useState} from "react";
import ReactDOM from 'react-dom'
import hyperactiv from 'hyperactiv'
import {stringify} from "javascript-stringify";
import {cellx, Cell as CX} from "cellx"

const {observe, computed} = hyperactiv

declare var v: any
declare var o: any
declare var global: any

export const cursorBlock = '█'
document.body.style.color = "grey"
document.body.style.backgroundColor = "rgb(28,28,28)"

let jsxCallback = customJsx
export function jsx(tag: any, props: Record<string, any>, ...children: any[]) {
  return jsxCallback(tag,props,...children)
}

function customJsx(tag: any, props: Record<string, any>, ...children: any[]) {
  //console.log({type,props,children})
  if (props) {
    return {type: tag, props, children}
  }
  //console.log(arguments)
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
  <area>
    <pow>
      <radius/>
      <exponent/>
    </pow>
  </area>
</cells>


function defGlobalProp(key, get) {
  Object.defineProperty(global, key, {
    get
  })
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
      data.key = key
      return new Proxy(target, handler)
    },
    apply(target, thisArg, args) {
      const data = target._data
      data.args = args.map(a => {
        if (a._data) {
          a._data.root = false
        }
        return a._data ? a._data : a
      })
      return new Proxy(target, handler)
    },
  }

  const f = () => {  }
  const data = {
    type
  }
  f._data = data
  nodes.push(data)
  return new Proxy(f, handler)
}

const getNodeBuilder = (type) => () => nodeBuilder(type)
defGlobalProp('v', getNodeBuilder('var'))
defGlobalProp('o', getNodeBuilder('op'))

const rdom = {}
const cells = observe({}, {
  bubble: true,
  deep: true
})

cells.__handler = (keys, value, oldValue, observedObject) => {
  console.log({key: keys[0], value, oldValue})
}

function getOp(name) {
  switch (name) {
    case 'plus':
      return function (...args) {
        return args.reduce((accum, current) => {
          //console.log({accum,current})
          return accum + current
        }, 0)
      }
  }
  return null
}
jsxCallback = myJSX
function JsonPretty(o) {
  return JSON.stringify(o,null,2)
}
function LogJsonPretty(...items) {
  console.log(...items.map(JsonPretty))
}
function myJSX(type, props, ...children) {
  const d = type._data
  if (d) {
    const {type, key} = d
    if (children.length<1) {
      return { type, key }
    }
    return {
      type,
      key,
      args: children.map(
        c => c._data ? c._data : c)
    }
  } else {
    debugger
  }
}

//console.log(JSON.stringify(foo,null,2))
v.a(1)
v.b(v.a)
v.d(10)
var x = <o.plus>
  <v.d/>
  <v.d/>
</o.plus>
var x2 = o.plus(v.d,v.d)
v.c(o.plus(x, v.a, v.b, v.d, 100))

nodes = nodes.filter(n => !(n.root === false))
//console.log(JSON.stringify(nodes, null, 2))

function isNode(o) {
  return typeof o === "object" && "type" in o
}

function Cell(props) {
  let {name, value, readonly} = props
  if (readonly) {
    value = cells[name]
  }
  const [v, setV] = useState(value)
  if (readonly) {
    useEffect(() => {
      computed(() => {
        setV(cells[name])
      })
    });
  }
  const ctor = Object.getPrototypeOf(value).constructor

  return <div>{name} <input readOnly={readonly} style={{color: 'white', backgroundColor: 'black'}} value={v}
                            onChange={!readonly ? onChange : undefined}/></div>

  function onChange(e) {
    const value1 = e.target.value
    setV(value1)
    setCellValue(name, ctor(value1))
  }
}

function processNode(n) {
  const {type, key, args} = n
  if (type === 'var') {
    if (args) {
      const [arg] = args
      if (isNode(arg)) {
        const argNode = processNode(arg)
        const argKey = argNode.key
        assignCell(key, argKey)
        rdom[key] = {name: key, value: null, readonly: true}
        return {key}
      } else {
        const argKey = stringify(arg)
        setCellValue(argKey, arg)
        assignCell(key, argKey)
        const foo = {name: key, value: arg, readonly: false}
        rdom[key] = foo
        return {key: argKey}
      }
    } else {
      return {key}
    }
  } else if (type === 'op') {
    if (args) {
      const mappedArgs = args.map(maparg)

      function maparg(arg) {
        if (isNode(arg)) {
          const n = processNode(arg)
          return n
        }
        const argKey = stringify(arg)
        cells[argKey] = arg
        return {key: argKey}
      }

      const opFun = getOp(key)
      const argKey = nodeToString(n)
      rdom[argKey] = {name: argKey, value: null, readonly: true}
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
  cells[key] = value
}

function mapArgToString(a) {
  if (isNode(a)) {
    return nodeToString(a)
  } else {
    return stringify(a)
  }
}

function nodeToString(n) {
  const {type, key, args} = n
  if (type === 'var') {
    return `v.${key}${args ? args.map(mapArgToString) : ''}`
  } else if (type === 'op') {
    return `o.${key}(${args.map(mapArgToString)})`
  }
}

nodes.forEach(processNode)

cells.a = 2

jsxCallback = React.createElement


function render() {
  const v = Object.values(rdom)

  ReactDOM.render(
    <div>{
      v.map((o) => <Cell {...o}></Cell>)
    }</div>,
    document.getElementById('root')
  )
}

render()

