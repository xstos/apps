const p = /** @type {paper.PaperScope} */ window.paper;
var {Path,Point, PointText, Shape} = p
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
    point: center(),
    content: 'M',
    fillColor: 'white',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 20,
    justification: 'left'
});
var {width,height } = tile.bounds
tile.point= tile.point.add(-width*0.5,height*0.25)
var pt = new p.Shape.Circle(center(),10)

pt.fillColor="white"
pt.fillColor.alpha=0.5
p.view.onFrame = function(event) {
    path.rotate(0.5)
    path.position=center()
}
