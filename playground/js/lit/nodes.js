const keyIndex = 'i';
const keyParent = 'p';
const keyType = 't';
const keyData = 'd';
const keyPrev = 'a';
const keyNext = 'b';
const keyPair = 'r';
const state = {
    nodes: [emptyNode()]
}
function nodesById(...nodeIds) {
    const nodes = state.nodes;
    return nodeIds.map(i=>nodes[i])
}
function nodes(...items) {
    return items.map(node)
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
function getPrev(n) {
    return nodesById(n.a)
}
function getNext(n) {
    return nodesById(n.b)
}
function getPair(n) {
    return nodesById(n[keyPair])[0]
}
const [tNull, tchar,tcur,topen,tclose] = [0,1,2,3,4]
const types = {
    ['']: tNull,
    ['c']: tchar,
    ['█']: tcur,
    ['<']: topen,
    ['>']: tclose,
}
const typeStrings = Object.keys(types)
//const tn = Object.fromEntries(Object.values(nt).map((v,i) => [v, i]))
function node(kind) {
    const i = state.nodes.length;
    var t = 0
    var d = 0
    if (kind.length===1) {
        t=1
        d=kind.charCodeAt(0)
    } else {
        const tag = kind[1]
        t=types[tag]
    }
    const nodeData = {...emptyNode(), i,t,d}
    state.nodes.push(nodeData)
    log(nodeData)
    return nodeData
}
function edges(...items) {
    for (let i = 1; i < items.length; i++) {
        const a = items[i-1]
        const b = items[i]
        edge(a,b)
    }
}
function edge(a,b) {
    a[keyPrev] = b[keyIndex]
    b[keyNext] = a[keyIndex]
}
function pair(a,b) {
    a[keyPair] = b[keyIndex]
    b[keyPair] = a[keyIndex]
}
function parent(target,parent) {
    target[keyParent]=parent[keyIndex]
}
function before(target) {
    return [nodesById(target[keyPrev]),target]
}
function insert(between,p,...items) {
    var [a,b] = between
    edges(a,...items,b)
    items.map(n=>parent(n,p))
}
function remove(i) {

}
const [rootOpen,cursor,rootClosed] = initial = nodes("@<","@█","@>")
pair(rootOpen,rootClosed)
edges(initial)
parent(cursor,rootOpen)

function processEvents() {
    for (let i = 0; i < evt.length; i++) {
        processEvent(evt[i])
    }
    evt.length=0
}

function processEvent(e) {
    log(e)
    const { t, key } = e
    insert(before(cursor),cursor,node(key))
}
function raf() {
    if (evt.length>0) processEvents()
    requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
