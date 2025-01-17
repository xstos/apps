const p = /** @type {paper.PaperScope} */ window.paper;
var {Path,Point, PointText, Shape} = p
var canvas = getEl('myCanvas')
canvas.tabIndex=0
var modKeys = {
    Control: 1,
    Shift: 1,
}
const zeroWidthSpace = "​"
const block = "█"
const tiles ={}
canvas.addEventListener('keydown',onKeyDown)
p.setup('myCanvas');
var view = p.view

const tile = new PointText({
    point: [0,0],
    content: block,
    fillColor: 'white',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 20,
    justification: 'left',
});

function measureTextOffset() {
    tile.fillColor.alpha=1
    tile.point=[0,0]
    function getPixel() {
        view.update()
        var imgdata = view.context.getImageData(0,0,1,1)
        var [r,g,b,a] = imgdata.data
        return r
    }
    var last = getPixel()
    var offset=0
    for (let i = 0; i < 100; i++) {
        var pixel = getPixel()
        if (pixel===last) {
            offset++
        } else {
            break
        }
        tile.translate([0,1])
    }
    tile.fillColor.alpha=0
    return offset
}
measureTextOffset()
var path = new Path();
path.strokeColor = 'white';
var start = p.view.bounds.center.add([-50,0]);
var getTileFromMousePos = ()=>{}

path.moveTo(start);
path.lineTo(start.add([ 50, 0 ]));
function center() {
    return p.view.center
}

var pt = new Shape.Circle(center(),10)

pt.fillColor="white"
pt.fillColor.alpha=0.5
p.view.onFrame = function(event) {
    //path.rotate(0.5)
    path.position=center()
}
p.view.onResize=function(event) {
    onResize()
}
onResize()
function onResize() {
    var tileSize = tile.bounds
    var tileWidth = Math.round(tileSize.width)
    var tileHeight = Math.round(tileSize.height-1)
    var bounds = p.view.bounds
    var numCols = div(bounds.width,tileWidth)
    var numRows = div(bounds.height,tileHeight)
    log({numCols,numRows})
    var offset = measureTextOffset()
    for (let i = 0; i < numCols; i++) {
        for (let j = 0; j < numRows; j++) {
            var key = i+" "+j
            if (Reflect.has(tiles,key)) {
                continue
            }
            const tile = new PointText({
                point: [i*tileWidth,j*tileHeight+offset],
                content: block,
                fillColor: paper.Color.random(),
                fontFamily: 'monospace',
                fontWeight: 'bold',
                fontSize: 20,
                justification: 'left',
            });
            tile.fillColor.alpha=0.1
            tiles[key] = {
                tile
            }
        }
    }
    getTileFromMousePos = (point) => {
        var {x,y} = point
        var row = div(y,tileHeight)
        var col = div(x,tileWidth)
        log({row,col})
    }
}
view.onMouseMove = function (e) {
    getTileFromMousePos(e.point)
}
function onKeyDown(e) {
    var key = e.key
    if (modKeys[key]) return
    if (e.ctrlKey) {
        key="ctrl+"+key
    }
    if (e.shiftKey) {
        key="shift+"+key
    }
    log(e,key)
}
