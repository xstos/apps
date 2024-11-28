//import { reactive, html } from 'https://esm.sh/@arrow-js/core';

const letters = '`abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}\\;:\'"<>,./?'
var mo = new MutationObserver((rec) => {
    //console.log("derp", rec)
    document.querySelector('X-CURSOR')?.scrollIntoView(true)
})
mo.observe(getEl('root') || document.body, {
    subtree: true,
    childList: true,
    attributes: true,
})
document.addEventListener("keydown", (e) => {
    return
    if (e.altKey) {
        return;
    }

    var key = e.key
    if (key === "Control" || key === "Alt") {
        return;
    }
    if (e.ctrlKey) {
        key = "Control+" + key
    }
    let cursor = document.querySelector('x-cursor')
    const prev = cursor.previousElementSibling;
    const next = cursor.nextElementSibling;
    const parent = cursor.parentElement;

    if (key === "Backspace") {
        remove(cursor.previousSibling)
        return;
    }
    if (key === "Enter") {
        insertBefore(cursor, createElement('br'))
        return;
    }
    if (key === '`') {
        const html = `<x-find><x-cursor></x-cursor></x-find>`
        replace(cursor, HTML(html))
        return;
    }

    if (key === 'ArrowLeft') {
        prev !== null && swap(prev, cursor)
        return;
    }
    if (key === 'ArrowRight') {
        next != null && swap(next, cursor)
        return;
    }
    if (key === 'Delete') {
        next !== null && next.remove()
        return;
    }
    if (key === "Control+ArrowLeft") {
        if (prev === null && isCell(parent)) {
            cursor.remove();
            parent.insertAdjacentElement('beforebegin', cursor)
        }
        if (prev != null && isCell(prev)) {
            cursor.remove()
            prev.appendChild(cursor);
        }
        return;
    }
    if (key === "Control+ArrowRight") {
        if (next === null && isCell(parent)) {
            cursor.remove();
            parent.insertAdjacentElement('afterend', cursor)
        }
        if (next !== null && isCell(next)) {
            cursor.remove();
            next.insertAdjacentElement('afterbegin', cursor);
        }
        return;
    }
    if (key === "Control+Enter") {
        var xc = createElement('x-cell')
        var cur2 = createElement('x-cursor')
        xc.appendChild(cur2)
        replace(cursor, xc);
        return;
    }
    if (key === "Control+Backspace" && isX(parent)) {
        replace(parent, cursor)
        return;
    }
    var xc = createElement('x-c')
    xc.appendChild(createTextNode(key))
    insertBefore(cursor, xc)
});
const CustEls = {
    cell: `[<slot></slot>]<button>🔧</button>`,
    cursor: `█`,
    c: `<slot></slot>`,
    find() {
        return `[🔍<slot></slot>]`
    }
}

class CustEl extends HTMLElement {
    constructor() {
        super();
        var tag = this.tagName.toLowerCase().replace("x-", "")
        const shadow = this.attachShadow({mode: 'open'});
        let o = CustEls[tag];
        addGlobalStylesToShadowRoot(this.shadowRoot, cloneCSS(document.styleSheets[0]))
        shadow.appendChild(HTML(isFunction(o) ? o() : o))
    }

    connectedCallback() {

    }
}

function ce() {
    class Foo extends CustEl {
    }

    return Foo
}

`x-c x-cursor x-cell x-find`.split(' ').forEach(s => customElements.define(s, ce()))
class Dock extends HTMLElement {
    static observedAttributes = ["x-dock"];
    cc = null;
    dc = null;
    ac = null;
    constructor() {
        super();
        var dockEl = this

        //remove text boxes cuz we only support real elements
        dockEl.childNodes.forEach((n,i) => n.nodeType === 3 && n.remove())
        var a = dockEl.childNodes[0]
        var b = dockEl.childNodes[1]

        b.ondblclick = (e) => {
            dockEl.setAttribute("x-dock", nextDock())
            e.stopPropagation()
        }

        function getDock() {
            return dockEl.getAttribute("x-dock")
        }
        function layout() {
            dockEl.style.display = "flex"
            dockEl.style.height="100%"
            dockEl.style.width="100%"
            //dockEl.style.flexWrap="wrap"
            var dock = getDock()

            var ro = new ResizeObserver((entries)=>{
                if (dock==="top") {
                    b.style.height = "100%"
                    b.style.width = ""
                }
                if (dock==="bottom") {
                    b.style.height = "100%"
                    b.style.width = ""
                }
                if (dock==="left") {
                    b.style.width = "100%"
                    b.style.height = ""
                }
                if (dock==="right") {
                    b.style.width = "100%"
                    b.style.height = ""
                }
            })
            ro.observe(dockEl)
            ro.observe(a)
            if (dock==="top") {
                dockEl.style.flexDirection = "column"
            }
            if (dock==="bottom") {
                dockEl.style.flexDirection = "column-reverse"
            }
            if (dock==="left") {
                dockEl.style.flexDirection = "row"
            }
            if (dock==="right") {
                dockEl.style.flexDirection = "row-reverse"
            }
        }
        function nextDock() {
            var d = getDock()
            if (d === "top") return "bottom"
            if (d === "bottom") return "left"
            if (d === "left") return "right"
            if (d === "right") return "top"
            return "top"
        }
        function connectedCallback() {
            layout()
        }

        function disconnectedCallback() {
        }

        function attributeChangedCallback(name, oldv, newv) {
            layout()
        }

        this.ac = attributeChangedCallback
        this.cc = connectedCallback;
        this.dc = disconnectedCallback;
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this.ac(name, oldValue, newValue)
    }

    connectedCallback() {
        this.cc()
    }

    disconnectedCallback() {
        this.dc()
    }
}

customElements.define("x-dock", Dock);
//import * as exports from 'ui.js'
//Object.entries(exports).forEach(([name, exported]) => window[name] = exported);

var grid = GridStack.initAll();

function push() {
    grid[1].addWidget({w: 3, h: 3, content: "new item"});
}

window.push = push;


import morphdom from 'https://cdn.jsdelivr.net/npm/morphdom@2.7.4/+esm'

function test() {
    var foo = createElement('div')
    for (let i = 0; i < 10; i++) {
        var child = createElement('div')
        child.id = i
        child.appendChild(createTextNode(i + ""))
        foo.appendChild(child)
    }
    var root = getEl("root")
    morphdom(root, foo.cloneNode(true))
    log(foo)

    foo.childNodes[2].innerHTML = "yo"
    morphdom(root, foo.cloneNode(true))
}
