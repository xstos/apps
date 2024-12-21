function makeEl(html, append, tag) {
    var el = document.createElement(tag||'div')
    el.innerHTML = html
    el.style.visibility = "hidden"
    el.style.position = "relative"
    append.appendChild(el)
    return el;
}
// Usage
const scrollbarSize = getScrollbarSize();
logj({scrollbarSize});
function makeCells() {
    var store = new Map()
    var views = {}
    var usedRange = { width:0, height:0 }
    function key(row,col) {
        return row+" "+col
    }
    function viewController(name) {
        var view = views[name]
        return {
            move(rowOffset,columnOffset) {
                if (rowOffset<0) {
                    if (view.row+rowOffset<0) {
                        view.row=0
                    } else {
                        view.row+=rowOffset
                    }
                } else if (rowOffset>0) {
                    var bottom = view.row+view.height
                    if (bottom+rowOffset>usedRange.height) {
                        view.row = usedRange.height-view.height
                    } else {
                        view.row+=rowOffset
                    }
                }
            }
        }
    }
    var methods = {
        write(row,col,value) {
            if (_.isString(value)) {
                var startRow = row
                var startCol = col
                for (let i = 0; i < value.length; i++) {
                    var char = value[i]

                    var k = key(row,col)
                    if (usedRange.width<col) {
                        usedRange.width=col
                    }
                    if (usedRange.height<row) {
                        usedRange.height=row
                    }
                    store.set(k,char)
                    if (char==='\n') {
                        col=startCol
                        row++
                    } else {
                        col++
                    }
                }
            }
        },
        view(name,row,column,width,height) {
            if (arguments.length<2) {
                return {}
            }
            views[name]={row,column,width,height}

        }
    }
    function msg(name,...args) {
        return methods[name](...args)
    }
    return msg
}
`This header should be the first thing seen when viewing this Project
Gutenberg file.  Please do not remove it.  Do not change or edit the
header without written permission. Please read the "legal small print," and other information about the
eBook and Project Gutenberg at the bottom of this file.  Included is
important information about your specific rights and restrictions in
how the file may be used.  You can also find out about how to make a
donation to Project Gutenberg, and how to get involved.`.split('')
    .$.set('guten')


var cells = makeCells()
cells('write',3,10,get('guten'))
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
        var dirty = true
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

        var widthEl = makeEl('',thisEl)
        widthEl.style.height="1px"

        var g = makeEl('', thisEl);
        var gs = g.style;
        gs.visibility=''
        gs.position = "sticky"
        gs.top="0px"
        gs.left="0px"
        gs.overflow="hidden"
        var tileSize = {width:0, height:0}
        var ro = new ResizeObserver(sizeChanged)
        var numCols = 0
        var numRows = 0
        var numCells = 0
        var ourSize = {width:0,height:0}
        setInterval(()=>{
            if (dirty) {
                dirty=false
                rebuild()
            }
        },1000)
        function sizeChanged() {
            dirty = true
        }
        thisEl.addEventListener('scroll',()=>{
            log(thisEl.scrollTop)
        })
        rebuild()
        function rebuild() {
            tileSize = tileEl.getBoundingClientRect();
            var oldSize= ourSize
            ourSize = thisEl.getBoundingClientRect()
            if (ourSize.width===oldSize.width && ourSize.height===oldSize.height) {
                return
            }
            log('sizeChanged')

            var wrecip = 1.0/tileSize.width
            var hrecip = 1.0/tileSize.height
            let innerWidth = ourSize.width-scrollbarSize.width;
            let innerHeight = ourSize.height-scrollbarSize.height;
            gs.width=innerWidth +"px"
            gs.height=innerHeight +"px"

            numCols = Math.floor(innerWidth*wrecip)
            numRows = Math.floor(innerHeight*hrecip)
            numCells = numRows*numCols
            gs.border="3px solid white"
            //gs.gridTemplateColumns=`repeat(${numCols},${tileSize.width}px)`
            //gs.gridTemplateRows=`repeat(${numRows},${tileSize.height}px)`
            var existingRowCount = g.children.length
            var rowChange=numRows-existingRowCount
            //var colChange = numCols-tableColumnCount
            if (rowChange>0) {
                var startRow = existingRowCount
                for (let i = 0; i < rowChange; i++) {
                    var row = createElement('div')
                    row.style.display="block"
                    row.style.height=tileSize.height+"px"
                    row.id="r"+startRow+""
                    g.appendChild(row)
                    for (let j = 0; j <= numCols; j++) {
                        var col = createElement('span')
                        col.id=startRow+" "+j
                        row.appendChild(col)
                        col.innerHTML='a'
                    }
                    startRow++

                }
            }
            var df = document.createDocumentFragment()



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
            },
            set(row,col,val) {
                var el = getEl(row+" "+col)
                el.innerHTML=val
            }
        }
        function msg(key,...value) {
            msgMap[key](...value)
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
grid.msg('set',0,0,'_')