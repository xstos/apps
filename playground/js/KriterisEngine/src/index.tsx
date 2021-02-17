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
// import {
//   diff,
//   addedDiff,
//   deletedDiff,
//   updatedDiff,
//   detailedDiff,
// } from 'deep-object-diff';
// import { stringify } from 'javascript-stringify';
import { Load } from './util';

Load();
const fs = require('fs');

let _id: TNodeId = 0;
function getId(): TNodeId {
  return _id++;
}

type TNodeType = 'root' | 'cursor' | 'cell' | 'key' | 'menu';
type TNodeId = number;
type TNode = {
  id: TNodeId;
  parentId: TNodeId;
  type: TNodeType;
  children: TNodeId[];
  key?: string;
};
type TState = {
  cursorId: TNodeId;
  rootId: TNodeId;
  nodes: TNode[];
  focus: TNodeId;
};

function getInitialState(): TState {
  const rootId: TNodeId = getId();
  const cursorId = getId();
  const rootEl = {
    id: rootId,
    parentId: rootId,
    type: 'root' as const,
    children: [cursorId],
  };
  const cursorEl = {
    id: cursorId,
    parentId: -1,
    type: 'cursor' as const,
    children: [],
  };
  return {
    cursorId,
    rootId,
    nodes: [rootEl, cursorEl],
    focus: rootId,
  };
}
function isContainer(node: TNode): boolean {
  return node.type === 'cell';
}
// <state+action=>new state>
function Reducer(oldState: TState, action) {
  const { type, payload } = action;
  const state: TState = cloneDeep(oldState);
  const focusId = state.focus;
  const { nodes, rootId, cursorId } = state;
  const focusedNode = nodes[focusId];
  const { children } = focusedNode;
  const mapped = children.map((id: TNodeId) => nodes[id]);
  const cursorIndex = children.findIndex2(cursorId);
  console.log('children', children);
  function removeCursor() {
    children.splice(cursorIndex, 1); // remove cursor from current node
  }

  const commands = {
    cellAdd() {
      const id = getId();
      nodes.push({
        id,
        parentId: focusedNode.id,
        type: 'cell' as const,
        children: [cursorId],
      });
      focusedNode.children.splice(cursorIndex, 1, id);
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
        children: [],
        id,
        parentId: focusId,
        type: 'key' as const,
        key,
      });
      focusedNode.children.splice(cursorIndex, 0, id);
    },
    menu() {
      const { id } = payload;
      nodes.push({
        children: [],
        parentId: focusId,
        id,
        type: 'menu',
      });
      focusedNode.children.splice(cursorIndex, 0, id);
    },
    cursorMove() {
      const { key } = payload;
      function navUp(callback) {
        const focusedId = focusedNode.id;
        const { parentId } = focusedNode;
        const parentNode = nodes[parentId];
        const parentIndex = parentNode.children.findIndex2(focusedId);
        removeCursor();
        state.focus = parentId;
        callback(parentNode, parentIndex);
      }
      function navTo(nodeIndex: number, push: boolean) {
        const node = mapped[nodeIndex];
        if (isContainer(node)) {
          removeCursor();
          if (push) {
            node.children.push(cursorId);
          } else {
            node.children.splice(0, 0, cursorId);
          }
          state.focus = node.id;
        } else {
          children[cursorIndex] = children[nodeIndex];
          children[nodeIndex] = cursorId;
        }
      }
      if (key === 'ArrowLeft') {
        if (cursorIndex === 0) {
          if (state.focus === rootId) return; // can't go up past root
          navUp((parentNode: TNode, parentIndex: number) => {
            parentNode.children.splice(parentIndex, 0, cursorId);
          });
        } else {
          navTo(cursorIndex - 1, true);
        }
      } else if (key === 'ArrowRight') {
        if (cursorIndex === children.length - 1) {
          if (state.focus === rootId) return;
          navUp((parentNode, parentIndex) => {
            parentNode.children.splice(parentIndex + 1, 0, cursorId);
          });
        } else {
          navTo(cursorIndex + 1, false);
        }
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
    const state: TState = getState();

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
      <El dashedBorder key={index}>
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
    ...s('margin', '2px', true),
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
