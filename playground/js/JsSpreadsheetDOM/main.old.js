/** @jsx JSX */

const {cellx, Cell} = window.cellx
const {reactive, watch, html} = window.arrowJs
const {h, create, diff, patch, VText} = window.virtualDom
const unflat = flat.unflatten
const json = JSON.stringify
const {rng} = window
//need float below component
/*
-time abstraction like rx
-CRUD interface for DOM
-scope and reactive vars like spreadsheet
- self-serialization and restore
- homoiconocity (convertible between code and data)

what is HTML really? a bunch of CRUD data and event handlers leading to more CRUD
can use flat to flatten dom into a map
*/
const store = reactive({
    data: [],
    entities: [],
    clickable: [],
    search: '',
    mylist: rng(1,1000),
    vars: {}
})
const builtin = generateBuiltins()
store.entities.push(...builtin)
store.clickable.push(...builtin.map(e=>e.index))
function jsxCallback(jsxHandler,callback) {
    JSX._customJsx = jsxHandler
    callback()
    JSX._customJsx = null
}
function JSX(type, props, ...children) {
    if (JSX._customJsx) {
        return JSX._customJsx(type,props,...children)
    }
    props=props||{}
    return {type,props,children}
}
function spanExperiment() {
    const f = document.createDocumentFragment()
    jsxCallback((type,props,...children)=>{
        return null
    },()=>{
    })


}
spanExperiment()
function generateBuiltins() {
    const {children: [c]} = <derp>
        z
        y
        q
    </derp>

    return c.split(' ')
        .map((cmd,i)=>{
            return {
                cmd: '+'+cmd,
                selected: i===0,
                hidden: false,
                index: i
            }
        })
}

const appElement = document.getElementById('app');
const dockLeft = html`
<div class="flex flex-row">
    <div class="flex-none">
    </div>
    <div class="flex-1">
    </div>
</div>
`;
/*
tag last focused element
tick mark jumps to search box
jump back after
 */
class SearchBox extends HTMLElement {
    constructor() {
        super();

    }
    connectedCallback() {
        this.id = "searchbox";
        const s = "padding-left: 3px";

        (html`
            <div>
                <div class="flex-none">
                    <input style="${s}" type="text" id="sbinput">
                </div>
                <div class="flex-1">
                    <select tabindex="-1" id="sblist" size="3">
                        <option>div</option>
                        <option>span</option>
                        <option>derp</option>
                    </select>
                </div>    
            </div>
            
            
        `)(this)

    }
    attributeChangedCallback(attrName, oldVal, newVal) {

    }
}
customElements.define("x-searchbox", SearchBox);
function dynArrow(data) {
    if (typeof data === 'string') return data
    let {type,props,children} = data
    props=props||{}
    children=children || []
    let {style, ...attr}=props
    style=style || {}
    attr=Object.entries(attr)
    function HTML(inner) {
        return `html\`${inner}\``
    }
    function ATTR([name, value]) {
        return `${name}="${value}"`
    }
    function PAIR([k,v]) {
        return `${k}: ${v}`
    }
    function STYLE(o) {
        if (!o) return ''
        const pairs = Object.entries(o)
        if (pairs.length<1) return ''
        return `style="${pairs.map(PAIR).join(";")}"`
    }
    function TAG(t, p, c) {
        return `<${t}${p}>${c}</${t}>`
    }
    const stylePairs = STYLE(style)
    const attrs = []
    if (stylePairs.length>0) {
        attrs.push(...stylePairs)
    }
    if (attr.length>0) {
        attrs.push(...attr.map(ATTR))
    }
    const attrStr = attrs.length>0 ? " "+attrs.join(' '): ''
    const childStrs = children.map(c=>{
        if (typeof c ==="string") {
            return c
        }
        return "${()=>"+dynArrow(c)+"}"
    })
    const foo =  HTML(TAG(type,`${attrStr}`,childStrs.length<1 ? '' : childStrs.join('\n')))
    return foo
}
function focusin(el) {
    el.setAttribute('x-focus','')
}
function focusout(el) {
    el.removeAttribute('x-focus')
}
class XSlot extends HTMLElement {
    constructor() {
        super();
        //this.innerHTML='<span></span>'
    }
}
customElements.define("x-slot", XSlot);
class XVirtNode extends HTMLElement {
    static get observedAttributes() {
        return ['data-ix'];
    }
    constructor() {
        super();
        const id = getId()
        const loc = window.store[this.getAttribute('data-src')]
        function connectedCallback() {
        }
        function disconnectedCallback() {
        }
        function attributeChangedCallback(attrName, oldVal, newVal) {
            mystore.attr=newVal
        }
        this.state = {
            connectedCallback,
            attributeChangedCallback,
            disconnectedCallback,
        }
        const that = this
        function getIndex() {
            const ret=Number(that.getAttribute('data-ix'))

            return ret
        }
        const mystore=reactive({
            attr: null
        })

        function cb() {
            const x = mystore.attr
            return loc[getIndex()];
        }

        const ret = html`<div class="block">${cb}</div>`
        ret(this)
    }

    connectedCallback() {
        return this.state.connectedCallback()
    }
    disconnectedCallback() {
        return this.state.disconnectedCallback()
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        return this.state.attributeChangedCallback(attrName, oldVal, newVal)
    }
}
customElements.define("x-vn", XVirtNode);

class XFoo extends HTMLElement {
    static get observedAttributes() {
        return ['data-state'];
    }
    static dummy = (function(){
        document.addEventListener("keyup", (e)=>{
            const key = getKey(e)
            elByAttr('data-type','cursor').msg({type: 'keyup', key})
        })
    })()
    static shared = {
        focusedId: null,
        stores: [],
    }
    constructor() {
        super();
        const shared = XFoo.shared
        const me = this
        const root = me //me.attachShadow({ mode: 'open' });
        const attr = getAttributes(me);
        let {
            ['data-type']: type,
            id
        } = attr
        if (!Reflect.has(attr,'id')) {
            this.setAttribute('id',(id=getId()))
        }
        id=Number(id)
        const store = reactive({
            focused: false,
            editable: false,
            children: [],
            cursori: 0,
            cursorw: 20,
            
        })
        shared.stores[id]=store
        let focusedEl = null


        function storeById(ID) {
            if (arguments.length<1) ID=id
            return shared.stores[ID]
        }
        if (shared.focusedId===null) {
            shared.focusedId=id
        }

        let value = this.textContent
        const kidsId = subid('kids')

        //shadowRoot.adoptedStyleSheets = window.ss
        me._ = {
            connectedCallback,
            disconnectedCallback,
            attributeChangedCallback,
        }
        function connectedCallback() {
            if (type === "cursor") {
                html`<span id="cursor" tabindex="">█</span>`(me);

                me._.msg=(msg) => {

                }
                return
            }
            if (type === "children") {

            }
            if (type === "root") {
                function onKeyUp(e) {
                    const cur = elByAttr('data-type','cursor')
                    log({cur})
                }
                function makeRef(i) {
                    return html`<x-foo data-type="ref" data-i="${i}"></x-foo>`
                }
                function makeRefs() {
                    const r = rng(store.cursori,store.cursori+store.cursorw)
                    return [...r.map(makeRef)]
                }
                html`<span @keyup="${onKeyUp}" data-type="root"><x-foo data-type="cursor"></x-foo>${makeRefs}
                    
                </span>`(me)
                return
                function debugControls() {
                    return html`<em style="font-size: x-small">${()=>json({focused:store.focused})}</em>`
                }
                function toggleEditable() {
                     if (store.editable) {
                         store.editable =false
                     } else {
                         store.editable=true
                     }

                }
                function controlBox() {
                    function createObj(e) {
                        setTimeout(()=>{
                            focusedEl.focus()
                            insertNodeAtCursor(htmlMount`<x-foo data-type="root"></x-foo>`)
                        },100)

                    }
                    return html`<button @click="${createObj}">{}</button>
                    <button @click="${toggleEditable}">e</button>
                `;
                }
                function conditionalControlBox() {
                    if (store.focused) {
                        return html`${controlBox}`
                    }
                    return ''
                }

                function onFocus(e) {
                    log(e)
                    focusedEl = e.target
                    if (shared.focusedId!==id) {
                        storeById(shared.focusedId).focused=false
                        shared.focusedId = id
                    }
                    store.focused = true

                }
                function onBlur(e) {
                    log('blur',e)

                    //e.stopImmediatePropagation()
                    //e.preventDefault()

                    const targ = e.target

                    //store.focused=false
                }
                function onInput(e) {
                    const target = e.target




                }

                html`[${conditionalControlBox}<span 
                        id="${subid('edit')}" 
                        class="box" 
                        tabindex="0" 
                        contenteditable="${()=>store.editable}"
                     @focus="${onFocus}"
                     @input="${onInput}"
                     @blur="${onBlur}"><span><x-foo data-type="cursor"></x-foo></span>X</span>]`.key(id)(root)

                return
            }
        }
        function disconnectedCallback() {
            if (type!=='kvp') return
            mutationObserver.disconnect()

        }
        function attributeChangedCallback(name,oldVal,newVal) {
            //log('attrchg',name,newVal)
        }

        function button(caption, verb) {
            return html`<button data-verb="" @click="${(e)=>{
                
                const ferp = html`<div>hi</div>`
                const frag = document.createDocumentFragment()
                ferp(frag)
                root.getElementById(kidsId).appendChild(frag)
                
            }}">${caption}</button>`
        }
        function subid(txt) {
            return `${id}.${txt}`
        }
        return
        if (type === "controls") {

            html`[controls]
                ${()=>button('obj+',"object.add")}
                <div id="${kidsId}" style="width: 100%;height: 100%;">
                    children
                    <slot></slot>
                </div>
                
            `(root);
            return
        }

        if (type === 'kvp') {

            html`
                <div id="yp">
                    
                    
                </div>
            `(root);
            return
        }

        //todo: create key value pair component
        function controlBox() {
            return html`<div style="">
                <button @click="${(e)=>{
                    moveUp(me);
                    e.target.focus()
                }}">🡅</button>
                <button @click="${(e)=>{
                    moveDown(me);
                    e.target.focus()
                    
                }}">🡇</button>
            </div>`;
        }
        /* todo:
            metaslot
            use blocks to build alarm clock, todo list, json editor
         */
        function renderEditBox() {
            return html`<div style="border: 1px solid red; padding: 1px">[${id}]<span style="overflow-wrap: anywhere;display: inline-block; padding: 2px"
                    contenteditable="true"
             @focus="${()=>store.f=id}"
             @input="${function (e) {

             }}">${value}</span>`
        }
        this.innerHTML=''
        const h=html`${renderEditBox}
        ${()=>store.f===id ? controlBox() : false}
        </span>`;

        //this.innerHTML = '<br>'
        h(root);
    }
    connectedCallback() {
        this._.connectedCallback()
    }
    disconnectedCallback() {
        this._.disconnectedCallback()
    }
    attributeChangedCallback(name, oldVal, newVal) {
        this._.attributeChangedCallback(name, oldVal, newVal)
    }
    msg(...args) {
        return this._.msg(...args)
    }
}
customElements.define("x-foo", XFoo);

class XVirtEl extends HTMLElement {
    constructor() {
        super();
        //this.attachShadow({ mode: 'open' });
        const inner = this.innerHTML

        this.innerHTML = ''
        const cls = "bg-blue-500 hover:bg-blue-700 text-white font-bold rounded"
        function disp(str) {
            function handler(e) {
                mystore.s+=1
            }
            return handler
        }
        const that = this
        const [n,s] = [
            Number(that.getAttribute('data-n')),
            Number(that.getAttribute('data-s')),
        ];
        const mystore = reactive({
            n,
            s
        });
        function tx(val) {
            const r = reactive({ v: 0})
            setTimeout(()=>{
                r.v=val
            },0)
            return ()=>r.v
        }
        const ret = html`
            <button class="${cls}" @click="${disp('grow')}">grow</button>
            <button class="${cls}" @click="${disp('shrink')}">shrink</button>
            ${()=>{
                const {s,n} = mystore
                let num = 0
                const dataSrc = that.getAttribute('data-src')
                return rng(s,s+n-1).map(i=>{
                    return html`<x-vn data-src="${dataSrc}" 
                                      data-ix="${()=>i}" data-key="${num++}"></x-vn>`.key(String(num++))
                })
            }}
        `;
        ret(this)
    }
}
customElements.define("x-virtel", XVirtEl);

class XInput extends HTMLElement {
    constructor() {
        super();
        const bind=this.getAttribute('data-bind')
        const txt = this.innerText
        this.innerHTML = ''

        const ret = html`
        <span class="input-container">
            <div
                class="input-field" 
                contenteditable="true" 
                @input="${(e)=>{
                    store.search=e.target.innerText
                    store.numresults = store.entities.length
                    store.clickable.length=0
                    let hasSel = false
                    store.entities.forEach((e,i)=>{
                        e.hidden = !e.cmd.includes(store.search)
                        if (!e.hidden) store.clickable.push(e.index)
                        if (e.hidden) {
                            e.selected=false
                        }
                        if (e.selected) hasSel = true
                    })
                    if (!hasSel && store.clickable.length>0) {
                        store.entities[store.clickable[0]].selected=true
                    } 
                }}"
                @keydown="${(e)=>{
                    
                    
                    const clickable = store.clickable.map(i=>store.entities[i])
                    const selIndex = clickable.findIndex((v,i)=>v.selected)
                    if (e.keyCode === 40) {
                        
                        if (selIndex<clickable.length-1) {
                            clickable[selIndex].selected=false
                            clickable[selIndex+1].selected=true
                        }
                    }
                    
                }}"
            >
                
            </div>
            <label class="lbl abs bgrad">
                ${txt}
            </label>
        </span>
        `
        ret(this)
    }

}
customElements.define('x-input',XInput)
function appComponent() {
    function searchResults() {
        const searchText = store.search
        return store.entities
            .map((e)=>{
                if (e.hidden) {
                    return false
                }
            return html`<div class="block ${e.selected && 'sel'}">
                ${e.cmd}
            </div>`
        })
    }

    return html`
<!--        <x-virtel data-n="5" data-s="0" data-src="mylist">        </x-virtel>-->
<x-foo data-type="root">
    
</x-foo>

    
    

<div id="preview">preview</div>
`;
}

class XElement extends HTMLElement {
    constructor() {
        super();
        const that = this;
        //that.attachShadow({ mode: 'open' });

        function getOrCreate(key,ctor) {
            let ret = that.getAttribute(key)
            if (ret) {
                return ret
            }
            ret = ctor()
            that.setAttribute(key,ret)
            return ret
        }
        const id = getOrCreate('id', getId)
        function makeId(name) {
            return `${id}.${name}`
        }

        function field(name,value) {
            function onInput(e) {
                const val = e.target.innerText
            }
            const editId = `${id}.edit`
            function tx(val) {
                const r = reactive({ v: undefined})
                setTimeout(()=>{
                    r.v=val
                },1)
                return ()=>r.v
            }
            function getrv(name, getter) {
                if (Reflect.has(store.rv, name)) return getter(store.rv[name])
                return getter(undefined)
            }
            function derp() {
                return `
                min-width: 5ch;
                ${getrv('foo.width', (v)=>v ? 'width:'+v+'px' : '') }
                `
            }

            return html`
                <span class="input-container">
                    <div
                        data-tx-size="${tx('foo')}"
                        class="input-field" 
                        id="${editId}"
                        contenteditable="true" 
                        @input="${onInput}"
                            
                    >
                        ${value}
                    </div>
                    <label for="${id}" class="lbl abs bgrad">
                        ${name}
                    </label>
                    <select style="${derp};display: none;"
                            class="" tabindex="-1" id="sblist" size="3">
                        <option>div</option>
                        <option>span</option>
                        <option>derp</option>
                    </select>
                    
                </span>
            `;
        }
        const template = html`
                <div style="display: inline-block;">
                    ${()=>field("action")}
                    <button class="btn" @click="${()=>that.remove()}">🗑️</button>
                    <button class="btn" @click="${()=>{}}">style+</button>
                    <button class="btn" @click="${()=>{}}">class+</button>
                    <button class="btn" @click="${''}">child+</button>
                    <div class="flex flex-col" style="border: black">
                            
                    </div>
                    
                </div>
                `;
        template(that);

        function connectedCallback() {
            if (that.parentElement.tagName!=='X-E') {
                that.setAttribute('x-root','true')
            }

        };
        function disconnectedCallback() {
        }
        function attributeChangedCallback(attrName, oldVal, newVal) {
        }
        this.state = {
            connectedCallback,
            attributeChangedCallback,
            disconnectedCallback,
        }
    }

    /*
    connectedCallback() {
        const id = this._id
        setTimeout(()=>{

        })


        (html`
            <div>
                ${this._id}
                <input type="text" id="${this._id}" @input="${e => { data.value = e.target.value }}">
                <div style="border: 1px solid black;padding: 1px">
                </div>
            </div>
        `)(this.shadowRoot)

    }
    */

    connectedCallback() {
        return this.state.connectedCallback()
    }
    disconnectedCallback() {
        return this.state.disconnectedCallback()
    }
    attributeChangedCallback(attrName, oldVal, newVal) {
        return this.state.attributeChangedCallback(attrName, oldVal, newVal)
    }

}
customElements.define("x-e", XElement);




function demo() {
    function vn(txt) {
        return h("div", {id: "11"}, [
            String(txt)
        ]);
    }
// 2: Initialise the document
    var count = 0;      // We need some app data. Here we just store a count.

    var tree = vn(count);               // We need an initial tree
    var rootNode = create(tree);     // Create an initial root DOM node ...
    elById("app2").appendChild(rootNode);    // ... and it should be in the document

// 3: Wire up the update logic
    setInterval(function () {
        count++;

        var newTree = vn(count);
        var patches = diff(tree, newTree);
        rootNode = patch(rootNode, patches);
        tree = newTree;
    }, 1000);
}
//demo()

function onMsg(msg) {
    if (msg.type==='io') {
        return
        findAttr("data-io", els=>{
            const {id} = els[0];
            safe(ioSwitch)[id][msg.key](msg.event)
        })
    }
}

function findAttr(attr, foundCallback) {
    const ret = document.querySelectorAll(`[${attr}]`);
    if (ret.length>0) {
        foundCallback && foundCallback(ret)
    }
}
function hasIO(el) {
    return el.hasAttribute("data-io")
}
function setIO(id) {
    findAttr("data-io", (els)=>{
        els.forEach(el=>el.removeAttribute("data-io"))
    })
    elById(id,el=>el.setAttribute("data-io",""))
}
'change dblclick focusin focusout'.split(' ').map(type => {
    document.addEventListener(type, e => {
        onEvent(type, e)
    })
})

function onEvent(type,e) {
    const el = e.target
    if (type==="focusin") {
        focusin(el)
    }
    if (type==="focusout") {
        focusout(el)
    }

    const { nodeType, nodeName, id } = el
    const { activeElement} = document
    if (nodeType===1) { //element
        if (nodeName==="SELECT") {

        }
    }
}
//watchMutations(appElement)
function watchMutations2(el) {
    function callback(mutationList, observer) {
        /*
        for (const mutation of mutationList) {
            if (mutation.type === "childList") {

            } else if (mutation.type === "attributes") {

            }
        }
        */
    }
    new MutationObserver(callback).observe(el, {attributes: true, childList: true});
}
function fragmentExample() {
    console.time('fragex')
    function el() {
        const s = document.createElement('span')
        s.setAttribute('data-id','foo')
        s.appendChild(document.createTextNode(''))
        return s
    }
    const items = rng(0,1).map(el)
    const frag = document.createDocumentFragment()
    //watchMutations2(frag)
    items.forEach(item => {
        frag.appendChild(item)
    })
    //document.body.appendChild(frag)
    console.timeEnd('fragex')

}
fragmentExample()
appComponent()(appElement)

setIO("cursor")

bindkeys(onMsg)


function lorem() { return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' }

function bindkeys(onkey, shouldHandleCallback) {
return
    document.addEventListener('keydown', event => {
        const foo = getKey(event)
        if (shouldHandleCallback) {
            const shouldHandle = shouldHandleCallback(event, foo)
            if (shouldHandle === false) return
        }
        pressed({ tag: 'io', key: foo, event })
    });
    function pressed(e) {
        const o = { type: "io",  key: e.key.toLowerCase(), event: e.event}
        onkey(o)
    }

    /*
    document.addEventListener('click', (event)=> {
      console.log('emitting click events');
    })

    document.addEventListener('dblclick',(event)=>{
      console.log('emitting double click events');
    } )

    document.addEventListener('contextmenu', (event)=>{
      console.log('emitting right click events');
    })

    document.addEventListener('mouseenter',(event)=> {
      console.log("mouse enter, hovering started")
    })

    document.addEventListener('mouseleave', (event)=> {
      console.log("hovering finished")
    })
    */
    return onkey
}

//create renderer for jsx tree maybe cellx proxy wrapper
//reactive assembler!!!
//
function cyclowJsx() {
    return <div>
        <counter>{0}</counter>
        <inc plus$>
            {1}
        </inc>
        <dec minus$>
            {1}
        </dec>
        <_ pipe$>{1}<counter/></_>
        <onClick fun$>
            <_ pipe$><counter/><slot/><counter/></_>
        </onClick>
        <plus button$>
            <caption>+</caption>
            <click>
                <cf-onClick><plus$/></cf-onClick>
            </click>
        </plus>
        <minus button$>
            <caption>-</caption>
            <click>
                <onClick figureOut$><minus$/></onClick>
            </click>
        </minus>
    </div>
}
function cyclowExample() {
    const cyclow = window.cyclow
    const {Block, run} = cyclow

    const Counter = () => Block({
        on: {
            'in.init':  () => counter => 0,
            'dom.increment': () => counter => counter + 1,
            'dom.decrement': () => counter => counter - 1
        },
        view: counter => ({tag:'div#app', content: [
                {tag: 'div.counter', content: `${counter}`},
                {tag: 'div.buttons', content: [
                        {tag: 'button', on: {click: 'decrement'}, content: '-'},
                        {tag: 'button', on: {click: 'increment'}, content: '+'}
                    ]}
            ]})
    })

    run(Counter, {target: 'app2'})
}

function cellxExample() {
    let num = cellx(1);
    let plusOne = cellx(() => num() + 1);
    plusOne.on(Cell.EVENT_CHANGE, (evt) => {
        store.foo=evt.data.value
        console.log(JSON.stringify(evt.data)) // {"prevValue":2,"value":3}
    })
    num(2)
}

//https://www.tiny.cloud/blog/using-html-contenteditable/
//https://dev.to/132/fre-offscreen-rendering-the-fastest-vdom-algorithm-bfn
//https://webreflection.medium.com/bringing-jsx-to-template-literals-1fdfd0901540
//https://stackoverflow.com/questions/71958793/how-does-a-browser-transpile-jsx
//for later https://medium.com/@keshavagrawal/electron-js-react-js-express-js-b0fb2aa8233f
//http://rickardlindberg.me/writing/alan-kay-notes/tr2009016_steps09.pdf
//cells emit change events
//a1=2 b1=a1 is the same as a1 on change set b1=a1

function getId(defaultSeed=1) {
    if (Reflect.has(getId, "_seed")) {
        return ++getId._seed
    }
    getId._seed=defaultSeed
    return defaultSeed
}



function watchMutations(el) {
    function callback(mutationList, observer) {
        for (const mutation of mutationList) {
            if (mutation.type === "childList") {
                //log('mutate child', mutation)
                //console.log("A child node has been added or removed.");
            } else if (mutation.type === "attributes") {
                const {attributeName, oldValue, target}=mutation
                const newValue = target.getAttribute(attributeName)
                onEvent('attributeChanged',{attributeName, oldValue, target, newValue});
                if (newValue!==null) {
                    if (attributeName.startsWith('data-tx-')) {
                        const key = attributeName.replace('data-tx-','')

                        if (key==='size') {
                            function handle(entry) {
                                Object.entries(entry).forEach(([k,v])=>{
                                    rv(`${newValue}.${k}`,v)
                                })
                            }

                            resizeObserver(target, handle)
                        }
                    }
                    if (attributeName.startsWith('data-rx-')) {
                        debugger
                        const [varname,...path] = attributeName.replace('data-rx-','').split('.')
                        //log(varname,...path)
                    }
                }
                //console.log(`The ${mutation.attributeName} attribute was modified.`);
            }
        }
    }
    new MutationObserver(callback).observe(el, {attributes: true, subtree: true, childList: true});
}

function rv(name,...value) {
    if (value.length<1) {
        return store.rv[name]
    }
    store.rv[name]=value[0]
    //watch(()=>store.rv[name], (val)=>log('rv set',name,val))
}



