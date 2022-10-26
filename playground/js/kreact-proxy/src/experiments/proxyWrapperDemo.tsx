import {customJsx} from "../reactUtil"
import React, {useEffect, useRef, useState} from "react"
import {stringify} from "javascript-stringify"
import {cellx} from "cellx"
import ReactDOM from "react-dom"

declare var v: any
declare var o: any
declare var global: any
type TOpFun = (...args) => any

const log=console.log

let jsxCallback = customJsx


export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  return jsxCallback(type, props, ...children)
}


/*
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
*/
export function proxyWrapperDemo() {
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

    const f = () => {
    }
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
  const cells = {}

  function getOp(name) {
    switch (name) {
      case 'plus':
        return function (...args) {
          return args.reduce((accum, current) => {
            return accum + current
          }, 0)
        }
    }
    return null
  }

  jsxCallback = myJSX

  function myJSX(type, props, ...children) {
    const d = type._data
    if (d) {
      const {type, key} = d
      if (children.length < 1) {
        return {type, key}
      }
      return {
        type,
        key,
        args: children.map(
          c => c._data ? c._data : c)
      }
    } else {
      return {
        type
      }
    }
  }


  function isNode(o) {
    return typeof o === "object" && "type" in o
  }

  function Cell(props) {
    let {name, readonly} = props
    const myRef = useRef(null);
    let onChangeTrigger = null

    const cell = cells[name]

    const [v, setV] = useState(cell().value)

    function setState(val) {
      log('setState', name, val)
      setV(val)
    }

    useEffect(() => {
      cell.onChange(cellOnChange)

      function cellOnChange(evt) {
        const {prevValue, value} = evt.data
        console.log('onc hg', name, `${prevValue.value}=>${value.value}`)
        const test = myRef.current === onChangeTrigger
        onChangeTrigger = null
        if (false) {
          //console.log('skip', mydiv.current)
          return
        }
        const newVal = cell().value
        setState(newVal)
        if (v !== newVal) {

        }
      }

      setState(cell().value)

    }, []);


    return <div>{name} <input ref={myRef} readOnly={readonly}
                              style={{color: 'white', backgroundColor: 'black', width: "50px"}} value={v}
                              onChange={!readonly ? onChange : undefined}/></div>

    function onChange(e) {
      const value1 = e.target.value
      onChangeTrigger = e.target
      setCellValue(name, value1)
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
          const ctor = getCtor(arg)
          cells[argKey] = cellx({value: arg, ctor})
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

  function onChange(v) {
    console.log('onchange', JSON.stringify(v))
  }

  function assignCellOperator(mappedArgs, argKey: string, opFun: TOpFun) {
    const f = cellx(() => {
      const argCells = mappedArgs.map(a => {
        const cell = cells[a.key]
        const {value, ctor} = cell()
        return ctor(value)
      })
      console.log('formula', argKey)
      const ret = opFun(...argCells)

      return {value: ret, ctor: getCtor(ret)}
    })
    cells[argKey] = f
    f.onChange((evt) => onChange({key: argKey, ...evt.data}))
  }

  function assignCell(a, b) {
    const old = cells[a]
    if (old) {
      old.dispose()
    }
    cells[a] = cellx(() => cells[b]())
  }

  function setCellValue(key, value) {
    if (key in cells) {
      const cell = cells[key]
      const ctor = cell().ctor
      cell({value, ctor})
    } else {
      cells[key] = cellx({value, ctor: getCtor(value)})
    }
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


  v.a(1)
  v.b(v.a)
  v.d(10)
//var x = <o.plus><v.d/><v.d/></o.plus>
  var x2 = o.plus(v.d, v.d)
  v.c(o.plus(x2, v.a, v.b, v.d, 100))
  v.d(2)
  /*
  var uitest=<v.one><cursor></cursor>
    <v.two></v.two>
    <v.two></v.two>
  </v.one>
  log(uitest)
  */

  nodes = nodes.filter(n => !(n.root === false))

  nodes.forEach(processNode)
  log({nodes})


  jsxCallback = React.createElement

  function render() {
    const v = Object.values(rdom)
    /*
            {false && <BoxComponent></BoxComponent>}
            {false && <DragDropDemo/>}
     */
    ReactDOM.render(
      <>

        <pre id={"foo"}></pre>
        <pre id={"foo2"}></pre>
        {v.map((o) => <Cell {...o}/>)}
      </>,
      document.getElementById('root')
    )
  }

  render()

  function getCtor(value) {
    return Object.getPrototypeOf(value).constructor
  }

}

/*
const cells = observe({}, {
  bubble: true,
  deep: true
})

cells.__handler = (keys, value, oldValue, observedObject) => {

}
 */