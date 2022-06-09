import './index.css';
import {store as createStore, watch} from 'hyperactiv/src/react'
import * as ReactDOM from "react-dom";

const state = createStore([[{id:0}],[]])
const Render = watch(()=>{
  return state.map(arr=>{
    return arr.map(c=><div>{JSON.stringify(c)}</div> )
  })
})

ReactDOM.render(<Render/>,document.getElementById('root'))