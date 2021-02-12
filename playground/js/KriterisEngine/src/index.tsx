/* eslint-disable @typescript-eslint/no-unused-vars,no-debugger,@typescript-eslint/no-use-before-define */
import './App.global.css';
import React from 'react';
import { render } from 'react-dom';
import { connect as rrconnect, Provider } from 'react-redux';
import { createStore } from 'redux';
import kb from 'keyboardjs';
import cloneDeep from 'clone-deep';
import om from 'object-merge';
import { Autocomplete } from '@material-ui/lab';
import TextField from '@material-ui/core/TextField';

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

  function insertAtCursor(id) {
    const pre = children.slice(0, cursorIndex);
    const post = children.slice(cursorIndex + 1);

    focusedNode.children = pre.concat([id, cursorId], post);
  }
  if (type === "menu.change") {
    newState.menu = payload.title;
  } else if (type === "menu.close") {
    const letters = Array.from(newState.menu);
    setTimeout(()=>{
      send('cursor.delete', { key: "Backspace" });
      letters.map(key=>{
        send("key", { key, id: getId()})
      });
      kb.setContext('editing')
    },0);
    newState.menu = ""
  } else if (type === 'key') {
    const { key, id } = payload;
    nodes.push({
      id,
      type: 'key',
      key,
    });

    insertAtCursor(id);
  } else if (type === 'menu') {
    const id = payload;
    nodes.push({
      id,
      type: 'menu',
    });
    insertAtCursor(id)
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


kb.setContext('editing');
kb.bind('`', (e) => {
  kb.setContext('intellisense')
  send('menu', getId());
});
const lettersArray = Array.from('abcdefghijklmnopqrstuvwxyz0123456789.,');
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

  componentDidMount() {
    this.firstTime=true;
  }
  componentWillUnmount() {     /* callbacks.delete(this); */  }

  render() {
    const { index } = this.props;
    const state = getState();

    const item = state.nodes[index];
    const {type} = item;
    const children = (item.children || [])
      .map(child => <X key={child} index={child} />);

    if (type === 'cursor') {
      return <El>█</El>;
    }
    if (type === 'key') {
      const { key } = item;
      if (key === 'Enter') {
        return <br />;
      }
      if (key === ' ') {
        return '\u2000';
      }
      return key;
    }
    if (type === 'root') {
      return (
        <El w100 h100 dashedBorder key={index}>
          <El>{type}</El>
          <El dashedBorder>{children}</El>
        </El>
      );
    }

    if (type === 'menu') {
      const demoMenu = [
        { title: 'foo', year: 1994 },
        { title: 'bar', year: 1972 },
        { title: 'derp', year: 1974 },
        { title: 'skerp', year: 2008 },
      ];

      return <Autocomplete
        id="combo-box-demo"
        autoHighlight
        openOnFocus
        options={demoMenu}
        getOptionLabel={(option) => option.title}
        style={{ width: 300 }}
        ref={input => {
          input && (input.style.display = "inline-block");
        }}
        onChange={(e, value)=> {
          send("menu.change", value)
          console.log(e, value)
        }        }
        onClose={(e)=> {
          send("menu.close", null)
        }}
        renderInput={(params) =>
          <TextField
            inputRef={input => {
              if (this.firstTime && input) {
                this.firstTime = false;
                setTimeout(() => input.focus(), 0);
              }
            }}

            {...params} label="Actions" variant="outlined"
          />}
      />
    }
    return (
      <El key={index}>
        <El>{type}</El>
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
