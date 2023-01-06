import React from "react"
import {elById} from "../domutil"
import {has, proxy, typename} from "../util"
import {cellx} from "cellx"
import {ipsum} from "../lorem"
import crawl from 'tree-crawl'

declare var v: any
declare var o: any
declare var global: any

function defGlobalProp(key, get) {
  Object.defineProperty(global, key, {
    get
  })
}

defGlobalProp('cell', makeCellProxy)

const cells = {}
const log = console.log
elById('root').style.visibility="hidden"
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
function flattenChildren(children) {
  return children.flatMap((c,i)=> Array.isArray(c) ? c : [c])
}
const nodePrototype = {
  left: 0,
  top: 0,
  width: 0,
  height: 0,
}
export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  let ret = {type,props,children}

  ret.children = children = flattenChildren(children)
  if (!has(props,'id')) {
    return ret
  }

  crawl({ type: 'root', props: { id: ''}, children: [ret]}, (node,context)=> {
    const [_,...path] = Array.from(context.cursor.stack.xs)
    path.push({ node, index: context.index })
    let strPath = path.map(({node: n, index})=>{
      if (has(n.props,'id')) return n.props.id
      return index
    }).join('/')
    if (strPath==='') {
      return
    }

    const t = typename(node)
    if (t === 'string') {
      getCell(strPath+"/value", node)
    } else if (has(node,'type')) {
      for (const key in nodePrototype) {
        const propPath = `${strPath}/${key}`
        const hasProp =has(node.props,key)
        getCell(propPath, hasProp ? node.props[key] : nodePrototype[key])
      }
    }

    log('crawl',{node,strPath})
  },{ getChildren: node => node.children, order: 'pre'})


  children = children.map((c,i)=>{
    const t = typename(c)
    if (t === 'string') {
      //getCell(id+"/"+i,c)
    } else if (t === 'array') {

    }
    return c
  })
  //log('jsx',type,props,children)
  return ret
}

const words = ipsum.split(' ')
const list = <div id={'foo'} width={300} height={800}>
  {words.slice(0,3).map((v,i)=>{
    return <div left={cell.foo.left(0)} top={()=>{
      const prev = cell.foo[i-1]
      debugger
      return prev.top+prev.height
    }}>{v}</div>
  })}
</div>

window.addEventListener("resize", e=>{
  const { width, height } = document.body.getBoundingClientRect()
  log({width,height})
})

document.addEventListener("pointermove",e=>{
  //set('x',e.x)
})

export const rxDomExperiment = 2