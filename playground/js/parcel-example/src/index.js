import React from 'react'
import ReactDOM from 'react-dom'
import {connect as rrconnect, Provider} from 'react-redux'
import {createStore} from "redux"
import {composeWithDevTools} from 'redux-devtools-extension';

const store = createStore(Reducer, getInitialState(),composeWithDevTools())
const {dispatch} = store; //destructuring assignment syntax https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment

function getInitialState() { //our initial redux state store
    return {
        number: 0,
    };
}

function Reducer(state, action) { //pure function that takes the current state, an action, and returns a new state
    const {type, value} = action;
    if (type === "increment") {
        return {...state, number: value + 1} //object spread syntax https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    }
    return state;
}

function App(props) { //react JSX component that renders our state and dispatches actions
    const {number} = props; //in this case "props" is our state

    function onClick() {
        return dispatch({type: "increment", value: number});
    }

    return (
      <div>
        <button onClick={onClick}>You've clicked me: {number} times</button>
      </div>
    )
}

//when rendering a component this function is called first to extract "props" from our state (separation of concerns/decoupling)
//in this example we don't care, so we pass it on to the "App" function as-is
function mapStateToProps(state) {
    return state;
}

//connect component to react-redux and render our app inside the 'root' div element
const ConnectedApp = rrconnect(mapStateToProps, {})(App);
ReactDOM.render(
  <Provider store={store}>
      <ConnectedApp/>
  </Provider>,
  document.getElementById('root')
)
