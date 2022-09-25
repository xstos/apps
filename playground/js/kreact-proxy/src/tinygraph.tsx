
const state = {
  vars: {},
  nodes: [],
  dirty: [],
}

function addNode()  {
  const nodeIndex = state.nodes.length
  const node = {id: nodeIndex}
  state.nodes.push(node)
  return node
}

function addEdge(node, otherNode, i) {
  if (!('out' in node)) {
    node.out = []
  }

  const edge = {id: otherNode.id}
  if (i !== undefined) {
    edge.i = i
  }
  node.out.push(edge)

  return [node, otherNode, i]
}

function setNodeDirty(id) {
  state.dirty.push(id)
}

function calculate() {
  const dirty = state.dirty
  while (dirty.length > 0) {
    const id = dirty.pop()
    const node = getNodeById(id)

  }
}


function getCreateNode(key, type) {
  let node, nodeId
  const {vars, nodes} = state
  if (type === 'var') {
    if (!(key in vars)) {
      node = addNode()
      nodeId = node.id
      vars[key] = nodeId
      node.type = type
      node.key = key
    } else {
      nodeId = vars[key]
      node = nodes[nodeId]
    }
  } else if (type === 'op') {
    node = addNode()
    nodeId = node.id
    node.type = type
    node.key = key
  }
  return nodeId
}


function getNodeById(id) {
  return state.nodes[id]
}

function isNodeReference(data) {
  if (typeof data === 'object') {
    return 'type' in data && 'id' in data
  }
  return false
}

function makeProxy(type) {
  let handler = null

  function prox(target) {
    return newProxy(target, handler)
  }

  handler = {
    get(target, key) {
      if (key.startsWith('_')) {
        return target[key]
      }

      const data = target._data
      const nodeId = getCreateNode(key, data.type)
      data.id = nodeId
      return prox(target)
    },
    apply(target, thisArg, args) {
      const data = target._data
      apply(data, args.map(a => a._data ? a._data : a))
      return prox(target)
    },
  }

  const f = () => {
  }
  f._data = {
    type
  }

  return newProxy(f, handler)
}

function apply(data, args) {
  const {id, type} = data
  const node = getNodeById(id)
  if (type === 'var') {
    const [arg] = args
    if (isNodeReference(arg)) {
      const argNode = getNodeById(arg.id)
      addEdge(argNode, node, undefined)
    } else {
      node.value = arg
      node.leaf = true
      setNodeDirty(id)
    }
  } else if (type === 'op') {
    const l = args.length
    node.args = []
    setNodeDirty(id)
    for (let i = 0; i < l; i++) {
      const arg = args[i]
      if (isNodeReference(arg)) {
        const argNode = getNodeById(arg.id)
        addEdge(argNode, node, i)
        node.args[i] = {}
      } else {
        node.args[i] = {v: arg}
      }
    }
  }
}


 export const foo = 2
