import {bindkeys} from "../io"
import {cellx} from "cellx"
import {insertBefore} from "../domutil"
import React from "react"

export function svelteLikeExperiment() {

  const myJsx = <div>
    <k-cursor/>
  </div>
  const cursorJsx = <span>{'█'}</span>
  function getJsxByType(type) {
    let ret = null
    if (type==='k-cursor') {
      ret = cursorJsx
    }
    ret.props.id = type
    return ret
  }
  const keyCell = bindkeys(cellx({type:'io', 'key': ''}))
  keyCell.onChange(e=>{
    const el = document.querySelector("#k-cursor")
    const text = document.createTextNode(e.data.value.key)

    insertBefore(text,el)
  })
  function customRender(jsx) {
    if (typeof jsx === 'string') {
      return document.createTextNode(jsx)
    }
    const {type, children } = jsx

    if (type.startsWith('k-')) {
      const j = getJsxByType(type)
      return customRender(j)
    }
    const el = document.createElement(type)
    if (children) {
      el.append(...children.map(customRender))
    }
    if ("props" in jsx) {
      const props = jsx.props
      if ("id" in props) {
        el.setAttribute("id", props.id)
      }
    }
    return el
  }
  const customNodes = customRender(myJsx)
  log('customNodes',customNodes)
  document.body.insertBefore(customNodes, document.getElementById("root"))
}
