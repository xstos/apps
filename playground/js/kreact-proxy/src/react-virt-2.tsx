import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {VariableSizeGrid as Grid, VariableSizeList as List} from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
//https://codesandbox.io/s/github/bvaughn/react-window/tree/master/website/sandboxes/variable-size-grid?file=/index.js:70-86
import {ipsum} from "./lorem"
import {colortable} from "./common/colortable"
import {numbersBetween} from "./util"

export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  return React.createElement(type,props,...children)
}
const log = console.log
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

  return <AutoSizer>
    {({ height, width }) => <Table width={width} height={height}/>}
  </AutoSizer>
}
function Table(props) {
  const {width,height} = props

  const [data,setData] = useState({
    dirty: false,
    rowRange: [0,10],
    heightRemain: height,
    widthRemain: width,
    rowInfo: testData.map((row,rowIndex)=>({
      els: testData[rowIndex].map((char,colIndex)=>({ el: null, pos:[0,0,0,0]}))
    }))
  })

  useEffect(()=>{
    const handle = setInterval(()=>{
      if (!data.dirty) return
      log('start reflow')
      const [startRow, endRow] = data.rowRange
      let left = 0
      let top = 0
      let keepGoing = true
      for (let r = startRow; r <= endRow && keepGoing; r++) {
        const ri = data.rowInfo[r]
        let usedHeight=0
        for (let c = 0; c < ri.els.length; c++) {
          const {el,pos} = ri.els[c]
          if (!el) {
            keepGoing = false
            break
          }
          const [_, __, width, height] = pos
          el.style.left = left+"px"
          el.style.top = top+'px'
          pos[0]=left
          pos[1]=top
          ri.els[c].pos=pos
          left+=width
          usedHeight = Math.max(usedHeight, height)
        }
        top+=usedHeight
        left=0
      }
      data.dirty=false
      setData(data)
      log('end reflow')
    },100)

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
    const row = testData[rowIndex].map((char,colIndex)=>
      <span style={{position: 'absolute'}} key={rowIndex+' '+colIndex} ref={el=>derp({el,colIndex})}>{char}</span>
    )
    return row
  })
  return rows.flatMap(r=>r)
}

export function ReactWindowFlow()
{
  ReactDOM.render(<Example/>, document.getElementById('root'));
}

