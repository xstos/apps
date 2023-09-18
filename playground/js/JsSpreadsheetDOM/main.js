/** @jsx JSX */

const {cellx, Cell} = window.cellx
const {reactive, watch, html} = window.arrowJs
const {h, create, diff, patch, VText} = window.virtualDom
const unflat = flat.unflatten
const json = JSON.stringify
const {rng} = window
const refProto = {
    deref() {
        return store.nodes[this.rid]
    },
    isNull() {
        return this.rid===null
    },
    fwdIter() {
        return this.deref().fwdIter()
    },
    eq(other) {
        other=other.ref()
        return this.rid===other.rid
    }
}
function nullRef() {
    const ret = { rid: null }
    Object.setPrototypeOf(ret,refProto)
    return ret
}
const proto = {
    msg(value) {
        const {type,data}=value
        if (type==='keydown') {
            const k = data
            if (k==='ctrl+s') {
                const me = this
                const stra = <string/>

            }
        }
    },
    deref() {
      return this
    },
    eq(other) {
        other = other.deref()
        return this.id===other.id
    },
    ref() {
        const rid = this.id
        const ret = { rid }
        Object.setPrototypeOf(ret,refProto)
        return ret
    },
    fwdIter() {
        let current = this
        let ret
        let done = false
        function myiter() {
            if (done) {
                return {done}
            }

            if (current.n.isNull()) {
                done=true
                return {value: current, done: false}
            }
            ret = current
            current = current.n.deref()
            return {value: ret, done: false}
        }

        return iter(myiter)
    },
    toFwdArray() {
      return Array.from(this.fwdIter())
    },
    insertBefore(node) {
        node=node.deref()
        if (store.first.eq(this)) {
            store.first = node
        }
        let [p,n] = this.links()
        let [pb, nb] = node.links()
        node.p=p
        node.n=this.ref()
        this.p=node.ref()
    },
    links() {
        return [this.p, this.n]
    },
    render() {
        const {type} = this
        if (type==='cursor') {
            return '█'
        }
        return type
    }
}
// null.cur.null
const store = reactive({})
store.nodes = []
store.cursor=<cursor single/>.ref()
store.first = store.cursor

store.cursor.deref().insertBefore(<foo/>)
log(Array.from(store.first.fwdIter()))


function makeNode(type, props) {
    let ret = {type, ...props, p: nullRef(), n: nullRef()}
    let id
    Object.setPrototypeOf(ret, proto)
    if (!Reflect.has(ret, 'id')) {
        id = getId()
        ret.id = id
        store.nodes[id] = ret
    }
    return ret;
}

function JSX(type, props, ...children) {
    props=props||{}
    let openNode = makeNode(type, props);
    if (!Reflect.has(openNode,'single')) {
        const closingNode = makeNode('/'+type, {})
        const openId = openNode.ref()
        const closeId = closingNode.ref()
        openNode.openId = closingNode.openId = openId
        openNode.closeId = closingNode.closeId = closeId
    }
    return openNode
}

const appElement = document.getElementById('app');




document.addEventListener('keydown', (e)=>{
    const k =getKey(e)
    store.cursor.msg({type: 'keydown', data: k})

})

html`${store.first.toFwdArray().map(n=>n.render())}`(appElement)
