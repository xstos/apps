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
import fs from 'fs';
// import {
//   diff,
//   addedDiff,
//   deletedDiff,
//   updatedDiff,
//   detailedDiff,
// } from 'deep-object-diff';
// import { stringify } from 'javascript-stringify';
import { accessor, Load, renderTracker } from './util';
import { TAction, TNode, TNodeId, TState } from './types';

Load();

let _id: TNodeId = 0;
function getId(): TNodeId {
  return _id++;
}

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
  };
  return {
    cursorId,
    rootId,
    nodes: [rootEl, cursorEl],
    focus: rootId,
  };
}

// <state+action=>new state>
function Reducer(oldState: TState, action: TAction) {
  const state: TState = cloneDeep(oldState);
  const { type, payload } = action;
  const { nodes, rootId, cursorId, focus: focusId } = state;

  const focusedNode = nodes[focusId];
  let { children: focusedChildren } = focusedNode;
  focusedChildren = focusedChildren || [];
  const mapped = focusedChildren.map((id: TNodeId) => nodes[id]);
  const cursorIndex = focusedChildren.findIndex2(cursorId);
  function mirrorAdd() {
    const { id: mirrorId } = payload;
    const id = getId();
    nodes.push({
      id,
      parentId: focusedNode.id,
      type: 'mirror' as const,
      mirrorId,
    });
    focusedChildren[cursorIndex] = mirrorId;
    state.focus = id;
  }
  function cellAdd() {
    const id = getId();
    nodes.push({
      id,
      parentId: focusedNode.id,
      type: 'cell' as const,
      children: [cursorId],
    });
    focusedChildren[cursorIndex] = id;
    state.focus = id;
  }
  function menuClose() {
    const { key, value } = payload;
    const { title, command } = value;
    cursorDeleteKey('Backspace');
    setTimeout(() => {
      if (key !== 'Escape') {
        dispatch(...command);
      }

      keyboard.setContext('editing');
    }, 0);
  }
  function key() {
    const { key, id } = payload;
    nodes.push({
      children: [],
      id,
      parentId: focusId,
      type: 'key' as const,
      key,
    });
    focusedNode.children.splice(cursorIndex, 0, id);
  }
  function menu() {
    const { id } = payload;
    nodes.push({
      children: [],
      parentId: focusId,
      id,
      type: 'menu',
    });
    focusedNode.children.splice(cursorIndex, 0, id);
  }
  function cursorMove() {
    const { key } = payload;
    function removeCursor() {
      focusedChildren.splice(cursorIndex, 1); // remove cursor from current node
    }
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
      if (node.type === 'cell') {
        removeCursor();
        if (push) {
          node.children.push(cursorId);
        } else {
          node.children.splice(0, 0, cursorId);
        }
        state.focus = node.id;
      } else {
        focusedChildren[cursorIndex] = focusedChildren[nodeIndex];
        focusedChildren[nodeIndex] = cursorId;
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
      if (cursorIndex === focusedChildren.length - 1) {
        if (state.focus === rootId) return;
        navUp((parentNode, parentIndex) => {
          parentNode.children.splice(parentIndex + 1, 0, cursorId);
        });
      } else {
        navTo(cursorIndex + 1, false);
      }
    }
  }
  function cursorDeleteKey(key) {
    if (key === 'Backspace' && cursorIndex > 0) {
      focusedChildren.splice(cursorIndex - 1, 1);
    } else if (key === 'Delete' && cursorIndex < focusedChildren.length) {
      focusedChildren.splice(cursorIndex + 1, 1);
    }
  }
  function cursorDelete() {
    const { key } = payload;
    cursorDeleteKey(key);
  }
  const commands = {
    cellAdd,
    menuClose,
    key,
    menu,
    cursorMove,
    cursorDelete,
    mirrorAdd,
  };
  function dispatchInner(type) {
    const command = commands[type];
    command && command();
  }
  dispatchInner(type);
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

function keyboardBindings() {
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
}
keyboardBindings();
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
    const { index, cycle } = this.props;
    const firstTime = accessor(this, 'firstTime');
    const state: TState = getState();

    const item2 = state.nodes[index];
    // const { type, mirrorId } = item;
    // const children = (item.children || []).map((child) => (
    //   <X key={child} index={child} cycle={cycle} />
    // ));
    function rendercursor() {
      return <El>█</El>;
    }
    function renderkey({ index }) {
      const item = state.nodes[index];
      const { key } = item;
      if (key === 'Enter') {
        return (
          <>
            <span>↲</span>
            <br />
          </>
        );
      }
      if (key === ' ') {
        return '\u2000';
      }
      return key;
    }
    function renderroot({ index }) {
      const item = state.nodes[index];
      const children = (item.children || []).map((child) => (
        <X key={child} index={child} cycle={cycle} />
      ));
      return (
        <El w100 h100 key={index}>
          {children}
        </El>
      );
    }
    function rendercell({ index }) {
      const item = state.nodes[index];
      const { type } = item;
      const children = (item.children || []).map((child) => (
        <X key={child} index={child} cycle={cycle} />
      ));
      return (
        <El dashedBorder key={index}>
          <El>{`${type} ${index}`}</El>
          <br />
          <El>{children}</El>
        </El>
      );
    }
    function rendermirror({ index }) {

      if (cycle.has(index)) {
        return <span>cycle detected</span>;
      }
      const item = state.nodes[index];
      const { mirrorId } = item;

      cycle.set(mirrorId);

      return rendercell({ index: mirrorId });
    }
    function rendermenu() {
      const mirrorList = state.nodes
        .filter((node: TNode): boolean => node.type === 'cell')
        .map((node: TNode) => ({
          title: `cell ${node.id}`,
          command: ['mirrorAdd', { id: node.id }],
        }));
      const demoMenu = [
        { title: 'add cell', command: ['cellAdd'] },
        { title: 'aaa ccc', command: ['cellAdd'] },
        { title: 'eee fff', command: ['cellAdd'] },
        { title: 'ggg hhh', command: ['cellAdd'] },
        ...mirrorList,
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
                if (firstTime.get() && input) {
                  firstTime.set(false);
                  setTimeout(() => input.focus(), 0);
                }
              }}
            />
          )}
        />
      );
    }
    const renderMap = {
      rendercursor,
      renderkey,
      renderroot,
      rendermenu,
      rendermirror,
    };
    const renderfunc = renderMap[`render${item2.type}`];
    const args = { index };
    return (renderfunc && renderfunc(args)) || rendercell(args);
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
  return <X key={0} index={0} cycle={renderTracker()} />;
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
