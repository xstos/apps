import foo from "./styles.css" with {type: "css"};

const dirty = []
const letters = '`abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}\\;:\'"<>,./?'
var mo = new MutationObserver((rec) => {
    console.log("derp", rec)
    dirty.push(rec);
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

    if (key === "Backspace") {
        remove(cursor.previousSibling)
        return;
    }
    if (key === "Enter") {
        insertBefore(cursor, document.createElement('br'))
        return;
    }
    if (key === '`') {
        replace(cursor, fromtemp('t-search'))
        return;
    }
    const prev = cursor.previousElementSibling;
    const next = cursor.nextElementSibling;
    const parent = cursor.parentElement;

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
        replace(cursor, fromtemp('t-cell'))
        return;
    }
    if (key === "Control+Backspace" && isX(parent)) {
        replace(parent, cursor)
        return;
    }

    insertBefore(cursor, fromtemp('t-char', key))
    const slot = cursor.previousElementSibling.getElementsByTagName('X-SLOT-0')[0]
    replace(slot, document.createTextNode(key))
});

class MoveableElement extends HTMLElement {
    constructor() {
        super();
        var tag = this.tagName.toLowerCase().replace("x-", "")
        this.innerHTML = ''
        var that = this;

        this.appendChild(fromtemp("t-" + tag))

    }

    connectedCallback() {

    }
}

Array.from(document.querySelectorAll('*').values())
    .filter(n => n.tagName.startsWith("X-")).forEach(n => {
    console.log('register ' + n.tagName)
    customElements.define(n.tagName.toLowerCase(), MoveableElement)
})