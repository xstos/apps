import './index.css';
import React from "react";
import ReactDOM from 'react-dom'
import DAG from 'the-dag'
import {bindkeys} from "./io";
import clonedeep from "lodash.clonedeep"
declare var v: any
declare var o: any
declare var global: any
const aDAG = new DAG();
export const cursorBlock = '█'

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
  nodes: []
}
function makeProxy(type) {
  let handler = null
  const i = state.length
  const v = type==='var'
  const o = type==='op'
  const path = []
  function getNode(target) {
    return state.nodes[target._data]
  }
  handler = {
    get(target, key) {
      if (key.startsWith('_')) {
        return target[key]
      }
      const node = getNode(target)
      node.key = key
      return newProxy(target, handler)
    },
    apply(target, thisArg, args) {
      const index = target._data
      const node = getNode(target)
      const [arg]=args
      const argIndex = arg._data

      if (argIndex) {
        const argNode = state.nodes[argIndex]
        argNode.pid = index
      } else {
        node.value=arg
      }

      return newProxy(target, handler)
    },
  }

  const f = ()=>{}
  const index = state.nodes.length
  const node = {
    id: index,
    type
  }
  state.nodes.push(node)

  f._data = index

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


aDAG.addNodes([{ nodeID: 1 }, { nodeID: 2 }]);
aDAG.addEdges([{ source: { nodeID: 1 }, target: { nodeID: 2 } }]);

const nodeIterator = aDAG.traverseBreadthFirstGenerator({
  startingNodeID: 1
});
let currentNode = nodeIterator.next();
let orderedNodes = [];
while (!currentNode.done) {
  orderedNodes.push(currentNode.value);
  currentNode = nodeIterator.next();
}
console.log(orderedNodes)
