//import { reactive, html } from 'https://esm.sh/@arrow-js/core';

const dirty = []
const letters = '`abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}\\;:\'"<>,./?'
var mo = new MutationObserver((rec) => {
    console.log("derp", rec)
    dirty.push(rec);
    document.querySelector('X-CURSOR').scrollIntoView(true)
})
mo.observe(getEl('root'), {
    subtree: true,
    childList: true,
    attributes: true,
})
document.addEventListener("keydown", (e) => {
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
        addGlobalStylesToShadowRoot(this.shadowRoot)
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

