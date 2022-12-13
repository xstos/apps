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
let screenInfo
let ctsplit = colortable.split('\n').map(line=>{
  return line.length === 0 ? ' ' : line
})
ctsplit[2]+=ipsum
let testData = ctsplit.map(r=>r.split(''))
function Example(props) {
  const gridRef = useRef(null)

  let colWidth=6, rowHeight=12

  useEffect(()=>{
  },[])
  
  useEffect(()=>{
    //gridRef?.current?.scrollToItem({ columnIndex, rowIndex, align: 'smart' })

  })
  function getRowCount() {
    return testData.length
  }
  function getColumntCount(rowIndex) {
    return testData[rowIndex].length
  }
  const {width,height} = elById('root').getBoundingClientRect()
  return <Table width={width} height={height}/>
  return <AutoSizer>
    {({ height, width }) => <Table width={width} height={height}/>}
  </AutoSizer>
}

function getScreenInfo() {
  const rootEl = elById('root')
  const char = document.createElement('span')
  char.appendChild(document.createTextNode('W'))
  char.style.position = 'absolute'
  char.style.padding='0px'
  char.style.margin='0px'
  char.style.backgroundColor='red'
  rootEl.appendChild(char)
  const r =  char.getBoundingClientRect()
  const { width, height } = r
  unmount(char)
  const ret = {
    char: { width, height },
    screen: {
      maxCols: floor(screen.width/width),
      maxRows: floor(screen.height/height)
    }
  }
  log(ret)
  return ret
}


function Table(props) {
  const {width,height} = props
  const [maxCols,maxRows] = useMemo(() => {
    screenInfo = getScreenInfo()
    let maxCols = floor(width/screenInfo.char.width)-1
    let maxRows = floor(height/screenInfo.char.height)-1
    return [maxCols,maxRows]
  }, []);
  let rowRange = [0,100]
  let colRange = [0,100]
  let boundaryRect = {
    dirty: false,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
  let scrollDiv=null
  const [data,setData] = useState({
    dirty: false,
    rowRange: [0,maxRows],
    heightRemain: height,
    widthRemain: width,
    rowInfo: testData.map((row,rowIndex)=>({
      els: testData[rowIndex].map((char,colIndex)=>({ el: null, pos:[0,0,0,0]}))
    }))
  })
  function repaint() {
    if (!data.dirty) return
    if (!boundaryRect.dirty) return
    log('start reflow')
    const [startRow, endRow] = data.rowRange
    let left = boundaryRect.left
    let top = boundaryRect.top
    let keepGoing = true
    for (let r = startRow; r <= endRow && keepGoing; r++) {
      const ri = data.rowInfo[r]
      let usedHeight = 0
      for (let c = 0; c < ri.els.length; c++) {
        const {el, pos} = ri.els[c]
        if (!el) {
          keepGoing = false
          break
        }
        const [_, __, width, height] = pos
        el.style.left = left + "px"
        el.style.top = top + 'px'
        pos[0] = left
        pos[1] = top
        ri.els[c].pos = pos
        left += width
        usedHeight = Math.max(usedHeight, height)
      }
      top += usedHeight
      left = boundaryRect.left
    }
    data.dirty = false
    setData(data)
    log('end reflow')
  }

  useEffect(()=>{
    const handle = setInterval(repaint,100)

    return () => {
      clearInterval(handle)
    }
  },[])
  const [r1,r2] = data.rowRange
  const rows = Array.from(numbersBetween(r1,r2),rowIndex=>{
    function derp(o) {
      const {el, colIndex}=o
      if (!el) return
      data.dirty=true
      const {left,top,width,height} = el.getBoundingClientRect()
      //log('ref',rowIndex,colIndex,testData[rowIndex][colIndex])
      const ri = data.rowInfo[rowIndex]
      ri.els[colIndex] = {
        el,
        pos: [left,top,width,height]
      }
      setData(data)
    }
    const row = testData[rowIndex].map(makeSpan)
    function makeSpan(char, colIndex) {
      return <span style={{position: 'absolute'}} key={rowIndex + ' ' + colIndex}
                   ref={el => derp({el, colIndex})}>{char}</span>
    }
    return row
  })
  function onScroll(e) {
    if (!scrollDiv) return
    const {scrollLeft, scrollTop}=scrollDiv

  }
  const style = {
    width: '8500px',
    height: '11000px',
    display:'inline-block',
    border: "1px solid rbga(255,255,255,1)",
    padding: '0px',
    margin: '0px'
  }
  function divRef(e) {
    scrollDiv = e
    const {top, left, bottom, right} = scrollDiv.getBoundingClientRect()
    boundaryRect = {top,left,bottom,right, dirty: true}

  }
  return <div ref={divRef} style={{overflowX:"scroll", overflowY: "scroll", width, height, display:'inline-block'}} onScroll={onScroll}>
    <div style={style}></div>
    {rows.flatMap(r=>r)}
  </div>
}

export function ReactWindowFlow()
{
  ReactDOM.render(<Example/>, document.getElementById('root'));
}

