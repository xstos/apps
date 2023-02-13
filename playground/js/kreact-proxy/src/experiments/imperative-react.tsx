import React, {useState} from "react"
import {has} from "../util"
import clonedeep from "lodash.clonedeep"
import ReactDOM from "react-dom"
import {ipsum} from "../lorem"
const log = console.log
const clipContainerStyle = {
  overflow: 'clip',
  position: 'relative',
  width: '100%',
  height: '100%'
}
const words = ipsum.split(' ')
const wordEls = words.map((word,i)=>{
  return <button id={i}>{word}</button>
})
export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  let ret = {}
  props=props||{}
  children = children.flatMap((c, i) => {
    return (Array.isArray(c) ? c : [c])
  })
  if (type===React.Fragment) {
    type='<>'
  } else if (type._isPath) {
    type=type._path.join('.')
  }
  Object.assign(ret,{type,props,children})

  return ret
}
function isNode(o) {
  return has(o,'type')
}
function ShimComponent(props) {
  const { setValueCallback, innerRef: ref, node } = props
  const [value,setValue] = useState(node)
  setValueCallback(setValue)
  const children = value.children.map(child=>{
    if (isNode(child)) {
      return child.reactElement
    }
    return child
  })

  return React.createElement(value.type,{...value.props, ref},...children)
}
function processJsx(node, index) {
  let {type,props,children} = node
  if (!has(props, 'style')) {
    props.style={}
  }
  if (!has(node, 'reactElement')) {
    function update(callback) {
      const cloned = clonedeep(node)
      let newVal = callback(cloned)
      if (newVal === undefined) {
        newVal = cloned
        node = cloned
      }
      node.setValue(newVal)
    }
    node.update=update
    function setValueCallback(callback) {
      node.setValue = callback
    }
    function innerRef(el) {
      if (!el) return
      node.el=el
    }
    node.reactElement = React.createElement(ShimComponent,{ setValueCallback, node, innerRef })
  }
  children.forEach((c,i)=>{
    if (has(c,'type')) {
      processJsx(c, i)
    }
  })
  //log('render',node)
  return node
}

const container = <div
  id={'foo'}
  style={clipContainerStyle}>
  <div id={'someChild'} style={{position: 'absolute', left: '5ch', top: '5ch', }}>someChild</div>
  {wordEls}
</div>

processJsx(container, 0)
ReactDOM.render(container.reactElement, document.getElementById('root'))
const childNode = container.children[0]
childNode.update((n)=>{
  n.props.style.backgroundColor='red'
  n.children[0]='yo'
  n.children[1]='yo2'
})

document.addEventListener("pointermove",e=>{
  childNode.update((n)=>{
    n.props.style.left=e.x+'px'
    n.props.style.top=e.y+'px'
  })
})

export const imperReact = 0