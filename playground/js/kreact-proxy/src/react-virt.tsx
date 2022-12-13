import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import { VariableSizeGrid as Grid } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
//https://codesandbox.io/s/github/bvaughn/react-window/tree/master/website/sandboxes/variable-size-grid?file=/index.js:70-86
import {ipsum} from "./lorem"

export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  return React.createElement(type,props,...children)
}
const map = []
function getClassName(columnIndex, rowIndex) {
  return columnIndex % 2
    ? rowIndex % 2 === 0
      ? 'GridItemOdd'
      : 'GridItemEven'
    : rowIndex % 2
      ? 'GridItemOdd'
      : 'GridItemEven'
}
const map2 = {}

export function getControllerById(id) {
  return map[id]
}
function Example(props) {
  const {id, onReady}=props
  const gridRef = useRef(null)
  const [numCols,setNumCols] = useState(0)
  const [numRows,setNumRows] = useState(0)
  const [data,setData] = useState({
    numCols: 0,
    numRows: 0,
    table: [[]],
    cursor: [0,0],
  })

  let controller, colWidth=6, rowHeight=12
  if (!map[id]) {
    controller = {
      setNumCols,
      setNumRows,
      getColumnWidth: (index) => colWidth,
      getRowHeight: (index) => rowHeight,
      setData,
      cursor: [0,0],
    }
    map[id]=controller
  } else {
    controller = map[id]
  }
  controller.numCols = numCols
  controller.numRows = numRows

  useEffect(()=>{
    onReady()

    //controller.setNumCols(10)
    //controller.setNumRows(10)
    //controller.getColumnWidth = (index) => 20
  },[])
  useEffect(()=>{
    const [rowIndex, columnIndex] = data.cursor
    //console.log('scroll',rowIndex,columnIndex)
    gridRef?.current?.scrollToItem({ columnIndex, rowIndex, align: 'smart' })
    map2['0 1'] && map2['0 1']('b')
  })
  const dt = data.table
  function Cell(props) {
    const {columnIndex, rowIndex, style} = props
    const [text,setText] = useState('a')
    console.log('cell',rowIndex,columnIndex)
    map2[rowIndex+" "+columnIndex]=setText
    let derp = dt[rowIndex][columnIndex]
    derp = derp && derp()
    if (!text) return null
    return <span
      className={getClassName(columnIndex, rowIndex)}
      style={style}
    >
    {derp}
  </span>
  }
  return <AutoSizer>
    {({ height, width }) => {
      const element = (props) => {

        const {columnIndex, rowIndex, style} = props
        let derp = dt[rowIndex][columnIndex]
        derp = derp && derp()
        return <span
          className={getClassName(columnIndex, rowIndex)}
          style={style}
        >
        {derp}
        </span>
        //return <Cell controller={controller} {...props}/>
      }
      return (
        <Grid
          className="Grid"
          columnCount={data.numCols+5}
          columnWidth={(i)=>controller.getColumnWidth(i)}
          height={height}
          rowCount={data.numRows}
          rowHeight={(i)=>controller.getRowHeight(i)}
          width={width}
          initialScrollTop={0}
          initialScrollLeft={0}
          ref={gridRef}
        >
          {Cell}
        </Grid>
      )
    }}
  </AutoSizer>
}

export function ReactWindowExample(onReady)
{
  ReactDOM.render(<Example id={0} onReady={onReady}/>, document.getElementById('root'));
}

