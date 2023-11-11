/** @jsx JSX */

const {cellx, Cell} = window.cellx
const {reactive, watch, html, nextTick} = window.arrowJs
const {h, create, diff, patch, VText} = window.virtualDom
const unflat = flat.unflatten
const json = (o)=>JSON.stringify(o,null,2)
const logj = (...items) => log(json(...items))
const {rng} = window
const cells={}
const entities={}

const c = observerProxy((type, path, value)=>{
    if (type==='set') {
        if (isPlainObject(value)) {
            //const last = lastItem(path)
            //const rest = path.slice(0,-1)
            const pathKey = path.join('.')
            let v, cellkey
            const entries = Reflect.has(cells,pathKey)
                ? cells[pathKey]() : {}
            for (const k in value) {
                v=value[k]
                cellkey = pathKey+"."+k
                entries[k]=getCreateCell(cellkey,v)
            }

            getCreateCell(pathKey, ()=>{
                let ret = {}
                let v
                for (const k in entries) {
                    v=entries[k]
                    ret[k]=v()
                }
                return ret
            })
        }
    } else if (type==='apply') {
        return getCreateCell(path.join('.'))()
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
function getCreateCell(name, value) {
    let ret
    if (Reflect.has(cells,name)) {
        ret = cells[name]
        ret(value)
        return ret
    }
    ret = cellx(value)

    log('create cell',name, value)
    ret.onChange(evt=>{
        const val = evt.data.value
        log(`cell ${name} changed`,JSON.stringify(val))
    })
    cells[name]= ret
    return ret
}

c.canvas.offset={r:0,c:0}
log(c.canvas.offset())
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
    c.canvas = {width, height, colWidth, rowHeight, numCols, numRows}
    //ctx.setTransform(width/height, 0,0,width/height,0,0)
}

c.render= ()=>{
    const {width,height,colWidth,rowHeight,
        numCols,numRows,offset} = c.canvas()
    const { r, c } = offset
    debugger
    let oddXOffs = r % 2
    let oddYOffs = c % 2

    for (let i = 0; i < numCols; i+=2) {
        for (let j = 0; j < numRows; j++) {

        }
    }
    //requestAnimationFrame(render)
}

document.addEventListener('mousedown',(e)=>{

    c('mousedown.pos', {x:e.clientX, y: e.clientY})
})
document.addEventListener('keydown', (e)=>{
    const k = getKey(e)
    if (k==="control") return

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
