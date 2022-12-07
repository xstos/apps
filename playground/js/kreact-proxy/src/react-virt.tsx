import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import { VariableSizeGrid as Grid } from 'react-window';
import AutoSizer from "react-virtualized-auto-sizer";
//https://codesandbox.io/s/github/bvaughn/react-window/tree/master/website/sandboxes/variable-size-grid?file=/index.js:70-86
import {ipsum} from "./lorem"

export function jsx(type: any, props: Record<string, any>, ...children: any[]) {
  return React.createElement(type,props,...children)
}
const columnWidths = new Array(100000)
  .fill(true)
  .map(() => 10 + Math.round(Math.random() * 20));
const rowHeights = new Array(100000)
  .fill(true)
  .map(() => 10 + Math.round(Math.random() * 20));
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
function Cell(props) {
  const {columnIndex, rowIndex, style, controller} = props
  const [text,setText] = useState('a')

  //map[rowIndex+" "+columnIndex]=setText
  if (!text) return null
  return <span
    className={getClassName(columnIndex, rowIndex)}
    style={style}
  >
    {text}
  </span>
}
export function getControllerById(id) {
  return map[id]
}
function Example(props) {
  const {id, onReady}=props
  const [numCols,setNumCols] = useState(0)
  const [numRows,setNumRows] = useState(0)
  const [scrollLeft,setScrollLeft] = useState(0)
  const [scrollTop,setScrollTop] = useState(0)
  const [data,setData] = useState({
    numCols: 0,
    numRows: 0,
    table: [[]]
  })
  let controller
  if (!map[id]) {
    controller = {
      setNumCols,
      setNumRows,
      getColumnWidth: (index) => 6,
      getRowHeight: (index) => 12,
      setScrollLeft,
      setScrollTop,
      setData,
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
  return <AutoSizer>
    {({ height, width }) => {
      const dt = data.table
      return (
        <Grid
          className="Grid"
          columnCount={data.numCols}
          columnWidth={(i)=>controller.getColumnWidth(i)}
          height={height}
          rowCount={data.numRows}
          rowHeight={(i)=>controller.getRowHeight(i)}
          width={width}
          initialScrollTop={scrollTop}
          initialScrollLeft={scrollLeft}
        >
          {(props) => {

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
          }}
        </Grid>
      )
    }}
  </AutoSizer>
  return
}
export function ReactWindowExample(onReady)
{
  ReactDOM.render(<Example id={0} onReady={onReady}/>, document.getElementById('root'));
}
