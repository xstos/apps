import * as React from 'react'
import ReactDOM from 'react-dom'
import {connect as rrconnect, Provider} from 'react-redux'
import {createStore, Store} from "redux"
import {composeWithDevTools} from 'redux-devtools-extension';
import {createApi} from "./api";
import {getInitialState, TAction, TState} from "./types";

const store: Store<TState, TAction> = createStore(Reducer, getInitialState(),composeWithDevTools())
const api = createApi(dispatch)

function dispatch(msg: TAction) {
    console.log("dispatch", msg)
    store.dispatch(msg)
    switch (msg.type) {
        case "change":
        case "add":
        case "remove":
            saveDb(store.getState())
    }
}

function Reducer(state: TState, action: TAction): TState { //pure function that takes the current state, an action, and returns a new state
    switch (action.type) {
        case "db.get": //got state from backend
            if (action.success) return action.response
            return {...state, error: action.error} //object spread syntax https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
        case "change": //input textbox changed
            return {...state, value: action.value}
        case "add":
            return {
                ...state,
                todos: [...state.todos, state.value], //append task
            }
        case "remove":
            const todos = [...state.todos] //clone todos
            todos.splice(action.index, 1) //remove task
            return {
                ...state,
                todos,
            }
    }

    return state;
}

function App(state: TState) { //pure react JSX component that renders our state and dispatches actions
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
      <div>
          <input onChange={dispatchChange} placeholder="enter todo" defaultValue={state.value}/>
          <button onClick={dispatchAdd}>add todo</button>
          <div style={todoListStyle}>
              {state.todos.map(MakeTodo)}
          </div>
          <div>{state.error}</div>
      </div>
    )


}

const ConnectedApp = rrconnect((state:TState):TState => state, {})(App) //connect component to react-redux

ReactDOM.render( //render our app inside the 'root' div element
  <Provider store={store}>
      <ConnectedApp/>
  </Provider>,
  document.getElementById('root')
)

api.get("db.get", "https://localhost:8000/api/db") //load data from the server

function saveDb(state: TState) {
    console.log("saving", state)
    api.post("db.post", "https://localhost:8000/api/db", state)
}
