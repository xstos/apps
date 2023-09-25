/** @jsx JSX */

const {cellx, Cell} = window.cellx
const {reactive, watch, html} = window.arrowJs
const {h, create, diff, patch, VText} = window.virtualDom
const unflat = flat.unflatten
const json = (o)=>JSON.stringify(o,null,2)
const logj = (...items) => log(json(...items))
const {rng} = window

function frag(html) {
    const df = document.createElement('span')
    df.innerHTML = html
    return df.firstChild
}

class ConsoleArea extends HTMLElement {
    constructor() {
        super();
        this.store = reactive({chars: []})
    }
    connectedCallback() {
        const that = this
        const mystore = that.store

        const root = that
        const els = mystore.chars
        that.setAttribute('id','console-area');
        html`<div style="display: block">${derp}</div>`(root);

        function derp() {
            return mystore.chars.map(derp2);

            function derp2(c, i) {
                const value = els[i]
                const id = i+''
                if (value==='enter') {
                    return html`<span id="${id}">${getc2}⏎</span><br>`

                    function getc2() {
                        var dummy = els[id];
                        return ''
                    }
                }

                return html`<span id="${id}">${getc}</span>`

                function getc() {
                    const ret = els[id]
                    return value===' ' ? html`&nbsp` : html`${ret}`
                }

                //return html`<x-cc id="${i}">${c}</x-cc>`;
            }
        }
        function sizerSpan() {
            const sp = document.createElement('span')
            sp.textContent='A'
            return sp
        }
        const container = root.firstElementChild
        const sizer = sizerSpan()
        container.appendChild(sizer)
        const {width,height} = container.getBoundingClientRect()
        const { width: cw, height: ch } = sizer.getBoundingClientRect()
        sizer.remove()
        let [nx,ny] = [width/cw, height/ch]
        nx=Math.floor(nx)
        ny=Math.floor(ny)
        const numChars = nx*ny-1
        mystore.chars.push(...rng(1,numChars-1).map(c=>' '))
        function callback(mutationList, observer) {
            for (const mutation of mutationList) {
                if (mutation.type !== "childList") continue
                const {addedNodes}=mutation
                let node = null
                for (let i = 0; i < addedNodes.length; i++) {
                    node=addedNodes[i]
                    watchVisibility(node)
                }
            }
        }
        function watchVisibility(myel) {
            const observer = new IntersectionObserver((entries) => {
                if(entries[0].isIntersecting) { //visible
                    myel.classList.remove('vh')
                } else {
                    myel.classList.add('vh')
                }
            }, {threshold: 1.0});
            observer.observe(myel)
            return ()=>observer.disconnect()
        }
        const mo = new MutationObserver(callback)
        mo.observe(container, {childList: true});

        function setChars(offset,...items) {
            for (let i = 0; i < items.length; i++) {
                mystore.chars[i]=items[i]
            }
            for (let i = items.length; i < mystore.chars.length; i++) {
                mystore.chars[i]=' '
            }
        }
        that.setChars = setChars

        resizeObserver(root.firstElementChild,e=>{
            log('resize!',e)
        })
    }
}
customElements.define("x-ca", ConsoleArea);


function nullRef() {
    const ret = { rid: null }
    Object.setPrototypeOf(ret,refProto)
    return ret
}

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

const proto = {
    msg(value) {
        const {type,data}=value
        if (type==='keydown') {
            const k = data
            let cur = store.cursor.deref();
            function keq(v) {
                return k===v
            }
            if (k==='ctrl+s') {
                const me = this
                const [openstr,closestr] = <string/>

                cur.surround(openstr,closestr)

            } else if (k==='arrowleft') {
                cur.moveLeft()
            } else if (k==='arrowright') {
                cur.moveRight()
            } else if (k==='delete') {
                cur.deleteAfter()
            }
            else if (k==='backspace') {
                    cur.deleteBefore()
            } else {
                    cur.insertBefore(<c>{k}</c>)
            }

            cur.refresh()
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
    setPrev(node) {
        this.p = node.ref()
        node.n = this.ref()
    },
    refresh() {
        const arr = Array.from(store.rootOpen.deref().fwdIter())
        //log(store.rootOpen.deref().id,...store.nodes)
        var i =0
        const items = arr.map(o=> o.render())
        elById('console-area').setChars(0,...items)
    },
    moveLeft() {
        let [p,n] = this.links()

        if (p.type==='root') return
        this.swap(p)
    },
    moveRight() {
        let [p,n] = this.links()

        if (n.type==='root') return
        n.swap(this)
    },
    insertBefore(node) {
        node=node.deref()

        let [p,n] = this.links()

        if (p.isNull()) {
            store.rootOpen = node.ref()
        } else {
            p.setNext(node)
        }
        node.setNext(this)

    },
    deleteBefore() {
        let [p,n] = this.links()
        if (!p.canDel() || p.isOpeningNode() || p.isClosingNode()) {
            return
        }
        p.type="deleted"
        const [pPrev,_] = p.links()
        connectNodes(pPrev,this)
    },
    deleteAfter() {
        let [p,n] = this.links()
        if (!n.canDel() || n.isOpeningNode() || n.isClosingNode()) {
            return
        }
        n.type="deleted"
        const [_,sib] = n.links()
        connectNodes(this,sib)
    },
    insertAfter(node) {
        node=node.deref()

        let [p,n] = this.links()

        if (n.isNull()) {
            this.setNext(node)
        } else {
            node.setNext(n)
            this.setNext(node)
        }
    },
    surround(before,after) {
        this.insertBefore(before)
        this.insertAfter(after)
    },
    swap(otherNode) {
        otherNode=otherNode.deref()
        let [p,n] = this.links()
        let [p2,n2] = otherNode.links()

        if (n.eq(otherNode)) {
            connectNodes(p,otherNode,this,n)
        } else if (otherNode.eq(p)) {
            connectNodes(p2,this,otherNode,n)
        }
    },
    links() {
        return [this.p.deref(), this.n.deref()]
    },
    render() {
        let {type, value} = this
        return value
    },
    toString() {
        return this.value
    },
    isSingle() {
        const t = this.type
        return t==='cursor' || t === 'c'
    },
    canDel() {
        const t = this.type
        return !(t==='root')
    },
    isOpeningNode() {
        if (!Reflect.has(this,'openId')) return false
        return this.eq(this.openId)
    },
    isClosingNode() {
        if (!Reflect.has(this,'closeId')) return false
        return this.eq(this.closeId)
    }
}
const store = reactive({
    renderNodes: [],
    nodes: [],
    toolbox: [],
})

const cursor = <cursor/>.ref()
store.cursor = cursor
const [rootOpen,rootClosed] = <root/>
store.rootOpen = rootOpen.ref()
store.rootClosed = rootClosed.ref()
connectNodes(rootOpen,cursor,rootClosed)

function connectNodes(...nodes) {
    for (let i = 1; i < nodes.length; i++) {
        const a = nodes[i-1].deref()
        const b = nodes[i].deref()
        a.n = b.ref()
        b.p = a.ref()
    }
}
log(rootOpen,cursor,rootClosed)
function makeNode(type, props, ...children) {
    let closing = Reflect.has(props,'closing')
    delete props.closing
    let ret = {type, ...props, p: nullRef(), n: nullRef()}
    let id
    Object.setPrototypeOf(ret, proto)
    if (!Reflect.has(ret, 'id')) {
        id = getId()
        ret.id = id
        store.nodes[id] = ret
    }
    if (type==="c") {
        ret.value=`${children[0]}`
    } else if (type==="cursor") {
        ret.value='█'
    } else if (type==="root") {
        let prefix = ''
        if (closing) {
            prefix = '/'
        }
        ret.value=`[${prefix}${type}]`
    } else {
        ret.value=`[${type}${id}]`
    }
    return ret;
}

function JSX(type, props, ...children) {
    props=props||{}
    let openNode = makeNode(type, props, ...children);

    if (!openNode.isSingle()) {
        const closingNode = makeNode(type, { closing: true })
        const openId = openNode.ref()
        const closeId = closingNode.ref()
        openNode.openId = closingNode.openId = openId
        openNode.closeId = closingNode.closeId = closeId
        return [openNode,closingNode]
    }
    return openNode
}

const appElement = document.getElementById('app');

document.addEventListener('keydown', (e)=>{
    if (e.target.classList.contains('foc')) {
        const k = getKey(e)
        if (k==="control") return
        if (k==="ctrl+s") e.preventDefault()
        store.cursor.deref().msg({type: 'keydown', data: k})
    }


})

html`<div style="width: 100%" class="dock-container-cols" >
    <div class="" style="max-height: 100vh">
        
        <select style="max-height: 100vh" tabindex="-1" size="100">
            ${rng(1,1000).map(i=>html`<option>${i}derpderp</option>`)}
        </select>
    </div>
    <div style="width:100%; border: 1px dashed red" class="dock-container-rows"  >
        <div class="focusbox" 
             style="
                display: block;
                height: 50%;
                max-height: 50%;
                width: 100%;
                border-bottom: 1px solid black;
                overflow-wrap: anywhere;
                overflow: hidden;
             "
             tabindex="0" 
             @focusin="${(e)=>{
                 e.target.classList.toggle('foc')
                 log('hi')
             }}"
             @focusout="${e=>{
                 e.target.classList.toggle('foc')
             }}"
             @click="${e=>{
                 e.target.focus()
             }}"
        ><x-ca></x-ca></div>
        <div style="display: block;
                height: 50%;
                max-height: 50%;
                width: 100%;
                overflow-wrap: anywhere;
                overflow: hidden;">preview</div>
    </div>
</div>
 `(appElement)

cursor.deref().refresh()



