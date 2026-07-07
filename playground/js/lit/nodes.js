const keyIndex = 'ix';
const keyParent = 'par';
const keyType = 'type';
const keyData = 'data';
const keyPrev = 'prev';
const keyNext = 'next';
const keyPair = 'pair';
const state = {
    nodes: [emptyNode()]
}
function nodeById(id) {
    return state.nodes[id]
}
function nodesById(...nodeIds) {
    const nodes = state.nodes;
    return nodeIds.map(i=>nodes[i])
}
function Nodes(...items) {
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
function getId(n) {
    return n[keyIndex]
}
function getType(n) {
    return n[keyType]
}
function typeStr(type) {
    return typeStrings[type]
}
function getPrev(n) {
    return nodeById(n[keyPrev])
}
function getNext(n) {
    return nodeById(n[keyNext])
}

function getPair(n) {
    return nodeById(n[keyPair])
}
function getData(n) {
    return n[keyData]
}
function getParent(n) {
    return nodesById(n[keyParent])
}
function nodeEqual(a,b) {
    return getId(a)===getId(b)
}
function* getChildren(n) {
    const last = getPair(n)
    var it = getNext(n)
    while(!nodeEqual(it,last)) {
        yield it
        it=getNext(it)
    }
}
function isType(n,t) {
    return getType(n)===t
}
function isChar(n) {
    return isType(n,tchar)
}
function isCursor(n) {
    return isType(n,tcur)
}
function isOpen(n) {
    return isType(n,topen)
}
function isClose(n) {
    return isType(n,tclose)
}
const [tNull, tchar,tcur,topen,tclose] = [0,1,2,3,4]
const types = {
    ['']: tNull,
    ['c']: tchar,
    ['█']: tcur,
    ['[']: topen,
    [']']: tclose,
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
    const nodeData = {...emptyNode(), [keyIndex]:i,[keyType]:t,[keyData]:d}
    state.nodes.push(nodeData)
    log(nodeData)
    return nodeData
}
function Edges(...items) {
    for (let i = 1; i < items.length; i++) {
        const a = items[i-1]
        const b = items[i]
        Edge(a,b)
    }
}
function Edge(a,b) {
    a[keyNext] = b[keyIndex]
    b[keyPrev] = a[keyIndex]
}
function Pair(a,b) {
    a[keyPair] = b[keyIndex]
    b[keyPair] = a[keyIndex]
}
function Parent(target,parent) {
    target[keyParent]=parent[keyIndex]
}
function before(target) {
    return [nodesById(target[keyPrev]),target]
}
function replace(n,...items) {
    const [prev,next] = [getPrev(n),getNext(n)]
    const p = getParent(n)
    Edges(prev,...items,next)
    items.map(n=>Parent(n,p))

}
const [rootOpen,cursor,rootClosed] = initial = Nodes("@"+typeStr(topen),"@█","@"+typeStr(tclose))
Pair(rootOpen,rootClosed)
Edges(...initial)
Parent(cursor,rootOpen)
function isRootOpen(n) {
    return getId(n)===getId(rootOpen)
}
function isRootClosed(n) {
    return getId(n)===getId(rootClosed)
}
function processEvents() {
    for (let i = 0; i < evt.length; i++) {
        processEvent(evt[i])
    }
    evt.length=0
}

function processEvent(e) {
    log(e)
    const { t, key } = e
    if (key==="backspace") {
        const prev = getPrev(cursor)
        if (isOpen(prev)) {
            // ignore
        } else if (isClose(prev)) {
            const openNode = getPair(prev)

        } else {
            const prevPrev = getPrev(prev)
            Edges(prevPrev,cursor)
        }
    } else if (key==="ctrl+enter") {
        const [bOpen,bClose] = Nodes("@"+typeStr(topen),"@"+typeStr(tclose))
        Pair(bOpen,bClose)
        replace(cursor,cursor,bOpen,bClose)
    } else if (key==="arrowright") {
        const [p,n] = [getPrev(cursor),getNext(cursor)]
        if (isRootClosed(n)) return
        const nn = getNext(n)
        Edges(p,n,cursor,nn)
    } else if (key==="arrowleft") {
        const [p,n] = [getPrev(cursor),getNext(cursor)]
        if (isRootOpen(p)) return
        const pp = getPrev(p)
        Edges(pp,cursor,p,n)
    } else {
        replace(cursor,node(key),cursor)
    }
    globalThis.update()
}
function raf() {
    if (evt.length>0) processEvents()
    requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
