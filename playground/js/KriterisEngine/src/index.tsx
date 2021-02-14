/* eslint-disable @typescript-eslint/no-unused-vars,no-debugger,@typescript-eslint/no-use-before-define */
import './App.global.css';
import React from 'react';
import { render } from 'react-dom';
import { connect as rrconnect, Provider } from 'react-redux';
import { createStore } from 'redux';
import keyboard from 'keyboardjs';
import cloneDeep from 'clone-deep';
import om from 'object-merge';
import { Autocomplete } from '@material-ui/lab';
import TextField from '@material-ui/core/TextField';
import {
  diff,
  addedDiff,
  deletedDiff,
  updatedDiff,
  detailedDiff,
} from 'deep-object-diff';
import { stringify } from 'javascript-stringify';
import { Load } from './util';

Load();
const fs = require('fs');

let _id = 0;
function getId() {
  return _id++;
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

// <state+action=>new state>
function Reducer(oldState, action) {
  const { type, payload } = action;
  const state = cloneDeep(oldState);
  const focusIndex = state.focus;
  const { nodes } = state;
  const focusedNode = nodes[focusIndex];
  const { children } = focusedNode;
  const mapped = children.map((id: number) => nodes[id]);
  const cursorIndex = mapped.findIndex((node) => node.type === 'cursor');
  const cursorId = mapped[cursorIndex].id;

  function insertAtCursor(id, atIndex: any = cursorIndex) {
    focusedNode.children = children.insertArray(atIndex, id, cursorId);
  }
  const commands = {
    cellAdd() {
      const id = getId();
      nodes.push({
        id,
        parentId: focusedNode.id,
        type: 'cell',
        children: [cursorId],
      });
      console.log(children);
      focusedNode.children = children.insertArray(cursorIndex, id);
      state.focus = id;
    },
    menuClose() {
      const { key, value } = payload;
      const { title, command } = value;
      const letters = Array.from(title);
      setTimeout(() => {
        dispatch('cursorDelete', { key: 'Backspace' });
        if (key !== 'Escape') {
          dispatch(...command);
          // letters.map((key) => {
          //   dispatch('key', { key, id: getId() });
          // });
        }

        keyboard.setContext('editing');
      }, 0);
    },
    key() {
      const { key, id } = payload;
      nodes.push({
        id,
        type: 'key',
        key,
      });
      insertAtCursor(id);
    },
    menu() {
      const { id } = payload;
      nodes.push({
        id,
        type: 'menu',
      });
      insertAtCursor(id);
    },
    cursorMove() {
      const { key } = payload;

      if (key === 'ArrowLeft' && cursorIndex > 0) {
        children[cursorIndex] = children[cursorIndex - 1];
        children[cursorIndex - 1] = cursorId;
      } else if (key === 'ArrowRight' && cursorIndex < children.length - 1) {
        children[cursorIndex] = children[cursorIndex + 1];
        children[cursorIndex + 1] = cursorId;
      } else if (
        key === 'ArrowLeft' &&
        cursorIndex === 0 &&
        state.focus !== state.rootId
      ) {

      }
    },
    cursorDelete() {
      const { key } = payload;
      if (key === 'Backspace' && cursorIndex > 0) {
        children.splice(cursorIndex - 1, 1);
      } else if (key === 'Delete' && cursorIndex < children.length) {
        children.splice(cursorIndex + 1, 1);
      }
    },
  };
  const command = commands[type];
  command && command();
  // const mydiff = detailedDiff(oldState, state);
  // console.log(stringify(mydiff, null, 2));
  return state;
}
// </state+action=>new state>

// <redux init>
const store = createStore(Reducer, getInitialState());
const { getState } = store;
function dispatch(type, payload) {
  const msg = { type, payload };
  console.log('dispatch', msg);
  store.dispatch(msg);
}
// </redux init>

// <keyboard bindings>
keyboard.setContext('intellisense');
keyboard.bind('`', (e) => {
  keyboard.setContext('editing');
  dispatch('menuClose', {
    key: 'Escape',
    value: { title: '', command: [''] },
  });
});

keyboard.setContext('editing');
keyboard.bind('`', (e) => {
  keyboard.setContext('intellisense');
  dispatch('menu', { id: getId() });
});
const lettersArray = Array.from('abcdefghijklmnopqrstuvwxyz0123456789.,');
keyboard.bind([...lettersArray, 'space', 'enter'], (e) => {
  const { key } = e;
  const id = getId();
  dispatch('key', { key, id });
});
keyboard.bind(['left', 'right'], (e) => {
  const { key } = e;
  dispatch('cursorMove', { key });
});
keyboard.bind(['delete', 'backspace'], (e) => {
  const { key } = e;
  dispatch('cursorDelete', { key });
});
// <keyboard bindings/>

// <renderer>
class X extends React.Component {
  constructor(props: any) {
    super(props);
  }

  componentDidMount() {
    this.firstTime = true;
  }

  componentWillUnmount() {
    /* callbacks.delete(this); */
  }

  render() {
    const { index } = this.props;
    const state = getState();

    const item = state.nodes[index];
    const { type } = item;
    const children = (item.children || []).map((child) => (
      <X key={child} index={child} />
    ));

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
          {children}
        </El>
      );
    }
    // if (type === 'cell') {
    //   return <El>{"cell!"}</El>;
    // }
    if (type === 'menu') {
      const demoMenu = [
        { title: 'add cell', command: ['cellAdd'] },
        { title: 'aaa ccc', command: ['cellAdd'] },
        { title: 'eee fff', command: ['cellAdd'] },
        { title: 'ggg hhh', command: ['cellAdd'] },
      ];
      let selectedValue = { title: '', year: 0 };
      return (
        <Autocomplete
          id="combo-box-demo"
          autoHighlight
          openOnFocus
          options={demoMenu}
          getOptionLabel={(option) => option.title}
          getOptionSelected={(option, value) => value}
          style={{ width: 300 }}
          ref={(input) => input && (input.style.display = 'inline-block')}
          onChange={(_, value) => (selectedValue = value)}
          onClose={(e, value) => {
            const { nativeEvent } = e;
            const { key } = nativeEvent;
            dispatch('menuClose', { key, value: selectedValue });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Actions"
              variant="outlined"
              inputRef={(input) => {
                if (this.firstTime && input) {
                  this.firstTime = false;
                  setTimeout(() => input.focus(), 0);
                }
              }}
            />
          )}
        />
      );
    }
    return (
      <El key={index}>
        <El>{type}</El>
        <El>{children}</El>
      </El>
    );
  }
}
// </renderer>

// <element factory>
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
  function s(name, value, enabled = false) {
    return (enabled && { [name]: value }) || {};
  }
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
// </element factory>

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
