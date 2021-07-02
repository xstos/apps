import React, { useContext } from 'react'
import ReactDOM from 'react-dom'

function BuildContext(props) {
  const { value, defaultValue, children, useInit } = props

  const MyContext = React.createContext(defaultValue)
  const useMyContext = () => useContext(MyContext)
  useInit(useMyContext)
  return <MyContext.Provider value={value}>{children}</MyContext.Provider>
}

function useInit() {
  let cached = null
  return function (value) {
    if (value) {
      cached = value
    }
    if (cached) {
      return cached()
    }
  }
}

const useHello = useInit()

function InnerComponent(props) {
  const hello = useHello()
  return <div>{hello}</div>
}
``
function App() {
  return (
    <div>
      <BuildContext value="hello!" defaultValue="default!!" useInit={useHello}>
        <InnerComponent />
      </BuildContext>
      <BuildContext value="goodbye!" defaultValue="default!!" useInit={useHello}>
        <InnerComponent />
      </BuildContext>
      <InnerComponent />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

/*
prints
hello!
default!!
* */
