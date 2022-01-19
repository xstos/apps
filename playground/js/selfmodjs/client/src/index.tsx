import * as React from 'react'
import ReactDOM from 'react-dom'
import { store, view } from '@risingstack/react-easy-state';
import {createApi} from "./api";
import {TAction, TState} from "./types";
import {onkey} from "./io";

declare global {
    // interface Object {
    //     with() : void;
    // }
    interface Array<T> {
        find2(item: T, callback: TFind2Callback<T>): void
        insertItemsAtMut(index:Number, ...items: T[]) : T[]
    }
    interface Object {
        log<T>(): T
    }
}

type TFind2Callback<T> = (index: Number, array: T[]) => void
function setProtos() {

}
Object.prototype.log = function<T>(): T {
    console.log(this)
    return this
}
Array.prototype.find2 = function<T>(itemToFind: T, callback: TFind2Callback<T>): void {
    const i = this.findIndex(v=>v===itemToFind)
    if (i<0) return;
    callback(i,this)
}
Array.prototype.insertItemsAtMut = function<T>(index: number, ...items: T[]): T[] {
    this.splice(index,0,items)
}

const cursor = '█'

const state = store({
    nodes: [
        ['[',0],
        cursor,
        [']',0]
    ]
});

function setStyles() {

    const html = document.documentElement.style
    const body = document.body.style
    const root = document.getElementById('root').style
    const zero = "0px"
    html.margin=zero
    html.padding=zero
    body.margin=zero
    body.padding=zero
    html.width=body.width="100vw"
    html.minHeight=body.minHeight="100vh"
    root.width="100%"
    root.margin=zero
    root.padding=zero

}
setStyles()
function push(...items) {

    state.nodes.find2('█', (index,nodes) => {
        if (items[0] ==='backspace') {
            if (index===0) return
            nodes.splice(+index-1,1)
            return
        }
        nodes.insertItemsAtMut(index, ...items)
    })

}
onkey((data)=>{
    const {key, dt} = data
    push(key)
    //console.log(data)
})



//const api = createApi(dispatch)

function dispatch(...items) {

    console.log(JSON.stringify(items))
}

function App(props) {
    function renderNode(nodeData) {

    }
    return (
        <>
            {btn("new")}
            <_div>[{state.nodes.map(renderNode)}]</_div>
        </>

    )
}
function layoutEngine() {

}
function _div(props) {
    return <div ref={(el)=>{
        if (!el) return
        const s = el.style
        s.backgroundColor='red'
        // s.position= 'fixed'
        s.fontFamily='monospace'
        // s.left='100px'
        // s.top= '100px'

        //console.log(el.clientWidth,el.clientHeight)
    }}>{props.children}</div>
}
function btn(id) {
    return <button onClick={()=>{}}>{id}</button>
}

ReactDOM.render( //render our app inside the 'root' div element
  React.createElement(view(App)),
  document.getElementById('root')
)

//api.get("db.get", "https://localhost:8000/api/db") //load data from the server

function saveDb(state: TState) {
    console.log("saving", state)
    //api.post("db.post", "https://localhost:8000/api/db", state)
}
