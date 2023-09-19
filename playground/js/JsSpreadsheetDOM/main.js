/** @jsx JSX */

const {cellx, Cell} = window.cellx
const {reactive, watch, html} = window.arrowJs
const {h, create, diff, patch, VText} = window.virtualDom
const unflat = flat.unflatten
const json = JSON.stringify
const {rng} = window
const refProto = {
    ref() {
        return this
    },
    deref() {
        if (this.isNull()) {
            return this
        }
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
    },
    delete() {
        if (this.isNull()) {
            log('warning deleting null')
            return
        }
        this.deref().delete()
    },
    render() {
        return ''
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

            } else if (k==='backspace') {
                store.cursor.deref().deleteBefore()
            } else {
                store.cursor.deref().insertBefore(<txt>{k}</txt>)
            }


        }
    },

    deref() {
      return this
    },
    isNull() {
        return false
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
    setNext(node) {
        this.n = node.ref()
        node.p = this.ref()
    },
    refresh() {
        const arr = Array.from(store.first.deref().fwdIter())
        log(...arr.map(v=>v.value))
        var i =0
        const r = store.renderNodes
        r.length = 0
        r.push(...arr)
    },
    insertBefore(node) {
        node=node.deref()

        let [p,n] = this.links()

        if (p.isNull()) {
            store.first = node.ref()
        } else {
            p.setNext(node)
        }
        node.setNext(this)

        this.refresh()
    },
    deleteBefore() {
        let [p,n] = this.links()
        if (p.isNull()) {
            return
        } else {
            let [p1,n1] = p.deref().links()

            this.p = p1
            if (p1.isNull()) {
                store.first = this.ref()
            } else {
                p1.setNext(this)
            }
        }

        this.refresh()
    },
    links() {
        return [this.p.deref(), this.n.deref()]
    },
    render() {
        const {type} = this
        return html`<span>${this.value}</span>`
    },
    toString() {
        return this.value
    },
    isSingle() {
        return this.type==='cursor' || this.type === 'txt'
    }
}

const store = reactive({
    renderNodes: []
})
store.nodes = []
store.cursor=<cursor single/>.ref()
store.first = store.cursor
store.renderNodes.push(store.cursor.deref())
//store.num=1

function makeNode(type, props, ...children) {
    let ret = {type, ...props, p: nullRef(), n: nullRef()}
    if (type==="txt") {
        ret.value=children[0]
    } else if (type==="cursor") {
        ret.value='█'
    }

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
    let openNode = makeNode(type, props, ...children);

    if (!openNode.isSingle()) {
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
    store.cursor.deref().msg({type: 'keydown', data: k})

})

html`${()=>store.renderNodes.map(n=>n.deref().render())}`(appElement)
