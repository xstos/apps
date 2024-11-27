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
        replace(cursor,HTML(html))
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
    insertBefore(cursor,xc)
});
const CustEls = {
    cell: `[<slot></slot>]<button>🔧</button>`,
    cursor: `█`,
    c: `<slot></slot>`,
    find() { return `[🔍<slot></slot>]` }
}
class CustEl extends HTMLElement {
    constructor() {
        super();
        var tag = this.tagName.toLowerCase().replace("x-", "")
        const shadow = this.attachShadow({ mode: 'open' });
        let o = CustEls[tag];
        addGlobalStylesToShadowRoot(this.shadowRoot, cloneCSS(document.styleSheets[0]))
        shadow.appendChild(HTML(isFunction(o) ? o() : o))
    }

    connectedCallback() {

    }
}
function ce() {
    class Foo extends CustEl {}
    return Foo
}
`x-c x-cursor x-cell x-find`.split(' ').forEach(s=> customElements.define(s,ce()))
class Dock extends HTMLElement {
    cc = null;
    dc = null;
    ac = null;
    constructor() {
        super();
        var dockEl = this
        var parentRect = null
        var dirty = true
        var area = null
        var panel1 = null
        var panel2 = null
        var child1 = null
        var child2 = null
        var roThis = new ResizeObserver(parentSizeChanged)
        var roFirst = new ResizeObserver(debounce_leading(childSizeChanged,100))
        function parentSizeChanged(entries) {
            parentRect = area.getBoundingClientRect();
        }
        function childSizeChanged(entries) {
            var r = area.getBoundingClientRect();
            log(r)
            var r1 = panel1.getBoundingClientRect()
            panel2.style.top = r1.height+1+"px"
            panel2.style.height = r.height-r1.height-1+"px"
            panel2.style.width = r.width+"px"
        }

        //thisPanel.appendChild(a)
        // otherPanel.appendChild(b)
        // thisElem.appendChild(otherPanel)
        // thisPanel = thisElem.children[0]
        // otherPanel = thisElem.children[1]
        // log(thisPanel)


        function initChildren() {
            var children = Array.from(dockEl.childNodes).filter(n=>n.nodeType!==3)
            child1 = children[0];
            child2 = children[1];
            child1.remove()
            child2.remove()
            dockEl.innerHTML=``
            area = HTML(`<div><div></div><div></div></div>`)

            dockEl.appendChild(area)
            area = dockEl.childNodes[0]
            area.style.width="100%"
            area.style.height="100%"
            panel1 = area.childNodes[0]
            panel2 = area.childNodes[1]
            panel1.style.position="absolute"
            panel2.style.position="absolute"
            panel1.appendChild(child1)
            panel2.appendChild(child2)
            child1 = panel1.childNodes[0]
            child2 = panel2.childNodes[0]
            panel1.style.width="100%"
        }

        function connectedCallback() {
            var dir = this.getAttribute("x-dock")
            initChildren()
            roThis.observe(area)
            roFirst.observe(child1)
        }
        function disconnectedCallback() {
            roThis.unobserve(dockEl.parentElement)
        }
        function attr(name, oldv, newv) {

        }
        this.ac=attr
        this.cc=connectedCallback;
        this.dc=disconnectedCallback;
    }
    static observedAttributes = ["x-dock"];
    attributeChangedCallback(name, oldValue, newValue) {
        this.ac(name,oldValue,newValue)
        console.log(`Attribute ${name} has changed. ${newValue}`);
    }
    connectedCallback() {
        this.cc()
    }
    disconnectedCallback() {
        this.dc()
    }
}
customElements.define("x-dock",Dock);
//import * as exports from 'ui.js'
//Object.entries(exports).forEach(([name, exported]) => window[name] = exported);

var grid = GridStack.initAll();

function push() {
    grid[1].addWidget({w:3, h:3, content:"new item"});
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
