import '../../App.global.css'
import ReactDOM from 'react-dom'
import React from 'react'
import { v4 as uuidv4 } from 'uuid'
import { bindkeys } from './keybindings'

export function InjectedPropsBase() {
  ReactDOM.render(<App />, document.getElementById('root'))
}
function App() {
  function Test(props) {
    return <div>{props.msg} {props.id} {props.children}</div>
  }
  const AugTest = withBase(Test)
  const foo = <AugTest child msg={'child'}></AugTest>
  return <AugTest parent msg={'parent'}>{foo}</AugTest>

}

function Pipe(props) {
  let current = null

  function clone(child, index) {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, props)
    } else {
      return child
    }
  }

  const mapped = React.Children.map(props.children,clone)
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

      const mapped = React.Children.map(children,clone)
      return <InputComponent {...rest} hasMounted={hasMounted} id={id}>{mapped}</InputComponent>
    }
  }
}
