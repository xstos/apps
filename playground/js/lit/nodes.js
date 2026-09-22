const nodePropKey_Id = 'i';
const nodePropKey_Parent = '↖︎';
const nodePropKey_Type = 'type';
const nodePropKey_Data = 'data';
const nodePropKey_Prev = '←';
const nodePropKey_Next = '→';
const nodePropKey_Pair = '⇄';
const state = {
    nodes: [nodeMakeEmpty()]
}
function nodeById(nodeId) {
    return state.nodes[nodeId]
}
function makeNodes(...items) {
    return items.map(makeNode)
}

function nodeMakeEmpty() {
    return {
        [nodePropKey_Id]: 0,
        [nodePropKey_Parent]: 0,
        [nodePropKey_Type]: 0,
        [nodePropKey_Data]: 0,
        [nodePropKey_Prev]: 0,
        [nodePropKey_Next]: 0,
        [nodePropKey_Pair]: 0,
    }
}
function nodeTypeIdToString(nodeTypeId) {
    return nodeTypeStrings[nodeTypeId]
}
function nodeGetId(node) {
    return node[nodePropKey_Id]
}
function nodeGetType(node) {
    return node[nodePropKey_Type]
}
function nodeGetPrev(node) {
    return nodeById(node[nodePropKey_Prev])
}
function nodeGetNext(node) {
    return nodeById(node[nodePropKey_Next])
}
function nodeGetPair(node) {
    return nodeById(node[nodePropKey_Pair])
}
function nodeGetData(node) {
    return node[nodePropKey_Data]
}
function nodeGetParent(node) {
    return nodeById(node[nodePropKey_Parent])
}
function nodeSetParent(node,nodeParent) {
    node[nodePropKey_Parent]=nodeGetId(nodeParent)
}
function nodeIsEqual(node, nodeOther) {
    return nodeGetId(node)===nodeGetId(nodeOther)
}
function nodeTypeIs(node,nodeTypeId) {
    return nodeGetType(node)===nodeTypeId
}
function nodeTypeIsChar(node) {
    return nodeTypeIs(node,nodeTypeId_Char)
}
function nodeTypeIsCursor(node) {
    return nodeTypeIs(node,nodeTypeId_Cursor)
}
function nodeTypeIsOpen(node) {
    return nodeTypeIs(node,nodeTypeId_Open)
}
function nodeTypeIsClose(node) {
    return nodeTypeIs(node,nodeTypeId_Close)
}

const [nodeTypeId_Null, nodeTypeId_Char,nodeTypeId_Cursor,nodeTypeId_Open,nodeTypeId_Close] = [0,1,2,3,4]
const nodeTypeMap = {
    ['']: nodeTypeId_Null,
    ['c']: nodeTypeId_Char,
    ['█']: nodeTypeId_Cursor,
    ['⟪']: nodeTypeId_Open,
    ['⟫']: nodeTypeId_Close,
}

const nodeTypeStrings = Object.keys(nodeTypeMap)
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
        t=nodeTypeMap[tag]
        s=tag
    }
    const nodeData = {s,...nodeMakeEmpty(), [nodePropKey_Id]:i,[nodePropKey_Type]:t,[nodePropKey_Data]:d}
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
    a[nodePropKey_Next] = nodeGetId(b)
    b[nodePropKey_Prev] = nodeGetId(a)
}
function pairUpNodes(node1,node2) {
    node1[nodePropKey_Pair] = nodeGetId(node2)
    node2[nodePropKey_Pair] = nodeGetId(node1)
}

function replace(nodeToReplace,...replacementNodes) {
    const [prev,next] = [nodeGetPrev(nodeToReplace),nodeGetNext(nodeToReplace)]
    const p = nodeGetParent(nodeToReplace)
    setEdges(prev,...replacementNodes,next)
    replacementNodes.forEach(n=>nodeSetParent(n,p))
}
const [rootOpen,cursor,rootClosed] = initial = makeNodes("@"+nodeTypeIdToString(nodeTypeId_Open),"@█","@"+nodeTypeIdToString(nodeTypeId_Close))
function getCursorId() {
    return nodeGetId(cursor)
}
function getRootOpenId() {
    return nodeGetId(rootOpen)
}
function getRootCloseId() {
    return nodeGetId(rootClosed)
}
function isRootOpen(n) {
    return nodeGetId(n)===getRootOpenId()
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
        if (nodeTypeIsOpen(prev)) {
            // ignore
        } else if (nodeTypeIsClose(prev)) {
            const openNode = nodeGetPair(prev)

        } else {
            const prevPrev = nodeGetPrev(prev)
            setEdges(prevPrev,cursor)
        }
    }
    else if (key==="ctrl+backspace") {
        const prev = nodeGetPrev(cursor)
        if (nodeTypeIsClose(prev)) {
            const openNode = nodeGetPair(prev)
            const prev2 = nodeGetPrev(openNode)
            edgeBetweenNodes(prev2,cursor)
        }
    }
    else if (key==="delete") {
        const next = nodeGetNext(cursor)
        if (nodeTypeIsOpen(next)) {

        } else if (nodeTypeIsClose(next)) {

        } else {
            const nextNext = nodeGetNext(next)
            edgeBetweenNodes(cursor,nextNext)
        }
    }
    else if (key==="ctrl+delete") {
        const next = nodeGetNext(cursor)
        if (nodeTypeIsOpen(next)) {
            const close = nodeGetPair(next)
            const closeNext = nodeGetNext(close)
            edgeBetweenNodes(cursor,closeNext)
        }
    }
    else if (key==="ctrl+enter") {
        const [bOpen,bClose] = makeNodes("@"+nodeTypeIdToString(nodeTypeId_Open),"@"+nodeTypeIdToString(nodeTypeId_Close))
        pairUpNodes(bOpen,bClose)
        replace(cursor,cursor,bOpen,bClose)
    }
    else if (key==="arrowright") {
        const [p,n] = [nodeGetPrev(cursor),nodeGetNext(cursor)]
        if (!nodeIsEqual(n,rootClosed)) {
            const nn = nodeGetNext(n)
            setEdges(p,n,cursor,nn)
            if (nodeTypeIsOpen(n)) {
                nodeSetParent(cursor,n)
            }
            if (nodeTypeIsClose(n)) {
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
            if (nodeTypeIsOpen(p)) {
                const par = nodeGetParent(p)
                nodeSetParent(cursor,par)
            }
            if (nodeTypeIsClose(p)) {
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
