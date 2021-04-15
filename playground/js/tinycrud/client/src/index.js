import React from 'react'
import ReactDOM from 'react-dom'
import {connect as rrconnect, Provider} from 'react-redux'
import {createStore} from "redux"
import {composeWithDevTools} from 'redux-devtools-extension';
import {createApi} from "./api";

function getInitialState() { //our initial redux state store
    return {
        todos: [],
        value: "",
    };
}

const store = createStore(Reducer, getInitialState(),composeWithDevTools())
const api = createApi(dispatch)

function dispatch(msg) {
    console.log("dispatch", msg)
    store.dispatch(msg)
    switch (msg.type) {
        case "change":
        case "add":
        case "remove":
            saveDb(store.getState())
    }
}

function Reducer(state, action) { //pure function that takes the current state, an action, and returns a new state
    const {type, success, response, error, value, index} = action //destructuring assignment syntax https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

    if (type === "db.get") { //get state from backend
        if (success) return response
        return {...state, error} //object spread syntax https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    } else if (type === "change") { //input textbox changed
        return {...state, value}
    } else if (type === "add") {
        return {
            ...state,
            todos: [...state.todos, state.value], //append task
        }
    } else if (type === "remove") {
        const todos = [...state.todos] //clone todos
        todos.splice(index, 1) //remove task
        return {
            ...state,
            todos,
        }
    }

    return state;
}

function App(state) { //pure react JSX component that renders our state and dispatches actions
    const onAdd = () => dispatch({type: "add"});
    const onChange = event => dispatch({type: "change", value: event.target.value});
    const onRemove = index => dispatch({type: "remove", index});
    return (
      <div>
          <input onChange={onChange} placeholder="enter task" defaultValue={state.value}/>
          <button onClick={onAdd}>add task</button>
          <div style={{backgroundColor: "beige"}}>
              {state.todos.map((value, i) => {
                  return <div key={i}>{value} <button onClick={() => onRemove(i)}>x</button></div>
              })}
          </div>
          <div>{state.error}</div>
      </div>
    )
}

const ConnectedApp = rrconnect(state => state, {})(App) //connect component to react-redux

ReactDOM.render( //render our app inside the 'root' div element
  <Provider store={store}>
      <ConnectedApp/>
  </Provider>,
  document.getElementById('root')
)

api.get("db.get", "https://localhost:8000/api/db") //load data from the server

function saveDb(state) {
    console.log("saving", state)
    api.post("db.post", "https://localhost:8000/api/db", state)
}
