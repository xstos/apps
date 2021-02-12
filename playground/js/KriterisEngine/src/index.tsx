/* eslint-disable @typescript-eslint/no-unused-vars,no-debugger,@typescript-eslint/no-use-before-define */
import './App.global.css';
import React from 'react';
import { render } from 'react-dom';
import { connect as rrconnect, Provider } from 'react-redux';
import { createStore } from 'redux';
import kb from 'keyboardjs';
import cloneDeep from 'clone-deep';
import om from 'object-merge';

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
    cursorId,
    rootId,
    focus: rootId,
    nodes: [rootEl, cursorEl],
  };
}

function handleAction(state, action) {
  const { type, payload } = action;
  const newState = cloneDeep(state);
  const focusIndex = state.focus;
  let nodes = newState.nodes;
  const focusedNode = nodes[focusIndex];
  let children = focusedNode.children;
  const mapped = children.map((ix: number) => nodes[ix]);
  const cursorIndex = mapped.findIndex((node) => node.type === 'cursor');
  const cursorId = mapped[cursorIndex].id;
  if (type === 'key') {
    const { key, id } = payload;
    nodes.push({
      id,
      type: 'key',
      key,
    });

    const pre = children.slice(0, cursorIndex);
    const post = children.slice(cursorIndex + 1);

    focusedNode.children = pre.concat([id, cursorId], post);
  } else if (type === 'cursor.move') {
    if (payload === -1 && cursorIndex > 0) {
      children[cursorIndex] = children[cursorIndex - 1];
      children[cursorIndex - 1] = cursorId;
    } else if (payload === 1 && cursorIndex < children.length - 1) {
      children[cursorIndex] = children[cursorIndex + 1];
      children[cursorIndex + 1] = cursorId;
    }
  } else if (type === 'cursor.delete') {
    const { key } = payload;
    if (key==="Backspace" && cursorIndex>0) {
      children.splice(cursorIndex-1, 1);
    } else if (key==="Delete" && cursorIndex<children.length) {
      children.splice(cursorIndex+1, 1);
    }
  }
  return newState;
}
const store = createStore(handleAction, getInitialState());
const { getState, dispatch } = store;

function send(type, payload) {
  dispatch({ type, payload });
}

kb.bind('`', (e) => {
  send('menu', getId());
});
const letters = 'abcdefghijklmnopqrstuvwxyz\'';
const lettersArray = Array.from(letters);
kb.bind([...lettersArray, 'space', 'enter'], (e) => {
  const { key } = e;
  const id = getId();
  send('key', { key, id });
});
kb.bind(['left', 'right'], (e) => {
  const { key } = e;
  send('cursor.move', key === 'ArrowLeft' ? -1 : 1);
});
kb.bind(['delete', 'backspace'], (e) => {
  const { key } = e;
  send('cursor.delete', { key });
});

class X extends React.Component {
  constructor(props: any) {
    super(props);
  }

  componentDidMount() {     /* console.log("mount ", this.__id, this.props)*/   }
  componentWillUnmount() {     /* callbacks.delete(this); */  }

  render() {
    const { index } = this.props;
    const state = getState();

    const item = state.nodes[index];
    function mapChild(child) {
      // console.log('mapChild', child);
      return <X key={child} index={child} />;
    }

    const children = (item.children || []).map(mapChild);
    if (item.type === 'cursor') {
      return <El>█</El>;
    }
    if (item.type === 'key') {
      const { key } = item;
      if (key === 'Enter') {
        return <br />;
      }
      if (key === ' ') {
        return '\u2000';
      }
      return key;
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
  const {
    div,
    button,
    w100,
    h100,
    dashedBorder,
    children,
    style,
    ...rest
  } = props;
  const elType = (button && 'button') || 'div';
  const display = 'inline-block';
  const moreStyle = {
    ...s('width', '100%', w100),
    ...s('height', '100%', h100),
    ...s('display', display, true),
    ...s('border', '1px dashed yellow', dashedBorder),
    // ...s('verticalAlign', 'top', true),
  };
  const newProps = {
    ...rest,
    ...{ style: om(style, moreStyle) },
  };
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

const ConnectedApp = rrconnect((state) => state, {})(App);
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
