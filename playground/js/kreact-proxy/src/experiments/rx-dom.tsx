import React, {useState} from "react"
import {cellx} from "cellx"
import ReactDOM from "react-dom"
import clonedeep from "lodash.clonedeep"

import {forEachPair, forEachPosition, has, idGenerator, proxy} from "../util"
import {elById} from "../domutil"
import {ipsum} from "../lorem"
import {DirectedGraph} from "graphology"
import {edgeBetween} from "./weak-graph"

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
    type: typeof node,
    uid: getId(),
    props: {},
    children: [],
    value: node
  }
}


export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  let ret = {}
  props=props||{}
  children = children.flatMap((c, i) => {
    return (Array.isArray(c) ? c.map(wrap) : [wrap(c)])
  })
  if (type===React.Fragment) {
    type='<>'
  } else if (type._isPath) {
    type=type._path.join('.')
  }

  ret.uid=getId()

  Object.assign(ret,{type,props,children})

  if (has(props,'mount')) {

    const el = elById(props.mount)
    ret.el = el
    function updateBounds() {
      const { width, height, left, top } = el.getBoundingClientRect()
      Object.assign(props,{ width, height, left, top })
    }
    updateBounds()
    window.addEventListener("resize", updateBounds)
    function processNode(node,index, parent) {
      const {type,props,children, uid} = node
      forEachPair(children,(a,b,i)=>{
        edgeBetween(a,b,'->')
      })
    }
    processNode(ret,0,null)

  }

  return ret
}
//when rendering each line, we're creating a virtual box
// representing the current line


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