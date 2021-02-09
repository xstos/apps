/* eslint-disable @typescript-eslint/no-unused-vars,no-debugger */
import React from 'react';
import { render } from 'react-dom';
import { Provider, connect as rrconnect } from 'react-redux';
import { createStore } from 'redux';

import './App.global.css';
import kb from 'keyboardjs';
import { Autocomplete } from '@material-ui/lab';

const fs = require('fs');

function getInitialState() {
  return {
    root: {
      name: 'root',
      children: [],
    },
  };
}

function handleAction(state, action) {
  const { type, payload } = action;
  if (type === 'add') {
    return {
      root: {
        name: 'root',
        children: [...state.root.children, { name: payload, children: [] }],
      },
    };
  }
  return state;
}
const store = createStore(handleAction, getInitialState());
const { getState, dispatch } = store;
const connect = (component) => rrconnect((state) => state, {})(component);
function send(type, payload) {
  dispatch({type, payload})
}
function Save() {
  try {
    fs.writeFileSync('myfile.txt', 'the text to write in the file', 'utf-8');
  } catch (e) {
    alert('Failed to save the file !');
  }
}
let id = 0;
kb.bind('`', (e) => {
  send('add', id++);
});

class X extends React.Component {
  constructor(props: any) {
    super(props);
  }

  componentDidMount() {
    // console.log("mount ", this.__id, this.props)
  }

  componentWillUnmount() {
    // callbacks.delete(this);
  }

  render() {
    if (this.props.c.children.length) {
      return this.props.c.children.map((child) => (
        <div children={child.name} />
      ));
    }

    return <div>{this.props.c.name}</div>;
  }
}

function App(state) {
  console.log(state);
  return <X c={state.root} />;
}
const ConnectedApp = connect(App);
render(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>,
  document.getElementById('root')
);
