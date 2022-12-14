import React, {useEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {VariableSizeGrid as Grid, VariableSizeList as List} from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
//https://codesandbox.io/s/github/bvaughn/react-window/tree/master/website/sandboxes/variable-size-grid?file=/index.js:70-86
import {ipsum} from "./lorem"
import {colortable} from "./common/colortable"
import {numbersBetween} from "./util"
import {elById, unmount} from "./domutil"

export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  return React.createElement(type,props,...children)
}
const log = console.log
const round = Math.round
const floor = Math.floor
let ctsplit = colortable.split('\n').map(line=>{
  return line.length === 0 ? ' ' : line
})
ctsplit[2]+=ipsum
let testData = ctsplit.map(r=>r.split(''))
function getInitialData() {
  const initialData = {
    hasContainerBoundary: false,
    boundaryRect: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
    },
    maxRows: 0,
    maxCols: 0,
    scrollDiv: null,
    dirty: false,
    getScrollPos: ()=>({scrollLeft: 0, scrollTop: 0}),
    scrollY: 0,
    visibleGrid: {
      numCols: 0,
      numRows: 0,
      startCol: 0,
      startRow: 0,
    },
    heightRemain: NaN,
    widthRemain: NaN,
    numHeights: 0,
    rowInfo: testData.map((row,rowIndex)=>({
      numWidths: 0,
      heightOffset: 0,
      els: testData[rowIndex].map((char,colIndex)=>({ visible:true, pos:[-1,-1,-1,-1]}))
    }))
  }
  return initialData
}
function makeTimeout(handler: TimerHandler, timeout: number | undefined) {
  let myhandle = [false,NaN]
  function enqueue() {
    const [isSet,handle] = myhandle
    if (!isSet) {
      myhandle = [true,setTimeout(handler,timeout)]
    }
  }
  return enqueue
}
function Example(props) {
  let setDirty=()=>{}
  const data = getInitialData()
  let screenInfo = getSizeInfo()
  const {width,height} = screenInfo
  let maxCols = floor(width/screenInfo.char.width)-1
  let maxRows = floor(height/screenInfo.char.height)-1
  data.maxRows = maxRows
  data.maxCols = maxCols
  data.visibleGrid.numRows = floor(height/screenInfo.char.height)
  data.visibleGrid.numCols = floor(width/screenInfo.char.height)
  const queueReflow = makeTimeout(()=>{
    if (reflow(data)) setDirty()
  },100)
  function getData() {
    return data
  }
  function onContainerBoundaryChanged(props) {
    let {top,left,bottom,right,width,height, getScrollPos} = props
    right=right-screenInfo.scrollBarWidth
    bottom=bottom-screenInfo.scrollBarHeight
    width=width-screenInfo.scrollBarWidth
    height=height-screenInfo.scrollBarHeight
    data.hasContainerBoundary = true
    data.boundaryRect = {top,left,bottom,right, height, width }
    data.getScrollPos = getScrollPos
  }
  function onElementBoundaryChanged(props) {
    const {left,top,width,height, rowIndex, colIndex} = props
    const ri = data.rowInfo[rowIndex]
    ri.els[colIndex] = {
      pos: [left,top,width,height]
    }
    queueReflow()
  }
  function onScroll() {
    const {scrollLeft, scrollTop}=data.getScrollPos()
    const vertPercent = scrollTop/11000
    data.scrollY = vertPercent

  }
  function onSetDirtyCallbackCreated(dirtyCallback) {
    setDirty = dirtyCallback
  }
  return <Table
    width={width}
    height={height}
    onContainerBoundaryChanged={onContainerBoundaryChanged}
    onElementBoundaryChanged={onElementBoundaryChanged}
    getData={getData}
    onScroll={onScroll}
    onSetDirtyCallbackCreated={onSetDirtyCallbackCreated}
  />
}

function reflow(data) {
  if (!data.hasContainerBoundary) return false
  log('start reflow')
  let {visibleGrid} = data
  let { startRow, startCol, numRows, numCols } = visibleGrid
  let [endRow,endCol] = [startRow+numRows-1, startCol+numCols-1]

  //startRow = floor(data.scrollY*testData.length)
  //endRow = startRow + data.maxRows
  let left = data.boundaryRect.left
  let top = data.boundaryRect.top+data.rowInfo[startRow].heightOffset
  for (let r = startRow; r <= endRow; r++) {
    const ri = data.rowInfo[r]
    let usedHeight = 0
    let availableWidth = data.boundaryRect.width
    for (let c = 0; c < ri.els.length; c++) {

      const colInfo = ri.els[c]
      const {pos} = colInfo
      const [_, __, width, height] = pos
      if (width===-1) {
        log('reflow aborted')
        return false
      }
      availableWidth-=width
      if (availableWidth<0) {
        colInfo.visible=false
      } else {
        colInfo.visible=true
      }
      pos[0] = left
      pos[1] = top
      colInfo.pos = pos
      left += width
      usedHeight = Math.max(usedHeight, height)
    }
    top += usedHeight
    ri.heightOffset = usedHeight
    left = data.boundaryRect.left
  }

  log('end reflow')
  return true
}

function getSizeInfo() {
  const rootEl = elById('root')
  const char = document.createElement('span')
  char.appendChild(document.createTextNode('W'))
  char.style.position = 'absolute'
  char.style.padding='0px'
  char.style.margin='0px'
  char.style.backgroundColor='red'
  rootEl.appendChild(char)

  function getCharSize() {
    const r =  char.getBoundingClientRect()
    const { width, height } = r
    return r
  }
  const charSize = getCharSize()

  const [clientWidth, clientHeight] = [rootEl.clientWidth,rootEl.clientHeight]
  rootEl.style.overflow="scroll"
  const [clientWidth2, clientHeight2] = [rootEl.clientWidth,rootEl.clientHeight]
  rootEl.style.overflow=''
  const [scrollBarWidth, scrollBarHeight]=[clientWidth-clientWidth2,clientHeight-clientHeight2]
  unmount(char)
  const ret = {
    scrollBarWidth,
    scrollBarHeight,
    width: clientWidth2,
    height: clientHeight2,
    char: charSize,
    screen: {
      maxCols: floor(screen.width/charSize.width),
      maxRows: floor(screen.height/charSize.height)
    }
  }
  log(ret)
  return ret
}

const overflowDivStyle = {
  width: '8500px',
  height: '11000px',
  display:'inline-block',
  padding: '0px',
  margin: '0px'
}
function Table(props) {
  const {
    width,
    height,
    onContainerBoundaryChanged,
    getData,
    onElementBoundaryChanged,
    onScroll,
    onSetDirtyCallbackCreated,
  } = props
  const [dirty, setDirty] = useState(0)
  const data = getData()
  if (dirty===0) {
    function setDirty2() {
      setDirty(dirty+1)
    }
    onSetDirtyCallbackCreated(setDirty2)
  }
  const {startRow, numRows} = data.visibleGrid
  const [r1,r2] = [startRow,startRow+numRows-1]
  const rows = Array.from(numbersBetween(r1,r2),rowIndex=>{

    function makeSpan(char, colIndex) {
      let style1 = {position: 'absolute'}
      const info = data.rowInfo[rowIndex].els[colIndex]
      if (!info.visible) return null
      const [left,top] = info.pos
      style1.left = left+'px'
      style1.top = top+'px'
      return <span
        style={style1}
        key={rowIndex + ' ' + colIndex}
        ref={el => {
          if (!el) return
          const {left,top,width,height} = el.getBoundingClientRect()
          onElementBoundaryChanged({left,top,width,height,rowIndex,colIndex})
        }}>{char}
      </span>
    }
    const row = testData[rowIndex].map(makeSpan)
    return row
  })

  function divRef(el) {
    if (!el) return
    const {top, left, bottom, right, width, height} = el.getBoundingClientRect()
    function getScrollPos() {
      const {scrollLeft, scrollTop}=el
      return {scrollLeft, scrollTop}
    }
    onContainerBoundaryChanged({top,left,bottom,right,width,height, getScrollPos})
  }
  const style1 = {overflowX:"scroll", overflowY: "scroll", width: '100%', height: '100%', display:'inline-block'}

  return <div ref={divRef} style={style1} onScroll={onScroll}>
    <div style={overflowDivStyle}/>
    {rows.flatMap(r=>r)}
  </div>
}

export function ReactWindowFlow()
{
  ReactDOM.render(<Example/>, document.getElementById('root'));
}

