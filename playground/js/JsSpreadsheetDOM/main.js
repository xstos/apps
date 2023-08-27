/** @jsx JSX */

const {cellx, Cell} = window.cellx

var myData = getMeta({
    id: 0
})
function newId() {
    const ret = myData.id
    myData.id++
    return ret
}

function JSX(type, props, children=[]) {
    props=props||{}
    return {type,props,children}
}

const data = reactive({
})

const appElement = document.getElementById('app');
const dockLeft = html`
<div class="flex flex-row">
    <div class="flex-none">
    </div>
    <div class="flex-1">
    </div>
</div>
`;
function listbox() {
    return `
    <select id="lb" size="20">
        <option>table</option>
        <option>button</option>
        <option>2</option>
        <option>2</option>
        <option>2</option>
        <option>2</option>
    </select>
    `
}


class CursorComp extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        (html`<div>▮</div>`)(this.shadowRoot)
    }
    attributeChangedCallback(attrName, oldVal, newVal) {

    }
}
customElements.define("x-cursor", CursorComp);

class SearchBox extends HTMLElement {
    constructor() {
        super();
        //this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        this.id = "searchbox";
        const s = "padding-left: 3px";
        (html`<input style="${s}" type="text" id="sbinput">`)(this)

    }
    attributeChangedCallback(attrName, oldVal, newVal) {

    }
}
customElements.define("x-searchbox", SearchBox);

function findAttr(attr, foundCallback) {
    const ret = document.querySelectorAll(`[${attr}]`);
    if (ret.length>0) {
        foundCallback && foundCallback(ret)
    }
}

function template() {
    return html`
        <div class="flex">
        <x-cursor id="cursor" data-focused></x-cursor>
        </div>
`;
}
function elById(id, found, missing) {
    const el = document.getElementById(id)
    if (el) {
        found && found(el)
    } else {
        missing && missing()
    }
}

function insertAfter(el, newNode) {
    el.parentNode.insertBefore(newNode, el.nextSibling);
}

const ioSwitch = {
    ['`']() {
        elById("searchbox",(el)=>{
            el.remove()
        }, ()=>{
            elById("cursor", (el)=>{
                insertAfter(el,document.createElement("x-searchbox"))

            })
        })
    }
}
function onMsg(msg) {
    log(msg)
    if (msg.type==='io') {
        elById("cursor",(el)=>{
            isFocused(el) && ioSwitch[msg.key]()
        })
    }
}
function isFocused(el) {
    return el.hasAttribute("data-focused")
}

'change dblclick'.split(' ').map(type => {
    document.addEventListener(type, e => {
        onEvent(type, e)
    })
})

function onEvent(type,e) {
    const el = e.target
    log(type,el)
    const { nodeType, nodeName, id } = el
    const { activeElement} = document
    if (nodeType===1) { //element
        const action = actionsById[id]
        if (!action) return
        if (nodeName==="SELECT") {

        }
    }
}

template()(appElement)



bindkeys(onMsg)



function log(...items) {
    console.log(...items)
}

function lorem() { return 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.' }

function bindkeys(onkey, shouldHandleCallback) {

    document.addEventListener('keydown', event => {
        const key = event.key.toLowerCase()

        if (key==="control" || key==="alt" || key==="shift") return
        const mod = [
            event.ctrlKey && "ctrl",
            event.altKey && "alt",
            event.shiftKey && "shift"]
            .filter(v=>v)

        const foo = [...mod, key].join("+")
        if (shouldHandleCallback) {
            const shouldHandle = shouldHandleCallback(event, foo)
            if (shouldHandle === false) return
        }
        pressed({ tag: 'io', key: foo })
    });
    function pressed(e) {
        //console.log(e)
        const o = { type: "io",  key: e.key.toLowerCase() }
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
        data.foo=evt.data.value
        console.log(JSON.stringify(evt.data)) // {"prevValue":2,"value":3}
    })
    num(2)
}

function setMeta(o) {
    const meta = document.getElementById('app')
    Object.entries(o).forEach(([k,v])=>{
        meta.setAttribute("data-"+k,v)
    })
}
function getMeta(o) {
    const meta = document.getElementById('app')
    const ret = {}
    Object.entries(o).forEach(([k,v])=>{
        const hkey = "data-"+k
        var foo = meta.getAttribute(hkey)
        if (!foo) {
            meta.setAttribute("data-"+k,v)
            foo=v
        }
        ret[k]=foo
    })
    return ret
}


//https://dev.to/132/fre-offscreen-rendering-the-fastest-vdom-algorithm-bfn
//https://webreflection.medium.com/bringing-jsx-to-template-literals-1fdfd0901540
//https://stackoverflow.com/questions/71958793/how-does-a-browser-transpile-jsx
//for later https://medium.com/@keshavagrawal/electron-js-react-js-express-js-b0fb2aa8233f
//http://rickardlindberg.me/writing/alan-kay-notes/tr2009016_steps09.pdf
//cells emit change events
//a1=2 b1=a1 is the same as a1 on change set b1=a1

function makeProxy() {
    const f = ()=>{}
    const dom = { type: 'body', props: {}, children: []}
    let get = myget
    let set = myset
    let apply = myapply
    let domProxy = null
    const path = []
    function myget(target, prop, receiver) {
        log('get',prop)
        return domProxy
    }
    function myset(target, key, value) {
        log('set',{key,value})
        let o = dom
        path.forEach((i)=>{
            let el=o.children[i]
            if (!el) {
                el={ type: '', props: {}, children: [] }
                o.children[i]=el
            }
            o=el
        })
        return true
    }
    function myapply(target, thisArg, argumentsList) {
        log('myapply', target, thisArg, argumentsList)
        return domProxy
    }
    domProxy = new Proxy(f,{
        get(target, prop, receiver) {
            path.push(prop)
            return get(target,prop,receiver)
        },
        set(target, key, value) {
            return set(target,key,value)
        },
        apply(target, thisArg, argumentsList) {
            return apply(target,thisArg,argumentsList)
        },
    })
    return domProxy
}
