import './index.css';
import {store as createStore, watch} from 'hyperactiv/src/react'
import hyperactiv from "hyperactiv";
const { observe, computed, dispose } = hyperactiv

import * as ReactDOM from "react-dom"

import {useRef, useState} from "react"
import {roundTo} from "round-to"

//https://github.com/githubjonas/react-tiny-drag-drop/blob/master/src/react-tiny-drag-drop.jsx
const state = createStore({
  items: [0,1,2,3,4].map((id,i)=>({
    id,
    children: i===0 ? [1,2,3,4] : [],
    isDragging: 0
  })),

})
function mapChild(pid, childId, index) {
  return <Item key={childId} id={childId} pid={pid} index={index}/>
}
const Render = watch(() => {
  return state.items[0].children
    .map((childId,index)=>mapChild(0, childId, index))
})
const dragDropState = observe({
  x: null,
  y: null,
  source: null,
}, {
  bubble: true,
  deep: true
})

dragDropState.__handler = (keys, value, oldValue, observedObject) => {
  if (value===oldValue) return
  const [key] = keys
  //if (key==='x' || key==='y') return
  console.log(JSON.stringify({keys,value,oldValue}))
}
function getChildren(id) {
  return state.items[id].children
}
function getChild(id, index) {
  return state.items[id].children[index]
}

function Item(props) {

  const Ret = watch(()=>{
    const {pid,index, ...rest} = props
    const id = getChild(pid,index)
    if (id===null) return null
    const item = state.items[id]
    const ref = useRef(null)
    const map = item.children.map((childId, index) => mapChild(pid, childId, index))
    return <div key={id} ref={ref}
                draggable={true}
                onDragStart={(e) =>{
                  console.log('dragStart', id)
                  dragDropState.source={pid, index}
                  item.isDragging=1
                }}
                onDrag={(e) => {}}
                onDragEnd={(e) => {
                  console.log('dragEnd', id)
                }}
                onDragEnter={(e) => {
                  console.log('dragEnter', id)

                  dragDropState.target={pid, index}
                }}
                onDragLeave={(e) => {
                  console.log('dragLeave', id)
                  //dragDropState.target=null
                }}
                onDragOver={(e) =>{
                  e.preventDefault()
                  const rect = ref.current?.getBoundingClientRect()
                  const [x,y]=[e.clientX-rect.left, e.clientY-rect.top]
                  const [w,h]=[x/rect.width,y/rect.height]
                  dragDropState.x=roundTo(w,3)
                  dragDropState.y=roundTo(h,3)
                  //console.log([x,y])

                }}
                onDrop={(e) => {
                  e.preventDefault()
                  console.log('onDrop', id)
                  const src = dragDropState.source
                  const dest = dragDropState.target

                  const child = getChild(src.pid, src.index)
                  console.log(child)

                  if (dragDropState.y<0.25) {

                    getChildren(dest.pid).splice(dest.index,0,child)

                  }

                }}
                style={{border: '1px solid red', padding: '1px', margin: '1px'}}>
      {id}
      drg {item.isDragging}
      {map}
    </div>
  })
  return <Ret></Ret>
}
function swapIndexes(arr, dropId, draggedId) {
  const old = arr[dropId]
  arr[dropId] = arr[draggedId]
  arr[draggedId] = old
}

const App = <Render/>


ReactDOM.render(App,document.getElementById('root'))



