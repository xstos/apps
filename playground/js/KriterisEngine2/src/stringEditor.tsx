import ReactDOM from 'react-dom'
import { store, view } from '@risingstack/react-easy-state';
import {bindkeys} from "./keybindings";
import * as React from "react";
import {cloneReactChildren} from "./util";

bindkeys((e)=>{

})

export const StringEditor = Wrap(_StringEditor)

function _StringEditor(props) {
    const { state, setDidMount, setWillUnmount  } = props

    setDidMount(()=>{
        console.log('mount StringEditor')
    })
    setWillUnmount(()=>{
        console.log('unmount StringEditor')
    })
    console.log('StringEditor.render', props)
    return <pre>hi {props.children}</pre>
}

function Wrap(Component) {
    class Comp extends React.Component {
        constructor(props) {
            super(props)
            const { children, ...rest } = props
            let didMount, willUnmount
            function setDidMount(componentDidMount) {
                didMount = componentDidMount
            }
            function setWillUnmount(componentWillUnmount) {
                willUnmount = componentWillUnmount
            }
            this.componentDidMount = () => {
                didMount && didMount()
            }
            this.componentWillUnmount = () => {
                willUnmount && willUnmount()
            }
            const inject = {
                setDidMount,
                setWillUnmount,
                ...rest
            }
            this.render = () => {
                return <Component { ...inject}>{children}</Component>
            }
        }
    }
    return Comp
}
