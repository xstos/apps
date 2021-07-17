import '../../App.global.css'
import ReactDOM from 'react-dom'
import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import cloneDeep from 'clone-deep'
import * as _ from 'lodash'

export function InjectedPropsBase() {
  ReactDOM.render(<App />, document.getElementById('root'))
}
// function Pipe(props) {
//   const [value, setValue] = useState()
//   React.Children.forEach(props.children,(child) => {
//     if (_.isArray()) {
//
//     }
//   })
// }
// function PipeTest(props) {
//   return <Pipe>
//     {[1,2,3,4]}
//     <Uppercase>{' '}</Uppercase>
//   </Pipe>
// }

function Test(props) {
  return (
    <div>
      {props.msg} {props.id} {props.children}
    </div>
  )
}
const AugTest = withBase(Test)
function Uppercase(props) {
  const [value, setValue] = useState()
  const { children } = props
  return <div>{children}</div>
}
function App2() {
  // return <AugTest parent msg={'parent'}>
  //   <AugTest child msg={'child'}></AugTest>
  // </AugTest>
  return (
    <div>
      <Cell a1>hello</Cell>
      <Cell a2>
        <Uppercase>
          <CellR a1 />
        </Uppercase>
      </Cell>
    </div>
  )
}
function App() {
  return (
    <>
      <X cell='greeting'>hello</X>
      <X F={String.prototype.toUpperCase}>
        <X ref='greeting'/>
      </X>
    </>
  )
}

const state = {
  nodes: [],
}
function CellR(props) {
  return null
}
function Cell(props) {
  const [value, setValue] = useState({})
  useEffect(() => {
    const id = state.nodes.length
    const val = {
      id,
    }
    state.nodes[id] = val
    setValue(val)
    return () => {}
  }, [])

  function onChange(e) {
    value.data = e.target.value
    setValue(val)
  }
  const value2 = React.Children.map(props.children, (c) => {
    if (React.isValidElement(c)) {
      return getValue(c)
    }
    return c
  })
  return <input type="text" onChange={onChange} />
}

class X extends React.Component {
  constructor(props) {
    super(props)
    const { cell, ref } = props
    if (cell) {
      let cellData =state[cell]
      if (!cellData) {
        cellData = {

        }
        state[cell] = cellData
      }
    }
    this.componentDidMount = ()=>{

    }
    this.componentWillUnmount = ()=>{

    }
    this.render = ()=>{
      return null
    }
    if (_.isString(props.children)) {

      this.render=()=>{
        return this.props.F.call(props.children)
      }
    }

  }
}

function withBase(InputComponent) {
  return class OutputComponent extends React.Component {
    constructor(props) {
      super(props)
      const state = { hasMounted: null, id: uuidv4() }
      this.state = state
    }

    componentDidMount() {
      this.setState({ hasMounted: true })
    }

    componentWillUnmount() {
      this.setState({ hasMounted: false })
    }

    render() {
      const { hasMounted, id } = this.state
      const { children, ...rest } = this.props
      function clone(child, index) {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {...child.props, parentId: id, childIndex: index })
        } else {
          return child
        }
      }

      const mapped = React.Children.map(children, clone)
      return <InputComponent {...rest} hasMounted={hasMounted} id={id}>{mapped}</InputComponent>
    }
  }
}
