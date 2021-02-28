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
  const rootPosId = getId()
  const cursorId = getId()
  const rootEl = {
    id: rootId,
    type: 'cell' as const,
    children: [cursorId],
  }
  const rootPos = {
    id: rootPosId,
    type: 'ref' as const,
    parentId: rootPosId,
    refId: rootId,
  }
  const cursorEl = {
    id: cursorId,
    type: 'cursor' as const,
    parentId: rootPosId,
  }
  return {
    cursorId,
    rootId: rootPosId,
    nodes: [rootEl, rootPos, cursorEl],
    focus: rootPosId,
  }
}
function isRoot(node: TNode) {
  return node.parentId === node.id
}
function stateLens(state: TState) {
  const { nodes, rootId, cursorId, focus: focusId } = state

  //let { children: focusedChildren } = focusedNode
  //focusedChildren = focusedChildren || []
  //const mapped = focusedChildren.map((id: TNodeId) => nodes[id])
  //const cursorIndex = focusedChildren.findIndex2(cursorId)
  function pushNode(node: TNode) {
    nodes.push(node)
  }
  function getCursorId() {
    return state.cursorId
  }
  function getCursorIndex() {
    return findChildById(getFocusedNode(), getCursorId())
  }
  function getChildren(node: TNode) {
    if (node.type === 'ref') {
      return nodes[node.refId].children
    }
    return node.children
  }
  function getFocusedNode() {
    return nodes[state.focus]
  }
  function setFocus(id: TNodeId) {
    state.focus = id
  }
  function pushChild(node: TNode, id: TNodeId) {
    getChildren(node).push(id)
  }
  function enqueueChild(node: TNode, id: TNodeId) {
    getChildren(node).splice(0, 0, id)
  }
  function insertChildren(node: TNode, index: number, ...items: TNodeId[]) {
    getChildren(node).splice(index, 0, ...items)
  }
  function getChild(node: TNode, index: number): TNodeId {
    return getChildren(node)[index]
  }
  function getChildNode(node: TNode, index: number): TNode {
    return nodes[getChild(node, index)]
  }
  function setChild(node: TNode, index: number, id: TNodeId) {
    const old = getChild(node, index)
    getChildren(node)[index] = id
    return old
  }
  function swapChild(node: TNode, index1: number, index2: number) {
    const focusedNode = getFocusedNode()
    const childAtIndex = getChild(focusedNode, index1)
    const replaced = setChild(focusedNode, index2, childAtIndex)
    setChild(focusedNode, index1, replaced)
  }
  function getNumChildren(node: TNode) {
    return getChildren(node).length
  }
  function deleteChildren(node: TNode, index: number, count: number) {
    getChildren(node).splice(index, count)
  }
  function getParentNode(node: TNode) {
    return nodes[node.parentId]
  }
  function findChildById(node: TNode, id: TNodeId): TNodeId {
    return getChildren(node).findIndex2(id)
  }
  return {
    getCursorId,
    getCursorIndex,
    getChildren,
    getFocusedNode,
    setFocus,
    pushChild,
    enqueueChild,
    insertChildren,
    getChild,
    getChildNode,
    setChild,
    swapChild,
    getNumChildren,
    deleteChildren,
    getParentNode,
    findChildById,
    pushNode,
  }
}
// <state+action=>new state>
function Reducer(oldState: TState, action: TAction) {
  const state: TState = cloneDeep(oldState)
  const { type, payload } = action
  const {
    getCursorId,
    getCursorIndex,
    getChildren,
    getFocusedNode,
    setFocus,
    pushChild,
    enqueueChild,
    insertChildren,
    getChild,
    getChildNode,
    setChild,
    swapChild,
    getNumChildren,
    deleteChildren,
    getParentNode,
    findChildById,
    pushNode,
  } = stateLens(state)
  function refAdd() {
    const { id: refId } = payload
    const id = getId()
    const focusedNode = getFocusedNode()
    pushNode({
      id,
      type: 'ref' as const,
      parentId: focusedNode.id,
      refId,
    })
    const cursorIndex = getCursorIndex()
    setChild(focusedNode, cursorIndex, id)
    setFocus(id)
    insertChildren(getFocusedNode(), 0, getCursorId())
  }
  function cellAdd() {
    const id = getId()
    pushNode({
      id,
      type: 'cell' as const,
      children: [getCursorId()],
    })
    const refId = getId()
    pushNode({
      id: refId,
      type: 'ref' as const,
      parentId: getFocusedNode().id,
      refId: id,
    })
    setChild(getFocusedNode(), getCursorIndex(), refId)
    setFocus(refId)
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
    pushNode({
      id,
      parentId: getFocusedNode().id,
      type: 'key' as const,
      key,
    })
    insertChildren(getFocusedNode(), getCursorIndex(), id)
  }
  function menu() {
    const { id } = payload
    pushNode({
      parentId: getFocusedNode().id,
      id,
      type: 'menu',
    })
    insertChildren(getFocusedNode(), getCursorIndex(), id)
  }
  function cursorMove() {
    const { key } = payload
    function removeCursor() {
      deleteChildren(getFocusedNode(), getCursorIndex(), 1)
    }
    function navUp(callback) {
      const parentNode = getParentNode(getFocusedNode())
      const parentIndex = findChildById(parentNode, getFocusedNode().id)
      removeCursor()
      setFocus(parentNode.id)
      callback(parentNode, parentIndex)
    }
    function navTo(nodeIndex: number, push: boolean) {
      const node = getChildNode(getFocusedNode(), nodeIndex)
      if (node.type === 'ref') {
        removeCursor()
        if (push) {
          pushChild(node, getCursorId())
        } else {
          enqueueChild(node, getCursorId())
        }
        setFocus(node.id)
      } else {
        swapChild(getFocusedNode(), nodeIndex, getCursorIndex())
      }
    }
    if (key === 'ArrowLeft') {
      if (getCursorIndex() === 0) {
        if (isRoot(getFocusedNode())) return // can't go up past root
        navUp((parentNode: TNode, parentIndex: number) => {
          insertChildren(parentNode, parentIndex, getCursorId())
        })
      } else {
        navTo(getCursorIndex() - 1, true)
      }
    } else if (key === 'ArrowRight') {
      if (getCursorIndex() === getNumChildren(getFocusedNode()) - 1) {
        if (isRoot(getFocusedNode())) return
        navUp((parentNode: TNode, parentIndex: number) => {
          insertChildren(parentNode, parentIndex + 1, getCursorId())
        })
      } else {
        navTo(getCursorIndex() + 1, false)
      }
    }
  }
  function cursorDeleteKey(key) {
    if (key === 'Backspace' && getCursorIndex() > 0) {
      deleteChildren(getFocusedNode(), getCursorIndex() - 1, 1)
    } else if (
      key === 'Delete' &&
      getCursorIndex() < getNumChildren(getFocusedNode())
    ) {
      deleteChildren(getFocusedNode(), getCursorIndex() + 1, 1)
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
    const { cycle, index, hideCursor } = this.props
    const firstTime = accessor(this, 'firstTime')
    const state: TState = getState()
    //const { getChildren } = stateLens(state)
    const { nodes, rootId, cursorId, focus: focusId } = state
    const item2 = nodes[index]
    // const { type, refId } = item;
    // const children = (item.children || []).map((child) => (
    //   <X key={child} index={child} cycle={cycle} />
    // ));
    function rendercursor() {
      if (hideCursor) return <El></El>
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
      const item = squash(state.nodes[index])
      const children = (item.children || []).map((child) => {
        return <X key={child} index={child} cycle={cycle} />
      })
      return (
        <El w100 h100 key={index}>
          cell: {index} focus: {state.focus} <br />
          {children}
        </El>
      )
    }
    function squash(node: TNode) {
      if (node.type === 'ref') {
        const deref = state.nodes[node.refId]
        return {
          id: node.id,
          parentId: node.parentId,
          type: deref.type,
          children: deref.children,
          refId: node.refId,
        }
      }
      return node
    }
    function renderref({ index }) {
      if (cycle.has(index)) {
        return <span>cycle detected</span>
      }
      const item = squash(state.nodes[index])
      const { refId } = item
      cycle.set(refId)
      if (isRoot(item)) {
        return renderroot({ index })
      }
      const { type } = item
      const hideCursor2 = item.id !== state.focus || hideCursor
      const children = (item.children || []).map((child) => {
        return (
          <X key={child} index={child} hideCursor={hideCursor2} cycle={cycle} />
        )
      })
      return (
        <El dashedBorder key={index}>
          <El>{`${type} ${index} ref: ${item.refId} parentId: ${item.parentId}`}</El>
          <br />
          <El>{children}</El>
        </El>
      )
    }
    function rendermenu() {
      const refList = state.nodes
        .filter((node: TNode): boolean => node.type === 'cell' && !isRoot(node))
        .map((node: TNode) => ({
          title: `cell ${node.id}`,
          command: ['refAdd', { id: node.id }],
        }))
      const demoMenu = [{ title: 'add cell', command: ['cellAdd'] }, ...refList]
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
    return (renderfunc && renderfunc(args)) || renderref(args)
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
  return <X key={1} index={1} cycle={renderTracker()} />
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
