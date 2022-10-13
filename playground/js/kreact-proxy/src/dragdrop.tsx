import React, {useEffect} from "react"
import {cellx} from "cellx"
import ReactDOM from "react-dom"
import {ObservableList} from "cellx-collections"

export const jsx = React.createElement
const ol = new ObservableList([0, 0, 100, 100])
const boxCell = cellx(ol)

const mouse = {
  down: {
    state: false,
    coords: [0, 0],
    el: document.body
  },
  move: {
    coords: [0, 0],
    el: document.body
  },
  up: {
    coords: [0, 0],
    el: document.body
  },
  touchedElements: new Set()
}

function px(n) {
  return n + 'px'
}

const pt2el = (x, y) => document.elementFromPoint(x, y)

export function BoxComponent(props) {
  const style = {
    border: 'dashed 1px rgba(255,0,0,0.5)',
    backgroundColor: 'rgba(0,0,128,0.4)',
    position: 'absolute',
  }
  let hookupCallback = null
  useEffect(() => {
    if (hookupCallback) hookupCallback()
  }, [])
  const ret = <div style={style} ref={onRef}/>

  function onRef(e) {
    if (!e) return
    const s = e.style
    hookupCallback = hcb

    function hcb() {
      boxCell.onChange((arr) => {
        const [x1, y1, x2, y2] = arr.target.getRange(0, 4)
        s.left = px(x1)
        s.top = px(y1)
        const w = px(x2 - x1)
        const h = px(y2 - y1)
        s.width = w
        s.height = h
        console.log('wh', w, h)
        //s.right = x2
        //s.bottom = y2
      })
    }

  }

  return ret
}

document.addEventListener('mousedown', (e) => {
  console.log("mouse down")
  e.preventDefault()
  console.log(e)
  mouse.down.state = true
  const [x, y] = [e.clientX, e.clientY]
  //ol.set(0, 0)
  //ol.set(1, 0)
  //ol.setRange(0,[0,0,0,0])
  mouse.down.coords = [x, y]
  mouse.down.el = e.currentTarget
  e.target.style.color = "red"
})
document.addEventListener('mousemove', (e) => {
  const [x, y] = [e.clientX, e.clientY]
  console.log('move', x, y)

  if (!mouse.down.state) return
  e.preventDefault()
  const [xd,yd]=mouse.down.coords
  ol.setRange(0,[xd,yd,x,y])
  mouse.move.coords = [x, y]
  mouse.move.el = e.currentTarget
})
document.addEventListener('mouseup', (e) => {

  e.preventDefault()
  const [x, y] = [e.clientX, e.clientY]
  ol.set(2, x)
  ol.set(3, y)
  mouse.down.state = false
  mouse.up.coords = [x, y]
  mouse.up.el = e.currentTarget
  console.log("mouse up", x, y)
})

function Letters(props) {
  const letters =range(1, 10).map((i) => <span>{getRandomLetter()}</span>)
  return <><br/>{letters}</>

}

export function DragDropDemo(props) {
  return <Letters/>
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function getRandomLetter() {
  return characters.charAt(Math.floor(Math.random() *
    characters.length));
}

function range(start, end) {
  const ret = []
  for (let i = start; i <= end; i++) {
    ret.push(i)
  }
  return ret
}