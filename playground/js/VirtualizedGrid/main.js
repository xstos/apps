function makeEl(html, append) {
    var el = document.createElement('div')
    el.innerHTML = html
    el.style.visibility = "hidden"
    el.style.position = "relative"
    //el.style.display="inline-block"
    append.appendChild(el)
    el.style.backgroundColor = "yellow"
    return el;
}
// Usage
const scrollbarSize = getScrollbarSize();
console.log(`Scrollbar width: ${scrollbarSize.width}px`);
console.log(`Scrollbar height: ${scrollbarSize.height}px`);
class Grid extends HTMLElement {
    observedAttributes () {
        return []
    }
    msg() {
        return this.m(...arguments)
    }
    constructor() {
        super();
        const thisEl = this
        const s = thisEl.style;

        s.display="grid"
        s.gridTemplateColumns="0px 1fr"
        s.gridTemplateRows="0px 1fr"
        s.width = "100%"
        s.height = "100%"
        s.backgroundColor = "#333638"
        s.overflow="scroll"
        var tileEl = makeEl('M', thisEl)
        tileEl.style.position="absolute"
        var heightEl = makeEl('', thisEl)
        heightEl.style.width="1px"
        heightEl.setAttribute('data-n',"vertscroll")
        var widthEl = makeEl('',thisEl)
        widthEl.setAttribute('data-n',"horizscroll")
        widthEl.style.height="1px"
        widthEl.style.visibility='collapse'

        var test = makeEl('A', thisEl)
        test.style.backgroundColor=''
        test.style.position = "sticky"
        test.style.visibility=''
        test.style.border="1px solid yellow"

        var tileSize = {width:0, height:0}
        var ro = new ResizeObserver(sizeChanged)
        var numCols = 0
        var numRows = 0
        sizeChanged()
        function sizeChanged() {
            tileSize = tileEl.getBoundingClientRect();
            var ourSize = thisEl.getBoundingClientRect()

            var wrecip = 1.0/tileSize.width
            var hrecip = 1.0/tileSize.height
            numCols = Math.floor(ourSize.width*wrecip)
            numRows = Math.floor(ourSize.height*hrecip)
            test.style.width=ourSize.width-scrollbarSize.width +"px"
            test.style.height=ourSize.height-scrollbarSize.height +"px"
            log(ourSize, tileSize, numRows, numCols)

        }

        this.ac = attributeChangedCallback
        this.cc = connectedCallback;
        this.dc = disconnectedCallback;
        this.m = msg
        var msgMap = {
            height(value) {
                let h = value * tileSize.height;
                heightEl.style.height = h+"px"
                //test.style.top = -h+"px"
            },
            width(value) {
                let w = value * tileSize.width;
                widthEl.style.width = w+"px"
                //test.style.left=-w+"px"
            }
        }
        function msg(key,value) {
            msgMap[key](value)
        }
        function connectedCallback() {
            ro.observe(thisEl)
            ro.observe(tileEl)
        }

        function disconnectedCallback() {
            ro.unobserve(thisEl)
            ro.unobserve(tileEl)
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
customElements.define('x-grid',Grid)

var grid = getEl("root")

//grid.msg('height',100)
//grid.msg('width',100)