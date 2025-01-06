const p = /** @type {paper.PaperScope} */ window.paper;
var {Path,Point, PointText, Shape} = p
var canvas = getEl('myCanvas')
canvas.tabIndex=0
var modKeys = {
    Control: 1,
    Shift: 1,
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
canvas.addEventListener('keydown',onKeyDown)
p.setup('myCanvas');
var path = new Path();
path.strokeColor = 'white';
var start = p.view.bounds.center.add([-50,0]);
path.moveTo(start);
path.lineTo(start.add([ 50, 0 ]));
function center() {
    return p.view.center
}
const tile = new PointText({
    point: [0,0],
    content: 'ABCDEF',
    fillColor: 'white',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 20,
    justification: 'left'
});
var {width,height } = tile.bounds
//tile.point= tile.point.add(-width*0.5,height*0.25)
//tile.translate([-width*0.5,height*0.25])
tile.translate([0,height*0.75])
var pt = new Shape.Circle(center(),10)

pt.fillColor="white"
pt.fillColor.alpha=0.5
p.view.onFrame = function(event) {
    //path.rotate(0.5)
    path.position=center()

}
p.view.onResize=function(event) {
    log('resize')
}
