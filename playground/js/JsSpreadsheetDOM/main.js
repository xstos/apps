/** @jsx JSX */

const {cellx, Cell} = window.cellx
const {reactive, watch, html, nextTick} = window.arrowJs
const {h, create, diff, patch, VText} = window.virtualDom
const unflat = flat.unflatten
const json = (o)=>JSON.stringify(o,null,2)
const logj = (...items) => log(json(...items))
const {rng} = window
let refreshConsole = ()=>{}
const newline = "↵"
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
                return
                const id = Number(entry.target.id)
                const target = entry.target
                const rect = target.getBoundingClientRect()
                debugger
                const data = SW.map.get(id)
                data.top=rect.top
                if (id===0) {
                    data.row=0
                    data.col=0
                } else {
                    const prev = SW.map.get(id-1)
                    data.row=prev.row
                    data.col=prev.col+1
                    const rowChanged = rect.top>prev.top+2 //+2 is jitter
                    if (rowChanged) {

                        data.col=0
                        data.row=prev.row+1
                    }
                    //log('resize', entry.target, rect, data.row,data.col)
                }
            }
        });
        const clipper = new IntersectionObserver((entries) => {
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i]
                const target = entry.target
                const id = Number(target.id)
                const data = SW.map.get(id)

                if (entry.isIntersecting) {
                    target.classList.remove('vh')
                } else {
                    //log('clipped',entry.target)
                    target.classList.add('vh')
                }
            }
        }, {threshold: 0.95});
        const map = new Map()
        Object.assign(SW,{
            ro,
            map,
            clipper,
            gridSize: { rows: 0, cols: 0 }
        })

    })
    constructor() {
        super();
    }
    connectedCallback() {
        const parent = this.parentElement
        const nid = Number(parent.id)
        SW.ro.observe(parent)
        SW.clipper.observe(parent)
        SW.map.set(nid,{
            row: 0,
            col: 0,
        })
        //log('connected',parent)
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName==='data-br') {
            const parent = this.parentElement
            return
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
function sizerSpan() {
    return (htmlMount`<span class="ib"><span class="bb">a</span></span>`).childNodes[0]
}

function renderNode(i, getValue2, cw) {
    //log('render',i)
    const id = i+''
    function isBreak() {
        if (getValue2()==="enter") {
            return ''
        }
        return false
    }
    getValue2()
    function getValue() {
        let value = getValue2()
        function makeChar(txt) {
            return html`${txt}`
            return html`<span class="ib" style="width: ${cw}px">${txt}</span>`
        }
        if (value===" ") {
            return html`&nbsp`
            return makeChar("&nbsp")

        }
        if (value==="enter") {
            return html`⏎`
            return makeChar("⏎")
        }
        const chars = getValue2().split('')
        return makeChar(value)
        return html`${()=>chars.map(makeChar)}`
    }

    return html`<span class="bb" id="${id}">${getValue}<x-sw data-br="${isBreak}"></x-sw></span>`.key(id);
}
var mystore
class ConsoleArea extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        mystore = reactive({chars: []})
        onResize(this.parentElement)
        const that = this
        const root = that
        that.setAttribute('id','console-area');
        const style = `display: block; height: 100%; max-height: 100%;padding: 0px;margin: 0px;`;
        html`<div id="spancon" style="${style}">${mapChars}</div>`(root);

        function onResize(container1) {
            const containerRect = container1.getBoundingClientRect()
            const sizer = sizerSpan()
            container1.appendChild(sizer)
            const sizerRect = sizer.getBoundingClientRect()
            sizer.remove()

            width = containerRect.width
            height = containerRect.height
            cw = sizerRect.width
            ch = sizerRect.height
            numCols = Math.floor(width/cw)
            numRows = Math.floor(height/ch)
            log(numCols,numRows)
            numChars = numCols*numRows
            let val
            for (let i = 0; i < numChars; i++) {
                //val = ((i+1)%10)+''
                val = ' '
                if (!mystore.chars[i]) {
                    mystore.chars[i]={ value: val }
                } else {
                    mystore.chars[i].value=' '
                }

            }
        }

        const container = root.firstElementChild
        let width,height, cw, ch, numCols, numRows, numChars

        onResize(container)

        function mapChars() {
            return mystore.chars.map((c,i)=>{
                function getValue() {
                    return mystore.chars[i].value
                }
                return renderNode(i, getValue, cw)
            });
        }

        function fwdIter() {
            return store.rootOpen.deref().fwdIter()
        }
        function setChars(items) {
            const iter = fwdIter()

            var widthRemaining = numCols
            var currentRow = []
            var lines=[]
            var cursorLineIndex = 0
            var charIndex = 0
            var current
            var node
            var i,j
            function step() {
                current = iter()
                node = current.value
            }

            function nextRow() {
                for (var i = 0; i < widthRemaining; i++) {
                    currentRow.push(spaceNode())
                }

                lines.push(currentRow)
                currentRow = []
                widthRemaining = numCols
            }
            step()
            while(!current.done) {
                const {width} = node.size()
                if (node.type==="cursor") {
                    cursorLineIndex=lines.length-1
                }

                if (width>widthRemaining) {
                    nextRow()
                } else if (node.type==="c" && node.value==="enter") {
                    widthRemaining -= width
                    currentRow.push(node)
                    nextRow()
                } else {
                    widthRemaining -= width
                    currentRow.push(node)
                }

                step()
                if (current.done) {
                    nextRow()
                }
            }
            function blankLine() {
                return rng(0,numCols-1).map(spaceNode)
            }
            /*
            for (i = ll; i < numRows; i++) {
                var blankline = rng(0,numCols-1).map(spaceNode)
                lines.push(blankline)
            }
             */


            const halfRows = Math.floor(numRows/2)
            var start = Math.max(cursorLineIndex-halfRows,0)
            var end = cursorLineIndex+halfRows
            //start=0
            end=20
            charIndex=0
            var curLine
            for (i = start; i < end; i++) {
                curLine = lines[i]
                if (!curLine) {
                    curLine = blankLine()
                }
                for (j = 0; j < curLine.length; j++) {
                    node = curLine[j]
                    if (!node) {
                        node = spaceNode()
                    }
                    const newval = node.render()
                    const old = mystore.chars[charIndex].value
                    if (old!==newval) {
                        log(charIndex,old,newval)
                        mystore.chars[charIndex].value=newval
                    }

                    charIndex++
                }
            }

            nextTick(()=>{
            })
        }
        that.setChars = setChars
        resizeObserver(root.firstElementChild,e=>{
            log('resize!',e)
            onResize(container)
            setChars('')
        })
    }
}
customElements.define("x-ca", ConsoleArea);
var sync
class ConsoleArea2 extends HTMLElement {
    constructor() {
        super();

    }
    connectedCallback() {
        var store = reactive({
            size: { w:0, h:0},
        })
        function render() {
            log('render')
            return html`<span>${()=>rng(0,store.size.h-1).map(mapRows)}</span>`

            function mapRows(lineIndex) {
                const {w,h} = store.size
                return html`<span id="r${lineIndex}">
                ${()=>rng(0, store.size.w-1).map(mapCols)}
            </span><br>`.key("r" + lineIndex)

                function mapCols(colIndex) {
                    const {w,h} = store.size
                    const id = `r${lineIndex}c${colIndex}`
                    return html`<span class="bb c" id="${id}">&nbsp</span>`.key(id)
                }
            }
        }
        html`${render}`(this)
        const that = this.parentElement
        var numCols, numRows
        that.addEventListener('scroll',(e)=>{
            log(e)
        })
        function resize() {
            const containerRect = that.getBoundingClientRect()
            const sizer = sizerSpan()
            that.appendChild(sizer)
            const sizerRect = sizer.getBoundingClientRect()
            sizer.remove()
            var width = containerRect.width
            var height = containerRect.height
            var cw = sizerRect.width
            var ch = sizerRect.height
            numCols = Math.floor(width/cw)
            numRows = Math.floor(height/ch)
            log(numCols,numRows)
        }
        resize()
        resizeObserver(this.parentElement,(data)=>{
            store.size.w=0
            store.size.h=0
            nextTick(()=>{
                resize()
                mysync()
            })
        })

        function mysync() {
            let cr=0,cc=0
            var line = []
            var lines = [line]
            var maxw = 0
            var node
            for (const n of iter(fwdIter())) {
                line.push(n)

                if (n.type==='cursor') {
                    cr=lines.length-1
                    cc=line.length-1
                }
                if (n.type==='c' && n.value==="enter") {
                    maxw = Math.max(maxw,line.length)
                    line=[]
                    lines.push(line)
                }
            }
            maxw = Math.max(maxw,lines[lines.length-1].length)
            //log({maxw})
            store.size.w=Math.min(maxw, numCols)
            store.size.h=Math.min(lines.length,numRows)
            function spray() {

                for (let i = 0; i < lines.length; i++) {
                    line = lines[i]
                    for (let j = 0; j < maxw; j++) {
                        node= line[j]

                        const el = elById("r"+i+"c"+j)
                        if (!el) {
                            break
                        } else {
                            if (node) {
                                var value = node.value
                                if (value===' ') {
                                    el.innerHTML="&nbsp"
                                } else if (value==="enter") {
                                    value=newline
                                    el.innerText = newline
                                } else {
                                    el.innerText=value
                                }
                            } else {
                                el.innerText=' '

                            }
                        }
                    }
                }
            }
            nextTick(()=>{
                spray()
            })

        }
        sync=mysync
    }
}
customElements.define("x-ca2", ConsoleArea2);

function fwdIter() {
    return store.rootOpen.deref().fwdIter()
}
function nullRef() {
    const ret = { rid: null }
    Object.setPrototypeOf(ret,refProto)
    return ret
}
function refresh() {
    let cur = store.cursor.deref();
    cur.refresh()
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

        return myiter
    },
    setNext(node) {
        this.n = node.ref()
        node.p = this.ref()
    },
    setPrev(node) {
        this.p = node.ref()
        node.n = this.ref()
    },
    size() {
        if (this.type==='c' && this.value==="enter") {
            return { width: 1, height: 1}
        }
        return { width: this.render().length, height: 1 }
    },
    refresh() {

        let items = []
        /*
        //log(store.rootOpen.deref().id,...store.nodes)
        items = Array.from(iter(fwdIter())).map(o=> {
            let ret = {value: o.render(), node: o}
            return ret
        })
        */
        sync()
        //elById('console-area').setChars(items)
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
    },
}

function spaceNode() {
    if (!spaceNode._value) {
        const spcNode = makeNode('c',{},' ')
        Object.seal(spcNode)
        spaceNode._value = spcNode
    }
    return spaceNode._value
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
        throw new Error('oops')
        return ''
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
    let ret = {value: null, type, ...props, p: nullRef(), n: nullRef()}
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
            refresh()
        },1)
    }
})

/*
focusbox
overflow-wrap: anywhere;
overflow: hidden;
 */
html`<div style="width: 100%;" class="dock-container-cols" >
    <div class="" style="max-height: 100vh">
        <select style="max-height: 100vh" tabindex="-1" size="100">
            ${rng(1,1000).map(i=>html`<option>entity${i}</option>`)}
        </select>
    </div>
    <div style="width:100%; border: 1px dashed rgba(255,0,0,0.5);" class="dock-container-rows"  >
        <div class="focusbox" 
             style="
                display: block;
                height: 50%;
                max-height: 50%;
                width: 100%;
                border-bottom: 1px solid white;
                white-space: nowrap;
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
        ><x-ca2></x-ca2></div>
        <div style="display: block;
                height: 50%;
                max-height: 50%;
                width: 100%;
                overflow-wrap: anywhere;
                overflow: hidden;">preview</div>
    </div>
</div>
 `(appElement)

document.addEventListener('click', (e)=>{
    log('click',e)
})

function keys(...k) {
    const cur = store.cursor.deref()
    k.forEach(c=>cur.msg({type: 'keydown', data:c}))
}

keys('a','enter','b', ...lorem(), 'enter', ...lorem(), 'enter')

refresh()
function lorem() { return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'.split('') }


function test(i,c) {
    s.chars[i]= { value: c }
}

