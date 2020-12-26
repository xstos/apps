import { hot } from 'react-hot-loader'
import React from 'react'
// https://magcius.github.io/xplain/article/rast1.html
const App = () => {
  return (
    <Grid
      array={[
        [1, 2],
        [3, 4],
      ]}
    />
  )
}
function GridCell() {}
function Grid(props) {
  const { array } = props
  return array.map(rowMap)

  function rowMap(row) {
    return <div style={{ margin: 0, padding: 0, display: 'flex' }}>{row.map(colMap)}</div>
  }

  function colMap(item) {
    const el = (
      <div
        style={{
          height: '20px',
          width: '20px',
          border: 'solid red 1px',
          margin: 0,
          padding: 0,
          display: 'inline-flex',
        }}
      />
    )
    return el
  }
}

export default hot(module)(App)
