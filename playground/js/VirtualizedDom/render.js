import * as ld from 'https://cdn.jsdelivr.net/npm/linkedom@0.18.6/+esm'
var CELL = cellx.cellx
const cells = {}
var bigtxt = ""
fetch("big.txt")
    .then((res) => res.text())
    .then((text) => {
        bigtxt = text
        ld_test()
        //document.body.setAttribute('data-big',text)
    })
    .catch((e) => console.error(e));

function ld_test() {
    const {
        window, document, customElements,
        HTMLElement,
        Event, CustomEvent, MutationObserver
    } = ld.parseHTML(`
  <!doctype html>
  <html lang="en">
    <head>
      <title>Derp</title>
    </head>
    <body>
      
    </body>
  </html>
`);
    var foo = [...Array(1000).keys()]
    var mo = new MutationObserver((rec) => {
        log(rec)
    })
    mo.observe(document.body,{
        subtree:true,
        childList: true,
        attributes:true,
    })
    foo = foo.map(n=>document.createTextNode(n.toString()))
    foo.forEach(n=>document.body.appendChild(n))
    log(document.body.innerHTML)
}

function val(name, value) {
    var cell = cells[name]
    if (!cell) {
        cell = cells[name] = CELL(undefined)
        cell.subscribe(()=>{
            log(name,cell.value)
        })
    }
    if (arguments.length > 1) {
        cell.value=value
        return value
    } else {
        return cell.value
    }
}
class View extends HTMLElement {
    observedAttributes () {
        return []
    }
    constructor() {
        super();
        const thisEl = this
        const s = thisEl.style;
        s.display="block"
        s.width = "100%"
        s.height = "100%"
        s.backgroundColor = "#333638"
        s.overflowWrap = "break-word"
        thisEl.innerHTML = `<x-widget id="cursor" data-sizeme>█</x-widget>`
        this.sz =  thisEl.childNodes[0].getBoundingClientRect()
        thisEl.setAttribute('data-tile-sz',JSON.stringify({w: this.sz.width, h: this.sz.height}))
        thisEl.val = val
        thisEl.$origin_x = CELL(0)
        thisEl.$origin_y = CELL(0)
        const resizeObserver = new ResizeObserver(onResize);

        function onResize(entries) {
            for (const entry of entries) {
                if (entry.contentBoxSize) {
                    const contentBoxSize = entry.contentBoxSize[0];
                    const w = contentBoxSize.inlineSize
                    const h = contentBoxSize.blockSize
                    thisEl.setAttribute('data-sz', JSON.stringify({w,h}))
                    var numRows = w/this.sz.width
                    log(numRows)

                } else {
                }
            }

            console.log("Size changed");
        }

        function mutationObserverCallback(mutationList, observer) {
            for (const mutation of mutationList) {
                if (mutation.type === 'attributes' &&
                    mutation.oldValue !== mutation.target.getAttribute(mutation.attributeName)) {
                    console.log(`The ${mutation.attributeName} attribute was modified.`);
                }
            }
        }
        this.ac = attributeChangedCallback
        this.cc = connectedCallback;
        this.dc = disconnectedCallback;

        function connectedCallback() {
            resizeObserver.observe(thisEl)
            thisEl.mutationObserver = new MutationObserver(mutationObserverCallback);
            thisEl.mutationObserver.observe(thisEl, {
                attributes: true,
                attributeOldValue: true,

            });
        }

        function disconnectedCallback() {
            resizeObserver.unobserve(thisEl)
            thisEl.mutationObserver.disconnect();
        }

        function attributeChangedCallback(name, oldValue, newValue) {
        }
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
class Widget extends HTMLElement {
    constructor() {
        super();
        var thisEl = this
        const s = thisEl.style;
        var parent = thisEl.parentElement
        this.$x=CELL(0)
        this.$y=CELL(0)
        this.$width = CELL(0)
        this.$height = CELL(0)
        //s.position = "absolute";
        this.ac = attributeChangedCallback
        this.cc = connectedCallback;
        this.dc = disconnectedCallback;

        function connectedCallback() {

        }

        function disconnectedCallback() {
        }

        function attributeChangedCallback(name, oldValue, newValue) {
        }
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
customElements.define('x-view',View)
customElements.define('x-widget',Widget)

document.addEventListener("keydown", (e) => {
    const cursor = document.querySelector('#cursor')
    insertBefore(cursor,HTML(`<x-widget>${e.key}</x-widget>`))
    cursor.parentElement.appendChild(HTML(`<x-widget>&nbsp</x-widget>`))
});