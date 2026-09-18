const keyIndex = 'i';
const keyParent = '↖︎';
const keyType = 'type';
const keyData = 'data';
const keyPrev = '←';
const keyNext = '→';
const keyPair = '⇄';
const state = {
    nodes: [emptyNode()]
}
function nodeById(id) {
    return state.nodes[id]
}
function makeNodes(...items) {
    return items.map(makeNode)
}

function emptyNode() {
    return {
        [keyIndex]: 0,
        [keyParent]: 0,
        [keyType]: 0,
        [keyData]: 0,
        [keyPrev]: 0,
        [keyNext]: 0,
        [keyPair]: 0,
    }
}
function typeStr(type) {
    return nodeTypeStrings[type]
}
function nodeGetIndex(node) {
    return node[keyIndex]
}
function nodeGetType(node) {
    return node[keyType]
}
function nodeGetPrev(node) {
    return nodeById(node[keyPrev])
}
function nodeGetNext(node) {
    return nodeById(node[keyNext])
}
function nodeGetPair(node) {
    return nodeById(node[keyPair])
}
function nodeGetData(node) {
    return node[keyData]
}
function nodeGetParent(node) {
    return nodeById(node[keyParent])
}
function nodeSetParent(node,nodeParent) {
    node[keyParent]=nodeGetIndex(nodeParent)
}
function nodeIsEqual(node, nodeOther) {
    return nodeGetIndex(node)===nodeGetIndex(nodeOther)
}
function nodeIsOfType(node,t) {
    return nodeGetType(node)===t
}
function nodeIsChar(node) {
    return nodeIsOfType(node,nodeTypeChar)
}
function nodeIsCursor(node) {
    return nodeIsOfType(node,nodeTypeCursor)
}
function nodeIsOpen(node) {
    return nodeIsOfType(node,nodeTypeOpen)
}
function nodeIsClose(node) {
    return nodeIsOfType(node,nodeTypeClose)
}

const [nodeTypeNull, nodeTypeChar,nodeTypeCursor,nodeTypeOpen,nodeTypeClose] = [0,1,2,3,4]
const nodeTypes = {
    ['']: nodeTypeNull,
    ['c']: nodeTypeChar,
    ['█']: nodeTypeCursor,
    ['⟪']: nodeTypeOpen,
    ['⟫']: nodeTypeClose,
}

const nodeTypeStrings = Object.keys(nodeTypes)
//const tn = Object.fromEntries(Object.values(nt).map((v,i) => [v, i]))
function makeNode(kind) {
    const i = state.nodes.length;
    var t = 0
    var d = 0
    var s = ""
    if (kind.length===1) {
        t=1
        d=kind.charCodeAt(0)
        s=kind
    } else {
        const tag = kind[1]
        t=nodeTypes[tag]
        s=tag
    }
    const nodeData = {s,...emptyNode(), [keyIndex]:i,[keyType]:t,[keyData]:d}
    state.nodes.push(nodeData)
    log(nodeData)
    return nodeData
}
function setEdges(...nodes) {
    for (let i = 1; i < nodes.length; i++) {
        const a = nodes[i-1]
        const b = nodes[i]
        edgeBetweenNodes(a,b)
    }
}
function edgeBetweenNodes(a,b) {
    a[keyNext] = nodeGetIndex(b)
    b[keyPrev] = nodeGetIndex(a)
}
function pairUpNodes(node1,node2) {
    node1[keyPair] = nodeGetIndex(node2)
    node2[keyPair] = nodeGetIndex(node1)
}

function replace(nodeToReplace,...replacementNodes) {
    const [prev,next] = [nodeGetPrev(nodeToReplace),nodeGetNext(nodeToReplace)]
    const p = nodeGetParent(nodeToReplace)
    setEdges(prev,...replacementNodes,next)
    replacementNodes.forEach(n=>nodeSetParent(n,p))
}
const [rootOpen,cursor,rootClosed] = initial = makeNodes("@"+typeStr(nodeTypeOpen),"@█","@"+typeStr(nodeTypeClose))
function getCursorId() {
    return nodeGetIndex(cursor)
}
function getRootOpenId() {
    return nodeGetIndex(rootOpen)
}
function getRootCloseId() {
    return nodeGetIndex(rootClosed)
}
function isRootOpen(n) {
    return nodeGetIndex(n)===getRootOpenId()
}

pairUpNodes(rootOpen,rootClosed)
setEdges(...initial)
nodeSetParent(cursor,rootOpen)
function processEvents() {
    evt.forEach(processEvent)
    globalThis.update()
    evt.length=0
}

function processEvent(e) {
    log(e)
    const { t, key } = e
    if (key==="backspace") {
        const prev = nodeGetPrev(cursor)
        if (nodeIsOpen(prev)) {
            // ignore
        } else if (nodeIsClose(prev)) {
            const openNode = nodeGetPair(prev)

        } else {
            const prevPrev = nodeGetPrev(prev)
            setEdges(prevPrev,cursor)
        }
    }
    else if (key==="ctrl+backspace") {
        const prev = nodeGetPrev(cursor)
        if (nodeIsClose(prev)) {
            const openNode = nodeGetPair(prev)
            const prev2 = nodeGetPrev(openNode)
            edgeBetweenNodes(prev2,cursor)
        }
    }
    else if (key==="delete") {
        const next = nodeGetNext(cursor)
        if (nodeIsOpen(next)) {

        } else if (nodeIsClose(next)) {

        } else {
            const nextNext = nodeGetNext(next)
            edgeBetweenNodes(cursor,nextNext)
        }
    }
    else if (key==="ctrl+delete") {
        const next = nodeGetNext(cursor)
        if (nodeIsOpen(next)) {
            const close = nodeGetPair(next)
            const closeNext = nodeGetNext(close)
            edgeBetweenNodes(cursor,closeNext)
        }
    }
    else if (key==="ctrl+enter") {
        const [bOpen,bClose] = makeNodes("@"+typeStr(nodeTypeOpen),"@"+typeStr(nodeTypeClose))
        pairUpNodes(bOpen,bClose)
        replace(cursor,cursor,bOpen,bClose)
    }
    else if (key==="arrowright") {
        const [p,n] = [nodeGetPrev(cursor),nodeGetNext(cursor)]
        if (!nodeIsEqual(n,rootClosed)) {
            const nn = nodeGetNext(n)
            setEdges(p,n,cursor,nn)
            if (nodeIsOpen(n)) {
                nodeSetParent(cursor,n)
            }
            if (nodeIsClose(n)) {
                const closeParent = nodeGetParent(n)
                nodeSetParent(cursor,closeParent)
            }
        }
    }
    else if (key==="arrowleft") {
        const [p,n] = [nodeGetPrev(cursor),nodeGetNext(cursor)]
        if (!nodeIsEqual(p, rootOpen)) {
            const pp = nodeGetPrev(p)
            setEdges(pp, cursor, p, n)
            if (nodeIsOpen(p)) {
                const par = nodeGetParent(p)
                nodeSetParent(cursor,par)
            }
            if (nodeIsClose(p)) {
                const par = nodeGetPair(p)
                nodeSetParent(cursor,par)
            }
        }
    }

    else {
        replace(cursor,makeNode(key),cursor)
    }

}
function raf() {
    if (evt.length>0) processEvents()
    requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
