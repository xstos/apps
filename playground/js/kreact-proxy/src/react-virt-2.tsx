import React, {useEffect, useMemo, useState} from 'react';
import ReactDOM from 'react-dom';
//https://codesandbox.io/s/github/bvaughn/react-window/tree/master/website/sandboxes/variable-size-grid?file=/index.js:70-86
import {ipsum} from "./lorem"
import {colortable} from "./common/colortable"
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
function getInitialData(sizeInfo) {
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
    sizeInfo,
    heightRemain: NaN,
    widthRemain: NaN,
    numHeights: 0,
    rowInfo: testData.map((row,rowIndex)=>({
      numWidths: 0,
      els: testData[rowIndex].map((char,colIndex)=>
        ({ visible:true, pos:[-1,-1,sizeInfo.char.width,sizeInfo.char.height]}))
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
function resize(data) {
  const sizeInfo = data.sizeInfo
  const {width, height} = sizeInfo
  let maxCols = floor(width / sizeInfo.char.width)
  let maxRows = floor(height / sizeInfo.char.height)
  data.maxCols = maxCols
  data.maxRows = maxRows
  data.visibleGrid.numRows = floor(height / sizeInfo.char.height)
  data.visibleGrid.numCols = floor(width / sizeInfo.char.width)
}
function getContext() {
  log('getContext')
  let sizeInfo = getSizeInfo()
  const data = getInitialData(sizeInfo)
  const widestLineCount = getWidestLineCount()
  data.sizeInfo = sizeInfo

  resize(data)

  data.widestLineCount = widestLineCount
  data.overflowWidth = (widestLineCount+1) * sizeInfo.char.width
  data.overflowHeight = testData.length * sizeInfo.char.height
  return {data, sizeInfo}
}
function Example(props) {
  log('render example')
  const myctx = useMemo(()=>getContext(),[])
  const queueReflow = useMemo(()=> makeTimeout(20),[])
  const [rerender,setReRender] = useState(1)

  let {data} = myctx
  let {sizeInfo} = data
  let {width,height} = data.sizeInfo
  const spans = createSpans(data,onElementBoundaryChanged)
  function firstTimeReflow() {
    if (reflow(data)) {
      setReRender(rerender+1)
    }
  }
  useEffect(()=>{
    function onresize() {
      log('onresize')
      const rootEl = elById('root')
      let {top,left,bottom,right,width,height} = rootEl.getBoundingClientRect()
      let props = {top,left,bottom,right,width,height, getScrollPos: data.getScrollPos}
      const {clientWidth, clientHeight} = rootEl
      data.sizeInfo.width = clientWidth
      data.sizeInfo.height = clientHeight
      onContainerBoundaryChanged(props)
      resize(data)
      setReRender(rerender+1)
      queueReflow(firstTimeReflow)
    }
    window.addEventListener('resize',onresize)
    return ()=>{
      window.removeEventListener('resize',onresize)
    }
  })
  function onContainerBoundaryChanged(props) {
    let {top,left,bottom,right,width,height, getScrollPos} = props
    right=right-sizeInfo.scrollBarWidth
    bottom=bottom-sizeInfo.scrollBarHeight
    width=width-sizeInfo.scrollBarWidth
    height=height-sizeInfo.scrollBarHeight
    data.hasContainerBoundary = true
    data.boundaryRect = {top,left,bottom,right, height, width }
    data.getScrollPos = getScrollPos
  }
  function onElementBoundaryChanged(props) {
    let {left,top,width,height, rowIndex, colIndex} = props
    height = floor(height)
    width=floor(width)
    const ri = data.rowInfo[rowIndex]
    const colInfo = ri.els[colIndex]
    colInfo.visible = true
    colInfo.pos[2] = width
    colInfo.pos[3] = height
    //log('onElementBoundaryChanged',rowIndex,colIndex, testData[rowIndex][colIndex])
    queueReflow(firstTimeReflow)
  }
  function onScroll() {
    const {scrollLeft, scrollTop}=data.getScrollPos()
    const [scrollCol, scrollRow] = [data.overflowHeight/scrollTop, data.overflowWidth/scrollLeft]
    const rowOffset = floor(scrollTop/sizeInfo.char.height)
    const colOffset = floor(scrollLeft/sizeInfo.char.width)
    data.visibleGrid.startRow = rowOffset
    data.visibleGrid.startCol = colOffset
    //log('scroll',scrollLeft,scrollTop)
    setReRender(rerender+1)
  }

  return <Table
    width={width}
    height={height}
    onContainerBoundaryChanged={onContainerBoundaryChanged}
    overflowHeight={data.overflowHeight}
    overflowWidth={data.overflowWidth}
    onScroll={onScroll}
    spans={spans}
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
      let colInfo = ri.els[c]
      if (colInfo===undefined) {
        //todo: clamp last known row width/height to fix this hack
        colInfo = {
          pos: [-1,-1,data.sizeInfo.char.width,data.sizeInfo.char.height]
        }
      }
      const {pos} = colInfo
      const [_, __, width, height] = pos
      availableWidth-=width
      if (availableWidth<0) {
        colInfo.visible=false
      } else {
        colInfo.visible=true
      }
      colInfo.pos[0] = left
      colInfo.pos[1] = top
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
    return { width: floor(width), height: floor(height)}
  }
  const charSize = getCharSize()

  const [clientWidth, clientHeight] = [rootEl.clientWidth,rootEl.clientHeight]
  rootEl.style.overflow="scroll"
  const [clientWidth2, clientHeight2] = [rootEl.clientWidth,rootEl.clientHeight]
  rootEl.style.overflow=''
  const [scrollBarWidth, scrollBarHeight]=[clientWidth-clientWidth2,clientHeight-clientHeight2]
  unmount(char)
  log({clientWidth2, clientHeight2})
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
function createSpans(data, onElementBoundaryChanged) {
  const {startRow, numRows, startCol, numCols} = data.visibleGrid
  const [r1, r2] = [startRow, startRow + numRows - 1]
  const [c1, c2] = [startCol, startCol + numCols - 1]

  const items = []
  for (let rowIndex = r1; rowIndex <= r2; rowIndex++){
    const testDataAtRow = testData[rowIndex]
    function makeSpan(char, colIndex) {
      let style1 = {position: 'absolute'}
      const info = data.rowInfo[rowIndex].els[colIndex]
      if (!info.visible) {
        //log('not visible', rowIndex, colIndex)
        return null
      }
      //log('makespan',rowIndex,colIndex)
      const [left, top] = info.pos
      if (left===-1) {
        //style1.visibility='hidden'
        style1.left = px(-Number.MIN_VALUE)
        style1.top = px(-Number.MIN_VALUE)
      } else {
        //style1.visibility=undefined
        style1.left = px(left)
        style1.top = px(top)
      }

      const key = rowIndex + ' ' + colIndex
      function onRef(el) {
        //log('el ref',rowIndex,colIndex)
        if (!el) return
        const {left, top, width, height} = el.getBoundingClientRect()
        onElementBoundaryChanged({left, top, width, height, rowIndex, colIndex})
      }
      const spanInfo = {
        style: style1,
        key,
        char,
        onRef,
      }
      return spanInfo
    }

    for (let colIndex = c1; colIndex <= c2; colIndex++){
      const char = testDataAtRow[colIndex]
      if (char === undefined) break
      const item = makeSpan(char, colIndex)
      if (!item) break

      items.push(item)
    }
  }
  return items
}
function Table(props) {
  log('render table')
  const {
    overflowWidth,
    overflowHeight,
    onContainerBoundaryChanged,
    onScroll,
  } = props
  const spans: [] = props.spans
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
  const overflowDivStyle = makeOverflowDivStyle(overflowWidth, overflowHeight)
  const rows = []
  for (let i = 0; i < spans.length; i++){
    const s = spans[i]
    const {style,key,char,onRef} = s

    rows.push(<span key={key} style={style} ref={onRef}>{char}</span>)
  }

  return <div id={"abc"} key={"outer"} ref={divRef} style={style1} onScroll={onScroll}>
    <div key={"overflow"} style={overflowDivStyle}/>
    <React.Fragment key={"els"}>
      {rows}
    </React.Fragment>
  </div>
}

export function ReactWindowFlow()
{
  ReactDOM.render(<Example/>, document.getElementById('root'));
}

