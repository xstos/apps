/** @jsx JSX */

const {cellx, Cell} = window.cellx
const {reactive, watch, html, nextTick} = window.arrowJs
const {h, create, diff, patch, VText} = window.virtualDom
const unflat = flat.unflatten
const json = (o)=>JSON.stringify(o,null,2)
const logj = (...items) => log(json(...items))
const has = Reflect.has
const {rng} = window
const cells={}
const entities={}
//for simplifity could not bother painting UI, just write elements as text
//there's a search layer for console control, when hitting `, the layer is brought to top
//create block UI widgets like buttons, textboxes and dropdowns/lists
//because we have layers, multiple things can't happen on click
//layers are operators, i.e. create a block then on top of it put uppercase operator
//search layer is a search box at top with mag on left with results below
//viewport layer is below search
//use nearby to collide with boundaries or //keep two maps: includes/not includes
//spec: newline delim, read verb, then push curry to right and repeat until line end
function cmd(str) {
    const lines=str.trim().split('\n')
    log(lines)
}
const backtick = '`'

Object.prototype._=pipe
Object.prototype._reduce=reduceObj

const g = observerProxy((type, path, value)=>{
    if (type==='apply') {
        const dottedPath = path.join('.')
        let curPath
        let ret = value[0]._reduce((accumulator, currentValue, currentIndex, object)=>{
            curPath = dottedPath+"."+currentIndex
            accumulator[curPath]=cell(curPath,currentValue)
            return accumulator
        },{})
        return ret
    }
})

function JSX(type, props, ...children) {
    props=props||{}
    let openNode = makeNode(type, props, ...children);

    if (!openNode.isSingle()) {
        const closingNode = makeNode(type, { closing: true })
        const openId = openNode.ref()
        const closeId = closingNode.ref()
        openNode.openId = closingNode.openId = openId
        openNode.closeId = closingNode.closeId = closeId
        return [openNode,closingNode]
    }
    return openNode
}

html`<canvas id="canvas" style="image-rendering: pixelated"></canvas>`(document.body)
const canvas = elById('canvas')
let ctx = canvas.getContext("2d")

const canvasStyle = canvas.style
canvasStyle.position = "absolute"
canvasStyle.left = "0px"
canvasStyle.top = "0px"

const squareChar = "█"

//todo: paint grid
function cell(name, initialValue) {
    let ret=cells[name]
    if (ret) {
        return ret
    }
    ret = cellx(initialValue)
    cells[name]= ret
    log('create cell',name, initialValue)
    ret.onChange(evt=>{
        const val = evt.data.value
        log(`cell ${name} changed`,JSON.stringify(val))
    })

    return ret
}

var viewport
resizeObserver(document.body,onResize)
onResize()
function onResize(data) {
    let width = window.innerWidth
    let height = window.innerHeight
    canvasStyle.width = width + "px"
    canvasStyle.height = height + "px"
    canvas.width = width
    canvas.height = height
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    ctx.clearRect(0, 0, width, height)
    ctx.font = "12pt courier"
    ctx.imageSmoothingEnabled = false
    ctx.textBaseline = "top"
    ctx.textAlign = "start"
    ctx.fillStyle = "red"
    ctx.fillText(squareChar, 0, 0)
    let img = getImageData(canvas)
    ctx.rect(0, 0, width, height)
    ctx.fillStyle = 'black'
    ctx.fill()
    ctx.fillStyle = "red"
    ctx.fillText(squareChar, 0, 0)
    //ctx.clearRect(0, 0, width, height)
    const colWidth = img.getRow(0).find(v => v.r === 0).x + 1
    const rowHeight = img.getCol(0).find(v => v.r === 0).y + 1
    const numCols = Math.floor(width / colWidth)
    const numRows = Math.floor(height / rowHeight)
    viewport = {width, height, colWidth, rowHeight, numCols, numRows};
    g.viewport({width, height, colWidth, rowHeight, numCols, numRows});

    //ctx.setTransform(width/height, 0,0,width/height,0,0)
}

document.addEventListener('mousemove',(e)=>{
    const [cx,cy] = [e.clientX, e.clientY]
    const [colIndex,rowIndex]=[
        Math.floor(cx / viewport.colWidth),
        Math.floor(cy / viewport.rowHeight),
    ]
    //log(colIndex,rowIndex)

})
document.addEventListener('mousedown',(e)=>{
    const {clientX, clientY} = e;
    const button = e.button === 2 ? "right" : "left"
    g.viewport.mouse.down({ clientX, clientY, button })
})
document.addEventListener('keydown', (e)=>{
    const k = getKey(e)
    if (k==="control") return
    log('keydown',k)
})
canvas.addEventListener('wheel', (e)=>{
    log(e)
})


function getImageData(canvas) {
    const width = canvas.width
    const height = canvas.height
    const imageData = canvas
        .getContext("2d",{alpha: false})
        .getImageData(0, 0, width, height);
    const pixels = imageData.data

    function getPixel(x,y) {
        const index = (y * width + x) * 4; // Each pixel has 4 values (R, G, B, A)
        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        const a = pixels[index + 3];
        return {x,y,r,g,b,a}
    }
    function getPixels() {
        const o = []
        for (let y = 0; y < height; y++) {
            const line = []
            for (let x = 0; x < width; x++) {
                const pixel = getPixel(x,y)
                line.push(pixel)
            }
            o.push(line)
        }
        return o
    }
    function getRow(y) {
        var ret = []
        for (var x = 0; x < width; x++) {
            ret.push(getPixel(x,y))
        }
        return ret
    }
    function getCol(x) {
        var ret = []
        for (var y = 0; y < height; y++) {
            ret.push(getPixel(x,y))
        }
        return ret
    }
    return {
        getRow,
        getCol,
        getPixel,
        getPixels,
    }
}

let c1 = cellx(false)

let c2 = cellx(()=>{
    let v=c1()
    setTimeout(()=>{
        //c1(!v)
    },1000)
    return !v
})
c2.onChange(evt=>{
    const val = evt.data.value
    //log(`c1 changed`,JSON.stringify(val))
})
c1.onChange(evt=>{

})

//c1(true)
