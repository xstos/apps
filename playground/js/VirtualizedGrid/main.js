function makeEl(html, append) {
    var el = document.createElement('div')
    el.innerHTML = html
    el.style.visibility = "hidden"
    el.style.position = "relative"
    append.appendChild(el)
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

        var g = makeEl('', thisEl);
        var gs = g.style;
        gs.visibility=''
        gs.display="grid"
        gs.position = "sticky"
        gs.top="0px"
        gs.left="0px"
        gs.border="1px solid yellow"
        gs.overflow="hidden"
        var tileSize = {width:0, height:0}
        var ro = new ResizeObserver(sizeChanged)
        var numCols = 0
        var numRows = 0
        var numCells = 0
        var ourSize = {width:0,height:0}
        sizeChanged()
        function sizeChanged() {
            tileSize = tileEl.getBoundingClientRect();
            var oldSize= ourSize
            ourSize = thisEl.getBoundingClientRect()
            if (ourSize.width===oldSize.width && ourSize.height===oldSize.height) {
                return
            }
            log('sizeChanged')

            //gs.display="none"

            var wrecip = 1.0/tileSize.width
            var hrecip = 1.0/tileSize.height
            let innerWidth = ourSize.width-scrollbarSize.width;
            let innerHeight = ourSize.height-scrollbarSize.height;
            gs.width=innerWidth +"px"
            gs.height=innerHeight +"px"
            numCols = Math.floor(innerWidth*wrecip)
            numRows = Math.floor(innerHeight*hrecip)
            numCells = numRows*numCols
            gs.gridTemplateColumns=`repeat(${numCols},${tileSize.width}px)`
            gs.gridTemplateRows=`repeat(${numRows},${tileSize.height}px)`
            var numCellsToAdd = numCells-g.childNodes.length
            var numCellsToRemove = g.childNodes.length-numCells
            var df = document.createDocumentFragment()
            for (let i = 0; i < numCellsToAdd; i++) {
                let node = createElement('span');
                node.innerHTML = 'a'
                df.appendChild(node)
            }
            if (df.children.length>0) {
                g.appendChild(df)
            }
            for (let i = 0; i < numCellsToRemove; i++) {
                g.lastElementChild.remove()
            }
            var ix = 0
            for (let i = 0; i < numCols; i++) {
                for (let j = 0; j < numRows; j++) {
                    var n= g.children[ix];
                    n.id=`${i} ${j}`
                    n.setAttribute('data-num',ix+'')
                    ix++
                }
            }
            gs.display='grid'
            //log(ourSize, tileSize, numRows, numCols)

        }

        this.ac = attributeChangedCallback
        this.cc = connectedCallback;
        this.dc = disconnectedCallback;
        this.m = msg
        var msgMap = {
            height(value) {
                let h = value * tileSize.height;
                heightEl.style.height = h+"px"
            },
            width(value) {
                let w = value * tileSize.width;
                widthEl.style.width = w+"px"
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

grid.msg('height',100)
grid.msg('width',100)