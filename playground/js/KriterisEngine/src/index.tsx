import './App.global.css'
import React from 'react'
import { render } from 'react-dom'
import { connect as rrconnect, Provider } from 'react-redux'
import { createStore } from 'redux'
import keyboard from 'keyboardjs'
import cloneDeep from 'clone-deep'
import om from 'object-merge'
import { Autocomplete } from '@material-ui/lab'
import TextField from '@material-ui/core/TextField'
import fs from 'fs'
// import {
//   diff,
//   addedDiff,
//   deletedDiff,
//   updatedDiff,
//   detailedDiff,
// } from 'deep-object-diff';
// import { stringify } from 'javascript-stringify';
import { accessor, idGen, Load, renderTracker } from './util'
import { TAction, TNode, TNodeId, TState } from './types'

Load()

const getId = idGen()

function getInitialState(): TState {
  const rootId: TNodeId = getId()
  const cursorId = getId()
  const rootEl = {
    id: rootId,
    parentId: rootId,
    type: 'cell' as const,
    children: [cursorId],
  }
  const cursorEl = {
    id: cursorId,
    parentId: -1,
    type: 'cursor' as const,
  }
  return {
    cursorId,
    rootId,
    nodes: [rootEl, cursorEl],
    focus: rootId,
  }
}
function isRoot(node: TNode) {
  return node.parentId === node.id
}
// <state+action=>new state>
function Reducer(oldState: TState, action: TAction) {
  const state: TState = cloneDeep(oldState)
  const { type, payload } = action
  const { nodes, rootId, cursorId, focus: focusId } = state

  const focusedNode = nodes[focusId]
  let { children: focusedChildren } = focusedNode
  focusedChildren = focusedChildren || []
  const mapped = focusedChildren.map((id: TNodeId) => nodes[id])
  const cursorIndex = focusedChildren.findIndex2(cursorId)
  function setFocus(id: TNodeId) {
    state.focus = id
  }
  function pushChild(node: TNode, id: TNodeId) {
    node.children.push(id)
  }
  function enqueueChild(node: TNode, id: TNodeId) {
    node.children.splice(0, 0, id)
  }
  function insertChildren(node: TNode, index: number, ...items: TNodeId[]) {
    node.children.splice(index, 0, ...items)
  }
  function getChild(node: TNode, index: number) {
    return node.children[index]
  }
  function setChild(node: TNode, index: number, id: TNodeId) {
    const old = getChild(node, index)
    node.children[index] = id
    return old
  }
  function swapChild(node: TNode, index1: number, index2: number) {
    const childAtIndex = getChild(focusedNode, index1)
    const replaced = setChild(focusedNode, index2, childAtIndex)
    setChild(focusedNode, index1, replaced)
  }
  function getNumChildren(node: TNode) {
    return node.children.length
  }
  function deleteChildren(node: TNode, index: number, count: number) {
    node.children.splice(index, count)
  }
  function refAdd() {
    const { id: refId } = payload
    const id = getId()
    nodes.push({
      id,
      parentId: focusedNode.id,
      type: 'ref' as const,
      refId,
    })
    setChild(focusedNode, cursorIndex, refId)
    setFocus(id)
  }
  function cellAdd() {
    const id = getId()
    nodes.push({
      id,
      parentId: focusedNode.id,
      type: 'cell' as const,
      children: [cursorId],
    })
    setChild(focusedNode, cursorIndex, id)
    setFocus(id)
  }
  function menuClose() {
    const { key, value } = payload
    const { title, command } = value
    cursorDeleteKey('Backspace')
    setTimeout(() => {
      if (key !== 'Escape') {
        dispatch(...command)
      }

      keyboard.setContext('editing')
    }, 0)
  }
  function key() {
    const { key, id } = payload
    nodes.push({
      id,
      parentId: focusId,
      type: 'key' as const,
      key,
    })
    insertChildren(focusedNode, cursorIndex, id)
  }
  function menu() {
    const { id } = payload
    nodes.push({
      parentId: focusId,
      id,
      type: 'menu',
    })
    insertChildren(focusedNode, cursorIndex, id)
  }
  function cursorMove() {
    const { key } = payload
    function removeCursor() {
      deleteChildren(focusedNode, cursorIndex, 1)
    }
    function navUp(callback) {
      const focusedId = focusedNode.id
      const { parentId } = focusedNode
      const parentNode = nodes[parentId]
      const parentIndex = parentNode.children.findIndex2(focusedId)
      removeCursor()
      setFocus(parentId)
      callback(parentNode, parentIndex)
    }
    function navTo(nodeIndex: number, push: boolean) {
      const node = mapped[nodeIndex]
      if (node.type === 'cell') {
        removeCursor()
        if (push) {
          pushChild(node, cursorId)
        } else {
          enqueueChild(node, cursorId)
        }
        setFocus(node.id)
      } else {
        swapChild(focusedNode, nodeIndex, cursorIndex)
      }
    }
    if (key === 'ArrowLeft') {
      if (cursorIndex === 0) {
        if (isRoot(focusedNode)) return // can't go up past root
        navUp((parentNode: TNode, parentIndex: number) => {
          insertChildren(parentNode, parentIndex, cursorId)
        })
      } else {
        navTo(cursorIndex - 1, true)
      }
    } else if (key === 'ArrowRight') {
      if (cursorIndex === getNumChildren(focusedNode) - 1) {
        if (isRoot(focusedNode)) return
        navUp((parentNode: TNode, parentIndex: number) => {
          insertChildren(parentNode, parentIndex + 1, cursorId)
        })
      } else {
        navTo(cursorIndex + 1, false)
      }
    }
  }
  function cursorDeleteKey(key) {
    if (key === 'Backspace' && cursorIndex > 0) {
      deleteChildren(focusedNode, cursorIndex - 1, 1)
    } else if (key === 'Delete' && cursorIndex < getNumChildren(focusedNode)) {
      deleteChildren(focusedNode, cursorIndex + 1, 1)
    }
  }
  function cursorDelete() {
    const { key } = payload
    cursorDeleteKey(key)
  }
  const commands = {
    cellAdd,
    menuClose,
    key,
    menu,
    cursorMove,
    cursorDelete,
    refAdd,
  }
  function dispatchInner(type) {
    const command = commands[type]
    command && command()
  }
  dispatchInner(type)
  // const mydiff = detailedDiff(oldState, state);
  // console.log(stringify(mydiff, null, 2));
  return state
}
// </state+action=>new state>

// <redux init>
const store = createStore(Reducer, getInitialState())
const { getState } = store
function dispatch(type, payload) {
  const msg = { type, payload }
  console.log('dispatch', msg)
  store.dispatch(msg)
}
// </redux init>

function keyboardBindings() {
  keyboard.setContext('intellisense')
  keyboard.bind('`', (e) => {
    keyboard.setContext('editing')
    dispatch('menuClose', {
      key: 'Escape',
      value: { title: '', command: [''] },
    })
  })

  keyboard.setContext('editing')
  keyboard.bind('`', (e) => {
    keyboard.setContext('intellisense')
    dispatch('menu', { id: getId() })
  })
  const lettersArray = Array.from('abcdefghijklmnopqrstuvwxyz0123456789.,')
  keyboard.bind([...lettersArray, 'space', 'enter'], (e) => {
    const { key } = e
    const id = getId()
    dispatch('key', { key, id })
  })
  keyboard.bind(['left', 'right'], (e) => {
    const { key } = e
    dispatch('cursorMove', { key })
  })
  keyboard.bind(['delete', 'backspace'], (e) => {
    const { key } = e
    dispatch('cursorDelete', { key })
  })
}
keyboardBindings()
// <renderer>
class X extends React.Component {
  constructor(props: any) {
    super(props)
  }

  componentDidMount() {
    this.firstTime = true
  }

  componentWillUnmount() {
    /* callbacks.delete(this); */
  }

  render() {
    const { index, cycle } = this.props
    const firstTime = accessor(this, 'firstTime')
    const state: TState = getState()
    const { nodes, rootId, cursorId, focus: focusId } = state
    const item2 = nodes[index]
    // const { type, refId } = item;
    // const children = (item.children || []).map((child) => (
    //   <X key={child} index={child} cycle={cycle} />
    // ));
    function rendercursor() {
      return <El>█</El>
    }
    function renderkey({ index }) {
      const item = state.nodes[index]
      const { key } = item
      if (key === 'Enter') {
        return (
          <>
            <span>↲</span>
            <br />
          </>
        )
      }
      if (key === ' ') {
        return '\u2000'
      }
      return key
    }
    function renderroot({ index }) {
      const item = state.nodes[index]
      const children = (item.children || []).map((child) => (
        <X key={child} index={child} cycle={cycle} />
      ))
      return (
        <El w100 h100 key={index}>
          {children}
        </El>
      )
    }
    function rendercell({ index }) {
      const item = state.nodes[index]
      if (isRoot(item)) {
        return renderroot({ index })
      }
      const { type } = item
      const children = (item.children || []).map((child) => (
        <X key={child} index={child} cycle={cycle} />
      ))
      return (
        <El dashedBorder key={index}>
          <El>{`${type} ${index}`}</El>
          <br />
          <El>{children}</El>
        </El>
      )
    }
    function renderref({ index }) {
      if (cycle.has(index)) {
        return <span>cycle detected</span>
      }
      const item = state.nodes[index]
      const { refId } = item

      cycle.set(refId)

      return rendercell({ index: refId })
    }
    function rendermenu() {
      const refList = state.nodes
        .filter((node: TNode): boolean => node.type === 'cell')
        .map((node: TNode) => ({
          title: `cell ${node.id}`,
          command: ['refAdd', { id: node.id }],
        }))
      const demoMenu = [
        { title: 'add cell', command: ['cellAdd'] },
        { title: 'aaa ccc', command: ['cellAdd'] },
        { title: 'eee fff', command: ['cellAdd'] },
        { title: 'ggg hhh', command: ['cellAdd'] },
        ...refList,
      ]
      let selectedValue = { title: '', year: 0 }
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
            const { nativeEvent } = e
            const { key } = nativeEvent
            dispatch('menuClose', { key, value: selectedValue })
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Actions"
              variant="outlined"
              inputRef={(input) => {
                if (firstTime.get() && input) {
                  firstTime.set(false)
                  setTimeout(() => input.focus(), 0)
                }
              }}
            />
          )}
        />
      )
    }
    const renderMap = {
      rendercursor,
      renderkey,
      renderroot,
      rendermenu,
      renderref,
    }
    const renderfunc = renderMap[`render${item2.type}`]
    const args = { index }
    return (renderfunc && renderfunc(args)) || rendercell(args)
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
  } = props
  const elType = (button && 'button') || 'div'
  const display = 'inline-block'
  function s(name, value, enabled = false) {
    return (enabled && { [name]: value }) || {}
  }
  const moreStyle = {
    ...s('width', '100%', w100),
    ...s('height', '100%', h100),
    ...s('display', display, true),
    ...s('border', '1px dashed yellow', dashedBorder),
    ...s('margin', '2px', true),
    // ...s('verticalAlign', 'top', true),
  }
  const newProps = {
    ...rest,
    ...{ style: om(style, moreStyle) },
  }
  // console.log("createElement",{
  //   elType,
  //   newProps,
  //   children,
  // })
  return React.createElement(elType, newProps, children)
}
// </element factory>

function App() {
  return <X key={0} index={0} cycle={renderTracker()} />
}

const ConnectedApp = rrconnect((state) => state, {})(App)
render(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>,
  document.getElementById('root')
)

function Save() {
  try {
    fs.writeFileSync('myfile.txt', 'the text to write in the file', 'utf-8')
  } catch (e) {
    alert('Failed to save the file !')
  }
}
