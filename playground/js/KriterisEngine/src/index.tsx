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
import { TAction, TActionType, TNode, TNodeId, TState } from './types'
import { stateLens } from './state'
import { JumpMenu } from './components.tsx';
//import { DockPanel, DockType } from './dockpanel'

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
    type: 'cursor' as const,
    parentId: rootId,
    children: [rootId],
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
    getNodeById,
    getCursor,
  } = stateLens(state)
  function tableAdd() {
    const id = getId()
    pushNode({
      id,
      parentId: getFocusedNode().id,
      type: 'table' as const,
      children: [getCursorId()],
    })

    pushChild(getCursor(), id)
    setChild(getFocusedNode(), getCursorIndex(), id)
    setFocus(id)
    getCursor().parentId = id
  }
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
    // const cursorIndex = getCursorIndex()
    // const cursorNode = getNodeById(getCursorId())
    // pushChild(cursorNode, id) //remember the place we jumped in to
    insertChildren(getFocusedNode(), getCursorIndex(), id)
  }
  function cellAdd() {
    const id = getId()
    pushNode({
      id,
      parentId: getFocusedNode().id,
      type: 'cell' as const,
      children: [getCursorId()],
    })

    pushChild(getCursor(), id)
    setChild(getFocusedNode(), getCursorIndex(), id)
    setFocus(id)
    getCursor().parentId = id
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
      const lastId = getCursor().children.pop()

      const lastNode = getNodeById(lastId)
      extracted(lastNode)
      function extracted(node: TNode) {
        const parentNode = getParentNode(node)
        const parentIndex = findChildById(parentNode, node.id)
        removeCursor()
        setFocus(parentNode.id)
        callback(parentNode, parentIndex)
        getCursor().parentId = parentNode.id
      }
    }
    function navTo(nodeIndex: number, push: boolean) {
      const node = getChildNode(getFocusedNode(), nodeIndex)

      function enter(node) {
        removeCursor()
        if (push) {
          pushChild(node, getCursorId())
        } else {
          enqueueChild(node, getCursorId())
        }
        setFocus(node.id)
      }

      if (node.type === 'cell') {
        enter(node)
        pushChild(getCursor(), node.id)
        getCursor().parentId = node.id
      } else if (node.type === 'ref') {
        pushChild(getCursor(), node.id)
        const targetCell = getNodeById(node.refId)
        enter(targetCell)
        getCursor().parentId = node.id
      } else {
        swapChild(getFocusedNode(), nodeIndex, getCursorIndex())
      }
    }

    const goLeft = key === 'ArrowLeft'
    const goRight = key === 'ArrowRight'
    if (goLeft) {
      if (getCursorIndex() === 0) {
        if (isRoot(getFocusedNode())) return // can't go up past root
        navUp((parentNode: TNode, parentIndex: number) => {
          insertChildren(parentNode, parentIndex, getCursorId())
        })
      } else {
        navTo(getCursorIndex() - 1, true)
      }
    } else if (goRight) {
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

// <renderer>
function Render(props) {
  const { cycle, id } = props
  //const firstTime = accessor(this, 'firstTime')
  const state: TState = getState()
  const lens = stateLens(state)
  const { nodes, rootId, cursorId, focus: focusId } = state
  const cursor = lens.getCursor()
  //const lastId = cursor.children.last()
  //const lastNode = lens.getNodeById(lastId) //todo menu duplication
  const renderStack = []
  function renderNode(id: TNodeId, pnode?: TNode): React.Component {
    const item2 = lens.getNodeById(id)

    function rendercursor() {
      //console.log(pnode, item2)
      if (pnode?.id !== item2.parentId) {
        return null
      }
      return <El reff={(el) => el && el.scrollIntoView()}>█</El>
    }
    function renderkey({ id }) {
      const item = lens.getNodeById(id)
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

    function squash(node: TNode) {
      if (node.type === 'ref' && node.refId) {
        const deref = lens.getNodeById(node.refId)
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
    function rendercell({ id }) {
      const node = lens.getNodeById(id)
      const item = squash(node)
      const { type, refId } = item
      function renderCellContainer(children) {
        const getStr = () => {
          return refId ? `${id} (${refId})` : `${refId || id}`
        }
        return (
          <El dashedBorder key={id}>
            <El>{`${type} ${getStr()}`}</El>
            <br />
            <El>{children}</El>
          </El>
        )
      }
      const children = (item.children || []).map((i) => renderNode(i, node))
      if (isRoot(item)) {
        //const s = JSON.stringify(item.children.map(lens.getNodeById))
        const cursor2 = JSON.stringify(lens.getCursor())
        return (
          <El w100 h100 scrollV key={id}>
            <El small>
              root cell: {id} focus: {state.focus}
              <pre>{cursor2}</pre>
            </El>
            <br />
            {children}
          </El>
        )
      }
      if (item.type === 'ref') {
        debugger
      }
      //const test = <pre>{JSON.stringify(state, null, 2)}</pre>
      return renderCellContainer(children)
    }
    function rendermenu() {
      const refList = state.nodes
        .filter((node: TNode): boolean => node.type === 'cell' && !isRoot(node))
        .map((node: TNode) => ({
          title: `cell reference ${node.id}`,
          command: ['refAdd', { id: node.id }],
        }))

      const demoMenu = [
        { title: 'add cell', command: ['cellAdd'] },
        { title: 'add table', command: ['tableAdd'] },
        ...refList,
      ]
      return JumpMenu(demoMenu, dispatch)
    }
    const renderMap = {
      rendercursor,
      renderkey,
      rendermenu,
      rendercell,
      renderref: rendercell,
    }
    const renderfunc = renderMap[`render${item2.type}`]
    const args = { id }
    return renderfunc && renderfunc(args)
  }
  return renderNode(id)
}

// </renderer>
function makeDispatch(type: TActionType, payload: any): TAction {
  return { type, payload }
}
// <element factory>
function El(props) {
  const {
    div,
    button,
    w100,
    h100,
    dashedBorder,
    children,
    small,
    style,
    scrollV,
    reff,
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
    ...s('fontSize', '10px', small),
    ...s('padding', '0px', small),
    ...s('margin', '0px', small),
    ...s('overflowY', 'scroll', scrollV),
    // ...s('verticalAlign', 'top', true),
  }
  const newProps = {
    ...rest,
    ref: reff,
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
  return <Render key={0} id={0} cycle={renderTracker()} />
}

const ConnectedApp = rrconnect((state) => state, {})(App)
keyboardBindings()
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
  const lettersArray = Array.from(
    'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}\\;:\'"<>,./?'
  )
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
