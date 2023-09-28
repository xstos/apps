/** @jsx JSX */

const {cellx, Cell} = window.cellx
const {reactive, watch, html, nextTick} = window.arrowJs
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
function F(cb) {
    return cb()
}
class SW extends HTMLElement {
    static get observedAttributes() {
        return ['data-br'];
    }
    static ctor = F(()=>{
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const id = Number(entry.target.id)
                const rect = entry.target.getBoundingClientRect()

                const data = SW.map.get(id)
                data.top=rect.top
                if (id===0) {
                    data.row=0
                    data.col=0
                } else {
                    const prev = SW.map.get(id-1)
                    data.row=prev.row
                    data.col=prev.col+1
                    const rowChanged = rect.top>prev.top
                    if (rowChanged) {
                        data.col=0
                        data.row=prev.row+1
                    }
                    log('resize', entry.target, rect, data.row,data.col)
                }
            }
        });
        const clipper = new IntersectionObserver((entries) => {
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i]
                if (!entry.isIntersecting) {
                    entry.target.classList.add('vh')
                } else {

                    entry.target.classList.remove('vh')
                }
            }
        }, {threshold: 0.95});
        const map = new Map()
        Object.assign(SW,{
            ro,
            map,
            clipper,
        })

    })
    constructor() {
        super();
    }
    connectedCallback() {
        const parent = this.parentElement
        const nid = Number(parent.id)
        SW.ro.observe(parent)
        //SW.clipper.observe(parent)
        SW.map.set(nid,{
            row: 0,
            col: 0,
        })
        //log('connected',parent)
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName==='data-br') {
            const parent = this.parentElement

            if (oldVal===newVal) return
            log('char br',parent,{oldVal,newVal})
            if (newVal==='') {
                parent.insertAdjacentElement("afterend",document.createElement('br'))
            } else {
                parent.nextElementSibling.remove()
            }
        }
    }
    disconnectedCallback() {
        const parent = this.parentElement
        log('disconnected',parent)
        SW.ro.unobserve(parent)
        SW.clipper.unobserve(parent)
    }
}
customElements.define("x-sw", SW);

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
        html`<div id="spancon" style="display: block; height: 100%; max-height: 100%;">${mapChars}</div>`(root);

        function mapChars() {
            return mystore.chars.map(mapChar);

            function mapChar(c, i) {
                let value = els[i].value //keep this line for arrow-js to detect dependencies
                const id = i+''
                function isBreak() {
                    if (els[i].value==="enter") {
                        return ''
                    }
                    return false
                }

                function getValue() {
                    let value = els[i].value
                    if (value===" ") value="&nbsp"
                    if (value==="enter") value="⏎"
                    return html`${value}`
                }
                return html`<span class="bb" id="${id}">${getValue}<x-sw data-br="${isBreak}"></x-sw></span>`.key(id);
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
        const numChars = 50 //nx*ny-1
        for (let i = 0; i < numChars-1; i++) {
            mystore.chars[i]={ value: ' ' }
        }

        function setChars(items) {
            for (let i = 0; i < items.length; i++) {
                mystore.chars[i]=items[i]
            }
            for (let i = items.length; i < mystore.chars.length; i++) {
                mystore.chars[i]={ value: ' '}
            }
            nextTick(()=>{
            })
        }
        that.setChars = setChars

        resizeObserver(root.firstElementChild,e=>{
            //log('resize!',e)
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
        const items = arr.map(o=> ({value: o.render(), node: o}))
        elById('console-area').setChars(items)
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
    delete() {

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
//log(rootOpen,cursor,rootClosed)
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
        setTimeout(()=>{
            store.cursor.deref().msg({type: 'keydown', data: k})
        },1)
    }
})

html`<div style="width: 100%" class="dock-container-cols" >
    <div class="" style="max-height: 100vh">
        
        <select style="max-height: 100vh" tabindex="-1" size="100">
            ${rng(1,1000).map(i=>html`<option>entity${i}</option>`)}
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



