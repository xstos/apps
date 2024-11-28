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

var cell = cellx.cellx
function cellxExample() {
    var availableSpace = cell(0)
    var foo2 = cell(()=>log(availableSpace.value))
    foo2.subscribe(()=>{})
}


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
