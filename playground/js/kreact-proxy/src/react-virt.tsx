import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import { VariableSizeGrid as Grid } from 'react-window';
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
const map = {}
let numrows = 10
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
  const {columnIndex, rowIndex, style} = props
  const t = `r${rowIndex}c${columnIndex}`
  const [text,setText] = useState(t)
  map[rowIndex+" "+columnIndex]=setText

  return <span
    className={getClassName(columnIndex, rowIndex)}
    style={style}
  >
    {text}
  </span>
}

function Example() {
  useEffect(()=>{
    const e = Object.entries(map)
    if (e.length>0) {
      e[0][1]("yo")
    }
  },[])
  return <Grid
    className="Grid"
    columnCount={36}
    columnWidth={index => columnWidths[index]}
    height={500}
    rowCount={numrows}
    rowHeight={index => rowHeights[index]}
    width={300}
    initialScrollTop={0}

  >
    {Cell}
  </Grid>
}
export function ReactWindowExample()
{
  ReactDOM.render(<Example/>, document.getElementById('root'));
}

