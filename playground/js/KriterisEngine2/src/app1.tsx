import * as React from "react";
import ReactDOM from 'react-dom'
import { useEffect, useState } from 'react'
import { store, view } from '@risingstack/react-easy-state';
import * as _ from 'lodash'
import {cloneReactChildren, idGen} from './util'
import {bindkeys} from "./keybindings";
document.body.style.backgroundColor = "black"
document.body.style.color = "grey"
const getId = idGen()

export function App1() {
    ReactDOM.render(<App />, document.getElementById('root'))
}
bindkeys((key)=>{
    //store2.keyboard.push(key)
})


//https://stackoverflow.com/a/1997811/1618433
(function() {
    if ( typeof Object.id !== "undefined" ) return
    var id = 0;

    Object.id = function(o) {
        if ( typeof o.__uniqueid == "undefined" ) {
            Object.defineProperty(o, "__uniqueid", {
                value: ++id,
                enumerable: false,
                writable: false
            });
        }

        return o.__uniqueid;
    };
})();

const store2 = store({

})

class _El extends React.Component {
    constructor(props) {
        super(props)
        const id = Object.id(this)
        const { toUpperCase, get, set, name, children } = props
        this.componentDidMount = ()=> {
            console.log('mount', id, props)

        }
        this.componentWillUnmount = ()=> {

        }
        this.render= ()=>{
            const cloned = cloneReactChildren(children, (child) => {
                return { ...child.props, parentId: id}
            })
            return <div>{cloned}</div>
        }
    }
}
const El = view(_El)

function Render(props) {
    return <>
        <El toUpperCase><El get>banana</El></El>
        <El set name="banana">this is a sentence</El>
    </>
}

function App() {
    const RenderView = view(Render)
    return <RenderView/>
}
function RenderItem(item) {
    return React.createElement(item.type, item.props, item.children);
}
