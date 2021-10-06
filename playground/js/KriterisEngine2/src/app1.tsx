//import './App.global.css'
import * as React from "react";
import ReactDOM from 'react-dom'
import { useEffect, useState } from 'react'
import { store, view } from '@risingstack/react-easy-state';
import {onkey} from "./keybindings";
import * as _ from 'lodash'
import {cloneReactChildren, idGen} from './util'
import { StringEditor} from "./stringEditor";

function f(key) {
    if (key === '`') {

    }
    store2.events.push(key)
    console.log(store2)
}

onkey(f)


document.body.style.backgroundColor = "black"
document.body.style.color = "grey"
const getId = idGen()

export function App1() {

    ReactDOM.render(<App />, document.getElementById('root'))
}


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
    events: [],

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
    return <pre>
        {store2.events.map(e=>{
            if (e.key) {
                return e.key
            }
        })}
    </pre>

    return <div>
        <button onClick={()=>store2.values.push(getId())}></button>
    </div>

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
