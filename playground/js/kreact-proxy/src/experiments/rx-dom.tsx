import React from "react"
import {cellx} from "cellx"
import ReactDOM from "react-dom"

import {has, idGenerator, proxy} from "../util"
import {elById} from "../domutil"
import {ipsum} from "../lorem"

declare var v: any
declare var o: any
declare var Ref: any
declare var global: any

function defGlobalProp(key, get) {
  Object.defineProperty(global, key, {
    get
  })
}

defGlobalProp('cell', makeCellProxy)
defGlobalProp('Ref',makeRefProxy)


const getId = idGenerator()
const cells = {}
const log = console.log
const jlog = (...items)=>log(...items.map(i=>JSON.stringify(i,null,2)))
function makeCellProxy() {
  return proxy((data) => {
    data.path = []
  }, (data, key) => {
    data.path.push(key)
  }, (data, args) => {
    const path = data.path.join('/')
    return path
  })
}
function makeRefProxy() {
  const t = { _path: ['ref'], _isPath: true }
  t.toString=()=>t.path.join('.')
  const handler = {get}
  const ret = new Proxy(t,handler)
  function get(target, key) {
    if (key.startsWith('_')) {
      return t[key]
    }
    t._path.push(key)
    return ret
  }
  return ret
}
function getCell(path, initialValue) {
  let ret
  if (!(path in cells)) {
    log('new cell',path, initialValue)
    ret = cells[path] = cellx(initialValue)
  } else {
    ret = cells[path]
  }
  return ret
}
const nodePrototype = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
}

const words = ipsum.split(' ')
function isNode(o) {
  return has(o,'type')
}
function wrap(node) {
  if (has(node,'type')) return node
  return {
    type: 'primitive',
    props: {uid: getId(), value: node},
    children: [],
  }
}
function flatMapChildren(children) {
  return children.flatMap((c, i) => {
    return (Array.isArray(c) ? c : [c])
  })
}
function reactCreateElement(type, props=null, children=null) {
  log('rce', type)
  if (children) {
    return React.createElement(type, props, ...children)
  }
  return React.createElement(type,props)
}
function reactify(node) {
  if (!isNode(node)) return node
  let {type,props,children} = node
  if (!children || children.length<1) return reactCreateElement(type,props)
  const mappedChildren = children.map(reactify)
  return reactCreateElement(type,props,mappedChildren)
}
export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  if (props && props.react) {
    delete props.react
    return reactify({type, props, children})
  }

  return {type,props,children}
}
//when rendering each line, we're creating a virtual box
// representing the current line

const toolbox=<Toolbox>
  <Function>
    <div>function <Str name={"function name"}/>(<Args />)
      <FunctionBody/>
    </div>
  </Function>
  <Args>
    <Spread desc={"..."}>
      <Arg/>
    </Spread>
  </Args>
  <Arg>
    <Str name="argument name"/>
    <Any name="default value"/>
  </Arg>
  <FunctionBody>
    func body
  </FunctionBody>
</Toolbox>

function processNode(node, i) {
  if (!has(node,'type')) return
  let {type,props, children} = node
  props=props||{}
  node.index=i
  if (isOurs(type)) {
    node.name = type.name
    node.render=function () {
      const map = children.map(c => {
        if (!isNode(c)) {
          return c
        }
        return c.render()
      })
      const descName = props.desc ? props.desc : node.name
      const fragment = <div react style={{padding: '1px', display:'inline-block'}}>
        {descName}<div style={{padding: '1px', border: '1px dashed red'}}>{map}</div>
      </div>
      return fragment
    }
  } else {
    node.render=function () {
      const mappedChildren = children.map((childNode, childIx) => {
        if (!isNode(childNode)) return childNode
        const ret = childNode.render()
        return ret
      })

      return reactCreateElement(type, props, mappedChildren)
    }
  }

  children.forEach(processNode)
  return node
}
processNode(toolbox,0)
const render = toolbox.render()

ReactDOM.render(<div react>{render}</div>,elById('root'))
function Args() {

}
function Toolbox() {}
function Function(node) {}
function FunctionBody() {}
function Str() {

}
function Any() {

}
function Spread() {

}
function Arg() {}
function While(pred, body) {
  while(pred) {
    body()
  }
}
function Join(props) {
  return props.children.join(',')
}
function isOurs(f) {
  const set = new Set([
    Args,
    Arg,
    Function,
    Str,
    Any,
    Spread,
    FunctionBody,
    Toolbox
  ])

  return set.has(f)
}
//todo time part of engine as variable

const wordEls = words.map((word,i)=>{
  return <button id={i}>{word}</button>
})
const rootEls = <div mount="root">
  {wordEls}
</div>
function makeIter() {
  const iter = { delta: [0,0], maxW: 120 }
  function next(w) {
    const [dW,dH] = iter.delta
    const nextW = dW+w
    if (nextW>iter.maxW) {
      iter.delta = [0,dH+1]
    } else {
      iter.delta = [nextW,dH]
    }

  }
}


window.addEventListener("resize", e=>{
  const { width, height } = document.body.getBoundingClientRect()
  log({width,height})
})

document.addEventListener("pointermove",e=>{

})

export const rxDomExperiment = 2

//named cols/rows