/* eslint-disable @typescript-eslint/no-unused-vars,no-debugger,@typescript-eslint/no-use-before-define */
import './App.global.css';
import React from 'react';
import { render } from 'react-dom';
import { Provider, connect as rrconnect } from 'react-redux';
import { createStore } from 'redux';
import kb from 'keyboardjs';
import cloneDeep from 'clone-deep';
import om from 'object-merge';
import { Autocomplete } from '@material-ui/lab';

const fs = require('fs');

let id = 0;
function getId() {
  return id++;
}
function getInitialState() {
  const rootId = getId();
  const cursorId = getId();
  const rootEl = {
    id: rootId,
    type: 'root',
    children: [cursorId],
  };

  const cursorEl = {
    id: cursorId,
    type: 'cursor',
    children: [],
  };
  return {
    focused: [0],
    nodes: [rootEl, cursorEl],
  };
}

function handleAction(state, action) {
  const { type, payload } = action;
  const newState = cloneDeep(state);
  const targetEl = newState.nodes[state.focused[0]];

  if (type === 'add') {
    const {key, id} = payload;
    newState.nodes.push({
      id,
      type: key,
      children: [],
    });
    targetEl.children.splice(-1, 0, id)
    return newState;
  } else if (type==="move.cursor") {

  }
  return state;
}
const store = createStore(handleAction, getInitialState());
const { getState, dispatch } = store;

function send(type, payload) {
  dispatch({ type, payload });
}

kb.bind('`', (e) => {
  send('menu', getId());

});
const letters = "abcdefghijklmnopqrstuvwxyz";
kb.bind(Array.from(letters), (e) => {
  //console.log(e)
  const {key}=e;
  const id = getId();
  send('add', {key, id});
});
kb.bind("space", (e) => {
  const id = getId();
  send('add', {key: " ", id})
})
kb.bind("left", (e) => {
  send("move.cursor", -1)
})
kb.bind("right", (e) => {
  send("move.cursor", 1)
})
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
    const { index } = this.props;
    const state = getState();

    const item = state.nodes[index];
    function mapChild(child) {
      //console.log('mapChild', child);
      return <X key={child} index={child} />;
    }

    const children = item.children.map(mapChild);
    if (item.type === 'cursor') {
      return <El>█</El>;
    }

    if (item.type === 'root') {
      return (
        <El w100 h100 dashedBorder key={index}>
          <El>{item.type}</El>
          <El dashedBorder>{children}</El>
        </El>
      );
    }
    return (
      <El key={index}>
        <El>{item.type}</El>
        <El>{children}</El>
      </El>
    );
  }
}
function El(props) {
  const { div, button, w100, h100, dashedBorder, children, style, ...rest } = props;
  const elType = (button && 'button') || 'div';
  const display = 'inline-block';
  const moreStyle = {
    ...s('width', '100%', w100),
    ...s('height', '100%', h100),
    ...s('display', display, true),
    ...s('border', '1px dashed yellow', dashedBorder),
  };
  const newProps = {
    ...rest,
    ...{ style: om(style, moreStyle)},
  }
  // console.log("createElement",{
  //   elType,
  //   newProps,
  //   children,
  // })
  return React.createElement(elType, newProps, children);
}
function s(name, value, enabled = false) {
  return (enabled && { [name]: value }) || {};
}

function App() {
  return <X key={0} index={0} />;
}
function connect(component) {
  return rrconnect((state) => state, {})(component);
}
const ConnectedApp = connect(App);
render(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>,
  document.getElementById('root')
);

function Save() {
  try {
    fs.writeFileSync('myfile.txt', 'the text to write in the file', 'utf-8');
  } catch (e) {
    alert('Failed to save the file !');
  }
}
