import React, {useEffect, useMemo, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {VariableSizeGrid as Grid, VariableSizeList as List} from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
//https://codesandbox.io/s/github/bvaughn/react-window/tree/master/website/sandboxes/variable-size-grid?file=/index.js:70-86
import {ipsum} from "./lorem"
import {colortable} from "./common/colortable"
import {numbersBetween} from "./util"
import {elById, px, unmount} from "./domutil"

export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  return React.createElement(type,props,...children)
}
const log = console.log
const round = Math.round
const floor = Math.floor
let ctsplit = colortable.split('\n').map(line=>{
  return line.length === 0 ? ' ' : line
})
ctsplit[0]+=ipsum
let testData = ctsplit.map(r=>r.split(''))
function getInitialData() {
  const initialData = {
    dirtyCallback: ()=>{},
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
    widestLineCount: 0,
    overflowWidth: 0,
    overflowHeight: 0,
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
      els: testData[rowIndex].map((char,colIndex)=>({ visible:true, pos:[-1,-1,-1,-1]}))
    }))
  }
  return initialData
}
function makeTimeout(timeout: number | undefined) {
  let myhandle = [false,NaN]
  let pendingCallback: Function=()=>{}
  function enqueue(callback: Function) {
    pendingCallback = callback
    const [isSet,handle] = myhandle
    if (!isSet) {
      myhandle = [true,setTimeout(()=>{
        pendingCallback()
        myhandle=[false,NaN]
      },timeout)]
    }
  }
  return enqueue
}
function getWidestLineCount() {
  return testData.reduce((acc,value)=>{
    return Math.max(acc,value.length)
  },0)
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
  data.widestLineCount = getWidestLineCount()
  data.visibleGrid.numRows = floor(height/screenInfo.char.height)
  data.visibleGrid.numCols = floor(width/screenInfo.char.width)
  data.overflowWidth = getWidestLineCount()*screenInfo.char.width
  data.overflowHeight = testData.length*screenInfo.char.height
  function firstTimeReflow() {
    if (reflow(data)) setDirty()
  }
  const queueReflow = makeTimeout(100)
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
      visible: true,
      pos: [left,top,width,height]
    }
    //log('onElementBoundaryChanged',rowIndex,colIndex, testData[rowIndex][colIndex])
    queueReflow(firstTimeReflow)
  }
  function onScroll() {
    const {scrollLeft, scrollTop}=data.getScrollPos()
    const [scrollCol, scrollRow] = [data.overflowHeight/scrollTop, data.overflowWidth/scrollLeft]
    const rowOffset = floor(scrollTop/screenInfo.char.height)
    const colOffset = floor(scrollLeft/screenInfo.char.width)
    data.visibleGrid.startRow = rowOffset
    data.visibleGrid.startCol = colOffset
    log('scroll',data.visibleGrid.startRow)
    setDirty()
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

  let left = data.boundaryRect.left
  let top = data.boundaryRect.top
  for (let r = startRow; r <= endRow; r++) {
    const ri = data.rowInfo[r]
    let usedHeight = 0
    let availableWidth = data.boundaryRect.width
    for (let c = startCol; c <= endCol; c++) {
      const colInfo = ri.els[c]
      if (colInfo===undefined) break
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

function makeOverflowDivStyle(width:number,height:number) {
  return {
    width: px(width),
    height: px(height),
    display:'inline-block',
    visibility: 'hidden',
    padding: '0px',
    margin: '0px'
  }
}
let key = 0
function Table(props) {
  log('render table')
  const {
    width,
    height,
    onContainerBoundaryChanged,
    getData,
    onElementBoundaryChanged,
    onScroll,
    onSetDirtyCallbackCreated,
  } = props
  const [dirty, setDirty] = useState(1)
  useEffect(()=>{
    function setDirty2() {
      setDirty(dirty+1)
    }
    onSetDirtyCallbackCreated(setDirty2)
  },[])
  const data = getData()
  const {startRow, numRows, startCol, numCols} = data.visibleGrid
  const [r1,r2] = [startRow,startRow+numRows-1]
  const [c1,c2] = [startCol, startCol+numCols-1]


  const rows = Array.from(numbersBetween(r1,r2),rowIndex=>{
    //log('render row',rowIndex)
    function makeSpan(char, colIndex) {
      let style1 = {position: 'absolute'}
      const info = data.rowInfo[rowIndex].els[colIndex]
      if (!info.visible) {
        log('not visible', rowIndex,colIndex)
        return null
      }
      //log('makespan',rowIndex,colIndex)
      const [left,top] = info.pos
      style1.left = left+'px'
      style1.top = top+'px'
      return <span
        style={style1}
        key={(key++)+''}
        ref={el => {
          //log('el ref',rowIndex,colIndex)
          if (!el) return

          const {left,top,width,height} = el.getBoundingClientRect()
          onElementBoundaryChanged({left,top,width,height,rowIndex,colIndex})
        }}>{char}
      </span>
    }
    const testDataAtRow = testData[rowIndex]

    const row = Array.from(numbersBetween(c1,c2), c=>{
      const char = testDataAtRow[c]
      if (char===undefined) return null
      return makeSpan(char,c)
    })

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
  const style1 = {
    overflowX: "scroll",
    overflowY: "scroll",
    width: '100%',
    height: '100%',
    display:'inline-block',
  }
  if (dirty % 2 === 0) {
    setDirty(dirty+1)
  }
  return <div key={"outer"} ref={divRef} style={style1} onScroll={onScroll}>
    <div key={"overflow"} style={makeOverflowDivStyle(data.overflowWidth, data.overflowHeight)}/>
    {dirty % 2 ? rows.flatMap(r=>r) : null}
  </div>
}

export function ReactWindowFlow()
{
  ReactDOM.render(<Example/>, document.getElementById('root'));
}

