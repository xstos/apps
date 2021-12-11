import * as React from 'react'
import ReactDOM from 'react-dom'
import { store, view } from '@risingstack/react-easy-state';
import {createApi} from "./api";
import {TAction, TState} from "./types";

const html = document.documentElement.style
const body = document.body.style
const root = document.getElementById('root').style
const zero = "0px"
html.margin=zero
html.padding=zero
body.margin=zero
body.padding=zero
html.width=body.width="100vw"
html.minHeight=body.minHeight="100vh"
root.width="100%"
root.margin=zero
root.padding=zero
//root.
const state2 = store({
    db: {
        todos: [],
        value: "",
    }
});
const state = () => state2.db
const api = createApi(dispatch)

function dispatch(action: TAction) {
    console.log("dispatch", action)
    switch (action.type) {
        case "db.get":
            if (action.success) {
                const {response}=action
                state2.db = response
            } else {
                state().error = action.value
            }
            break
        case "change":
            state().value = action.value
            saveDb(state())
            break
        case "add":
            state().todos.push(state().value)
            saveDb(state())
            break
        case "remove":
            state().todos.splice(action.index, 1)
            saveDb(state())
            break
    }

}

function App(props) { //pure react JSX component that renders our state and dispatches actions

    const dispatchAdd = () => dispatch({type: "add"})
    const dispatchChange = event => dispatch({type: "change", value: event.target.value})
    const dispatchRemove = index => dispatch({type: "remove", index})

    function MakeTodo(value: string, index: number) {
        function DeleteTodoButton() {
            return <button onClick={() => dispatchRemove(index)}>x</button>;
        }

        return <div key={index}>
            {value}
            <DeleteTodoButton/>
        </div>
    }

    const todoListStyle = {backgroundColor: "beige"};
    return (
      <div style={{padding:"0.5em"}}>
          <input onChange={dispatchChange} placeholder="enter todo" defaultValue={state().value}/>
          <button onClick={dispatchAdd}>add todo</button>
          <div style={todoListStyle}>
              {state().todos.map(MakeTodo)}
          </div>
          <div>{state().error}</div>
      </div>
    )
}
function EasyApp() {
    const RenderView = view(App)
    return <RenderView/>
}

ReactDOM.render( //render our app inside the 'root' div element
  <EasyApp/>,
  document.getElementById('root')
)

api.get("db.get", "https://localhost:8000/api/db") //load data from the server

function saveDb(state: TState) {
    console.log("saving", state)
    api.post("db.post", "https://localhost:8000/api/db", state)
}
