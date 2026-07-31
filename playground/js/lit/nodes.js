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
function getIndex(n) {
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
    return nodeById(n[keyParent])
}
function nodeEqual(a,b) {
    return getIndex(a)===getIndex(b)
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
    ['⟪']: topen,
    ['⟫']: tclose,
}

const typeStrings = Object.keys(types)
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
        t=types[tag]
        s=tag
    }
    const nodeData = {s,...emptyNode(), [keyIndex]:i,[keyType]:t,[keyData]:d}
    state.nodes.push(nodeData)
    log(nodeData)
    return nodeData
}
function setEdges(...items) {
    for (let i = 1; i < items.length; i++) {
        const a = items[i-1]
        const b = items[i]
        setEdge(a,b)
    }
}
function setEdge(a,b) {
    a[keyNext] = getIndex(b)
    b[keyPrev] = getIndex(a)
}
function setPair(a,b) {
    a[keyPair] = getIndex(b)
    b[keyPair] = getIndex(a)
}
function setParent(target,parent) {
    target[keyParent]=getIndex(parent)
}
function replace(n,...items) {
    const [prev,next] = [getPrev(n),getNext(n)]
    const p = getParent(n)
    setEdges(prev,...items,next)
    items.forEach(n=>setParent(n,p))
}
const [rootOpen,cursor,rootClosed] = initial = makeNodes("@"+typeStr(topen),"@█","@"+typeStr(tclose))
setPair(rootOpen,rootClosed)
setEdges(...initial)
setParent(cursor,rootOpen)
function processEvents() {
    for (let i = 0; i < evt.length; i++) {
        processEvent(evt[i])
    }
    globalThis.update()
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
            setEdges(prevPrev,cursor)
        }
    } else if (key==="ctrl+enter") {
        const [bOpen,bClose] = makeNodes("@"+typeStr(topen),"@"+typeStr(tclose))
        setPair(bOpen,bClose)
        replace(cursor,cursor,bOpen,bClose)
    } else if (key==="arrowright") {
        const [p,n] = [getPrev(cursor),getNext(cursor)]
        if (!nodeEqual(n,rootClosed)) {
            const nn = getNext(n)
            setEdges(p,n,cursor,nn)
            if (isOpen(n)) {
                setParent(cursor,n)
            }
            if (isClose(n)) {
                const closeParent = getParent(n)
                setParent(cursor,closeParent)
            }
        }
    } else if (key==="arrowleft") {
        const [p,n] = [getPrev(cursor),getNext(cursor)]
        if (!nodeEqual(p, rootOpen)) {
            const pp = getPrev(p)
            setEdges(pp, cursor, p, n)
            if (isOpen(p)) {
                const par = getParent(p)
                setParent(cursor,par)
            }
            if (isClose(p)) {
                const par = getPair(p)
                setParent(cursor,par)
            }
        }
    } else {
        replace(cursor,makeNode(key),cursor)
    }

}
function raf() {
    if (evt.length>0) processEvents()
    requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
