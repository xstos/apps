import './index.css';
import React from "react";
import ReactDOM from 'react-dom'
import {bindkeys} from "./io";
import clonedeep from "lodash.clonedeep"
declare var v: any
declare var o: any
declare var global: any

export const cursorBlock = '█'

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

const state = []
function makeProxy(type) {
  let handler = null
  handler = {
    get(target, key) {
      if (key.startsWith('_')) {
        return target[key]
      }
      target._data.push(['get', key])
      return newProxy(target, handler)
    },
    apply(target, thisArg, args) {
      target._data.push(['apply',...args.map(a=>a._data ? a._data : a)])
      return newProxy(target, handler)
    },
  }
  const f = ()=>{}
  f._data = [type]
  state.push(f._data)
  return newProxy(f, handler)
}
function defProp(key,type) {
  Object.defineProperty(global, key, {
    get: () => makeProxy(type)
  })
}

defProp('v','var')
defProp('o','op')


v.a1(123)
v.b1(o.equals(v.a1))

console.log(JSON.stringify(state,null,2))


reactMode=true
ReactDOM.render(
  <div>hello</div>,
  document.getElementById('root')
)