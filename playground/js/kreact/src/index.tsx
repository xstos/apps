/*
 * @jsx jsx
 */
/// <reference lib="DOM" />
import hyperactiv from 'hyperactiv'

document.body.style.backgroundColor="black"
const { observe, computed } = hyperactiv

//https://stackoverflow.com/a/68238924/1618433
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
function jsx2<T extends JSX.Tag = JSX.Tag>(tag: T, attributes: { [key: string]: any } | null, ...children: Node[]): JSX.Element
function jsx2(tag: JSX.Component, attributes: Parameters<typeof tag> | null, ...children: Node[]): Node
function jsx2(tag: JSX.Tag | JSX.Component, attributes: { [key: string]: any } | null, ...children: Node[]) {
  console.log(tag, attributes, children)
  if (typeof tag === 'function') {
    return tag(attributes ?? {}, children);
  }
  type Tag = typeof tag;
  const element: HTMLElementTagNameMap[Tag] = document.createElement(tag);

  // Assign attributes:
  let map = (attributes ?? {});
  let prop: keyof typeof map;
  for (prop of (Object.keys(map) as any)) {

    // Extract values:
    prop = prop.toString();
    const value = map[prop] as any;
    const anyReference = element as any;
    if (typeof anyReference[prop] === 'undefined') {
      // As a fallback, attempt to set an attribute:
      element.setAttribute(prop, value);
    } else {
      anyReference[prop] = value;
    }
  }

  // append children
  for (let child of children) {
    if (typeof child === 'string') {
      element.innerText += child;
      continue;
    }
    if (Array.isArray(child)) {
      element.append(...child);
      continue;
    }
    element.appendChild(child);
  }
  return element;
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
      if (key==="__source") return
      if (key==="__self") return
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

function wrapArray(item) {
  if (item === undefined || item === null) return item
  if (Array.isArray(item)) return item
  return [item]
}
let seed=0
function jsx<T extends JSX.Tag = JSX.Tag>(tag: T, props: { [key: string]: any } | null, ...children: Node[]): JSX.Element
function jsx(tag: JSX.Component, props: Parameters<typeof tag> | null, ...children: Node[]): Node
function jsx(tag: JSX.Tag | JSX.Component, props: { [key: string]: any } | null, ...children: Node[]) {
  // const pid = seed++
  // const ret = {tag, id: pid, props,children: children.map(augmentChild) }
  // //if (children.length === 0) debugger
  // function augmentChild(child) {
  //   if (child.tag) {
  //     const { id, tag, props, children} = child
  //     return { tag, id, pid, props, children }
  //   }
  //   return child
  // }

  return {tag, props, children}
}

const app = <cells>
  <pi>{3.14159}</pi>
  <radius>{3}</radius>
  <exponent>{2}</exponent>
  <area><pow><radius/><exponent/></pow></area>
</cells>

//console.log(JSON.stringify(app,null,2))
//expandedLog(app)
const builtin = {
  pow: Math.pow
}
function run(node,state, parentId) {
  const id = seed++
  node.id = id
  node.parentId = parentId
  //if (!children || children.length<1) return state
  state.byId[id]=node
  //state.byName[node.tag] = node
  const { __source, __self, ...rest } = node.props
  if (Object.keys(rest).length <1) delete node.props

  function processChild(child, index) {
    if (!child.tag) return
    run(child, state, id)
  }
  if (node.children && node.children.length) {
    node.children.map(processChild)
  }
  //children && children.forEach(child=>run(child,state))
  return state
}
const mystate = { byId: []}
//const observed = observe()

const ast = run(app,mystate)
mystate.root = app.id
mystate.byId.forEach(node=>{
  if (!node.children) return
  if (!node.tag) return
  if (node.children.length ===1 && !node.children[0].tag) {
    node.value = node.children[0]
    delete node.children
    return
  }
  if (node.children.length === 0) {
    delete node.children
    return
  }

  node.children= node.children.map(c=>{
    if (c.tag) return `${c.id}(${c.tag})`
    return c
  })
})
expandedLog(ast)
//document.body.appendChild(div)