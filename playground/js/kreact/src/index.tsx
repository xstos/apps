/*
 * @jsx jsx
 */
/// <reference lib="DOM" />
import hyperactiv from 'hyperactiv'

document.body.style.backgroundColor="black"
const { observe, computed } = hyperactiv


declare namespace JSX {
  // The return type of our JSX Factory
  type Element = HTMLElement;

  // IntrinsicElementMap grabs all the standard HTML tags in the TS DOM lib.
  interface IntrinsicElements extends IntrinsicElementMap { }


  // The following are custom types, not part of TS's known JSX namespace:
  type IntrinsicElementMap = {
    [K in keyof HTMLElementTagNameMap]: {
      [k: string]: any
    }
  }

  type Tag = keyof JSX.IntrinsicElements;

  interface Component {
    (properties?: { [key: string]: any }, children?: Node[]): Node
  }
}

function isPrimitive(arg) {
  const type = typeof arg;
  return arg == null || (type != "object" && type != "function") ? [type,null] : [null,Array.isArray(arg) ? "array" : type];
}

//https://stackoverflow.com/questions/10464844/is-there-a-way-to-auto-expand-objects-in-chrome-dev-tools/27610197#27610197
function expandedLog(item, maxDepth = 100, depth = 0){
  if (depth > maxDepth ) {
    console.log(item);
    return;
  }
  if (typeof item === 'object' && item !== null) {
    Object.entries(item).forEach(([key, value]) => {
      const [primType, nonPrimType] = isPrimitive(value)

      if (primType) {
        console.log(key+": "+value)
        return;
      }
      console.group(key + ' : ' + nonPrimType);
      expandedLog(value, maxDepth, depth + 1);
      console.groupEnd();
    });
  } else {
    console.log(item);
  }
}

let seed=0

//https://stackoverflow.com/a/68238924/1618433
function jsx<T extends JSX.Tag = JSX.Tag>(tag: T, props: { [key: string]: any } | null, ...children: Node[]): JSX.Element
function jsx(tag: JSX.Component, props: Parameters<typeof tag> | null, ...children: Node[]): Node
function jsx(tag: JSX.Tag | JSX.Component, props: { [key: string]: any } | null, ...children: Node[]) {
  const { __source, __self, ...restProps } = props
  return {tag, props: restProps, children}
}

const app = <cells>
  <pi>{3.14159}</pi>
  <radius>{3}</radius>
  <exponent>{2}</exponent>
  <area><pow><radius/><exponent/></pow></area>
</cells>

const builtin = {
  pow: Math.pow
}
function processNodes(root,state) {
  processNode(root,state, undefined)
  mystate.root = root.id

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


  const { __source, __self, ...rest } = node.props
  if (Object.keys(rest).length <1) delete node.props

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
const mystate = { nodes: [], byName: {}}

const ast = processNodes(app,mystate)

console.log(JSON.stringify(ast,null,2))

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

